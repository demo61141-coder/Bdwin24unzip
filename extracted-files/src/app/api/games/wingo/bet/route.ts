import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, gameBets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অনুগ্রহ করে প্রথমে লগইন করুন" }, { status: 401 });
    }

    const body = await req.json();
    const { periodNumber, prediction, amount } = body;

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount < 10) {
      return NextResponse.json({ error: "সর্বনিম্ন বেটের পরিমাণ ৳১০" }, { status: 400 });
    }

    if (user.balance < betAmount) {
      return NextResponse.json({ error: "পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন" }, { status: 400 });
    }

    if (!prediction || !periodNumber) {
      return NextResponse.json({ error: "সঠিক প্রিডিকশন ও পিরিয়ড নির্বাচন করুন" }, { status: 400 });
    }

    // Deduct balance
    const newBalance = user.balance - betAmount;
    await db
      .update(users)
      .set({
        balance: newBalance,
        totalBetAmount: (user.totalBetAmount || 0) + betAmount,
      })
      .where(eq(users.id, user.id));

    // Create bet entry
    const [bet] = await db
      .insert(gameBets)
      .values({
        userId: user.id,
        gameType: "wingo",
        betAmount,
        prediction: String(prediction),
        periodNumber: String(periodNumber),
        isWin: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `বেট সফলভাবে যোগ হয়েছে (৳${betAmount} on ${prediction.toUpperCase()})`,
      bet,
      newBalance,
    });
  } catch (error) {
    console.error("Wingo bet error:", error);
    return NextResponse.json({ error: "বেট গ্রহণ করা সম্ভব হয়নি" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ bets: [] });
    }

    const myBets = await db
      .select()
      .from(gameBets)
      .where(eq(gameBets.userId, user.id))
      .orderBy(desc(gameBets.createdAt))
      .limit(30);

    return NextResponse.json({ bets: myBets });
  } catch (error) {
    console.error("Get my bets error:", error);
    return NextResponse.json({ error: "বেট হিস্ট্রি পাওয়া যায়নি" }, { status: 500 });
  }
}
