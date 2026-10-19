import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, gameBets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অনুগ্রহ করে প্রথমে লগইন করুন" }, { status: 401 });
    }

    const body = await req.json();
    const { matchId, pick, odds, amount } = body;

    const betAmount = parseFloat(amount);
    const parsedOdds = parseFloat(odds);

    if (isNaN(betAmount) || betAmount < 20) {
      return NextResponse.json({ error: "সর্বনিম্ন স্পোর্টস বেট ৳২০" }, { status: 400 });
    }

    if (user.balance < betAmount) {
      return NextResponse.json({ error: "পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন" }, { status: 400 });
    }

    const newBalance = user.balance - betAmount;
    await db
      .update(users)
      .set({
        balance: newBalance,
        totalBetAmount: (user.totalBetAmount || 0) + betAmount,
      })
      .where(eq(users.id, user.id));

    const potentialWin = betAmount * parsedOdds;

    const [bet] = await db
      .insert(gameBets)
      .values({
        userId: user.id,
        gameType: "sports",
        gameId: String(matchId),
        betAmount,
        multiplier: parsedOdds,
        prediction: pick,
        outcome: `Active (Potential win: ৳${potentialWin.toFixed(0)})`,
        isWin: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `বেট স্লিপ নিশ্চিত হয়েছে! (${pick} @ ${parsedOdds}x | সম্ভাব্য জয়: ৳${potentialWin.toFixed(0)})`,
      bet,
      newBalance,
    });
  } catch (error) {
    console.error("Sports bet error:", error);
    return NextResponse.json({ error: "স্পোর্টস বেট স্থাপন করা যায়নি" }, { status: 500 });
  }
}
