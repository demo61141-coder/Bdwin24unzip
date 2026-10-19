import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { generateInviteCode } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";

export async function POST() {
  try {
    await ensureSeedData();
    const demoRandom = Math.floor(1000 + Math.random() * 9000);
    const demoPhone = `0199999${demoRandom}`;
    const demoUsername = `Demo_VIP_${demoRandom}`;

    const [demoUser] = await db
      .insert(users)
      .values({
        username: demoUsername,
        phone: demoPhone,
        password: "demo_password",
        balance: 1000.0, // ৳1000 demo play balance
        bonusBalance: 100.0,
        commissionBalance: 0.0,
        vipLevel: 2,
        inviteCode: generateInviteCode(),
        isDemo: true,
      })
      .returning();

    const res = NextResponse.json({
      success: true,
      message: "ডেমো মোড চালু হয়েছে (৳১,০০০ ব্যালেন্স)!",
      user: demoUser,
    });

    res.cookies.set("bdwin_user_id", String(demoUser.id), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Demo user error:", error);
    return NextResponse.json({ error: "ডেমো অ্যাকাউন্ট তৈরি করা যায়নি" }, { status: 500 });
  }
}
