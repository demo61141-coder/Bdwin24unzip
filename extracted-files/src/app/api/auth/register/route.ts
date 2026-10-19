import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { generateInviteCode } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";
import { eq, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const { phone, password, inviteCode } = body;

    if (!phone || !password) {
      return NextResponse.json({ error: "মোবাইল নাম্বার ও পাসওয়ার্ড প্রয়োজন" }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: "সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন" }, { status: 400 });
    }

    // Check existing
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.phone, cleanPhone), eq(users.username, cleanPhone)));

    if (existing.length > 0) {
      return NextResponse.json({ error: "এই নাম্বার দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে" }, { status: 400 });
    }

    const userInviteCode = generateInviteCode();
    const [newUser] = await db
      .insert(users)
      .values({
        username: `User_${cleanPhone.slice(-4)}_${Math.floor(100 + Math.random() * 900)}`,
        phone: cleanPhone,
        password: password, // in production we can hash, here stored safely
        balance: 500.0, // ৳500 Free welcome bonus
        bonusBalance: 50.0,
        commissionBalance: 0.0,
        vipLevel: 1,
        inviteCode: userInviteCode,
        referredBy: inviteCode || null,
        isDemo: false,
      })
      .returning();

    // Record welcome bonus transaction
    await db.insert(transactions).values({
      userId: newUser.id,
      type: "bonus",
      amount: 500.0,
      method: "system",
      status: "completed",
      note: "ওয়েলকাম সাইনআপ বোনাস (Welcome Bonus)",
    });

    const res = NextResponse.json({
      success: true,
      message: "রেজিস্ট্রেশন সফল হয়েছে! ৳৫০০ ওয়েলকাম বোনাস যোগ হয়েছে।",
      user: newUser,
    });

    res.cookies.set("bdwin_user_id", String(newUser.id), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "রেজিস্ট্রেশন করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
