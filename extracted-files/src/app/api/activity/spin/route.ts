import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

const WHEEL_PRIZES = [10, 20, 50, 100, 200, 500, 1000, 5000];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অনুগ্রহ করে প্রথমে লগইন করুন" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    // User gets 1 free spin daily, or spin costs ৳20
    const isFree = user.lastSpinDate !== todayStr;

    if (!isFree && user.balance < 20) {
      return NextResponse.json({ error: "আজকের ফ্রি স্পিন শেষ! পেইড স্পিনের জন্য ব্যালেন্সে কমপক্ষে ৳২০ থাকতে হবে।" }, { status: 400 });
    }

    // Weighted random
    const weights = [35, 25, 18, 12, 6, 2.5, 1, 0.5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;

    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      if (rand < weights[i]) {
        selectedIndex = i;
        break;
      }
      rand -= weights[i];
    }

    const prize = WHEEL_PRIZES[selectedIndex];
    const cost = isFree ? 0 : 20;
    const newBalance = user.balance - cost + prize;

    await db
      .update(users)
      .set({
        balance: newBalance,
        lastSpinDate: todayStr,
      })
      .where(eq(users.id, user.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "spin_reward",
      amount: prize,
      method: "system",
      status: "completed",
      note: `লাকি হুইল পুরস্কার - ৳${prize}`,
    });

    return NextResponse.json({
      success: true,
      selectedIndex,
      prize,
      isFree,
      message: `অভিনন্দন! লাকি হুইল থেকে আপনি ৳${prize} জিতেছেন!`,
      newBalance,
    });
  } catch (error) {
    console.error("Spin error:", error);
    return NextResponse.json({ error: "স্পিন সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
