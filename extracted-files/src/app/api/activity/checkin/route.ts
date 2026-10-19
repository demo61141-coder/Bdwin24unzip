import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

const REWARDS = [10, 20, 30, 50, 80, 120, 200]; // Days 1 to 7

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অনুগ্রহ করে প্রথমে লগইন করুন" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (user.lastCheckInDate === todayStr) {
      return NextResponse.json({ error: "আপনি আজকের দৈনিক বোনাস ইতিমধ্যে গ্রহণ করেছেন!" }, { status: 400 });
    }

    let streak = (user.checkInStreak || 0) + 1;
    if (streak > 7) streak = 1;

    const rewardAmount = REWARDS[streak - 1];
    const newBalance = user.balance + rewardAmount;

    await db
      .update(users)
      .set({
        balance: newBalance,
        lastCheckInDate: todayStr,
        checkInStreak: streak,
      })
      .where(eq(users.id, user.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "bonus",
      amount: rewardAmount,
      method: "system",
      status: "completed",
      note: `দৈনিক চেক-ইন বোনাস (দিন ${streak})`,
    });

    return NextResponse.json({
      success: true,
      message: `অভিনন্দন! দিন ${streak} এর দৈনিক বোনাস ৳${rewardAmount} যোগ হয়েছে!`,
      rewardAmount,
      streak,
      newBalance,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "চেক-ইন সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
