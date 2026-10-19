import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeedData } from "@/lib/seed";
import { eq, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ error: "মোবাইল নাম্বার ও পাসওয়ার্ড দিন" }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.phone, cleanPhone), eq(users.username, cleanPhone)));

    if (!user) {
      return NextResponse.json({ error: "কোনো অ্যাকাউন্ট পাওয়া যায়নি, অনুগ্রহ করে রেজিস্ট্রেশন করুন" }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "ভুল পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন" }, { status: 401 });
    }

    const res = NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে!",
      user,
    });

    res.cookies.set("bdwin_user_id", String(user.id), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "লগইন করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
