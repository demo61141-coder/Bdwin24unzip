import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, gameBets, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অনুগ্রহ করে প্রথমে লগইন করুন" }, { status: 401 });
    }

    const body = await req.json();
    const { action, amount, multiplier, crashPoint, betId } = body;

    // Action: 'place_bet'
    if (action === "place_bet") {
      const betAmount = parseFloat(amount);
      if (isNaN(betAmount) || betAmount < 10) {
        return NextResponse.json({ error: "সর্বনিম্ন বেটের পরিমাণ ৳১০" }, { status: 400 });
      }

      if (user.balance < betAmount) {
        return NextResponse.json({ error: "পর্যাপ্ত ব্যালেন্স নেই!" }, { status: 400 });
      }

      const newBalance = user.balance - betAmount;
      await db
        .update(users)
        .set({
          balance: newBalance,
          totalBetAmount: (user.totalBetAmount || 0) + betAmount,
        })
        .where(eq(users.id, user.id));

      const [bet] = await db
        .insert(gameBets)
        .values({
          userId: user.id,
          gameType: "aviator",
          betAmount,
          prediction: "Auto/Manual Cashout",
          isWin: false,
        })
        .returning();

      return NextResponse.json({
        success: true,
        betId: bet.id,
        newBalance,
      });
    }

    // Action: 'cashout'
    if (action === "cashout") {
      const parsedMult = parseFloat(multiplier);
      const parsedBetId = parseInt(betId, 10);

      if (!parsedBetId || isNaN(parsedMult) || parsedMult < 1.01) {
        return NextResponse.json({ error: "অবৈধ ক্যাশআউট রিকোয়েস্ট" }, { status: 400 });
      }

      const [bet] = await db.select().from(gameBets).where(eq(gameBets.id, parsedBetId));
      if (!bet || bet.userId !== user.id || bet.isWin) {
        return NextResponse.json({ error: "বেট পাওয়া যায়নি বা ইতিমধ্যে ক্যাশআউট হয়েছে" }, { status: 400 });
      }

      const winAmount = bet.betAmount * parsedMult;
      const newBalance = user.balance + winAmount;

      await db
        .update(users)
        .set({
          balance: newBalance,
          totalWinAmount: (user.totalWinAmount || 0) + winAmount,
        })
        .where(eq(users.id, user.id));

      await db
        .update(gameBets)
        .set({
          isWin: true,
          multiplier: parsedMult,
          winAmount,
          outcome: `Cashed out at ${parsedMult.toFixed(2)}x`,
        })
        .where(eq(gameBets.id, parsedBetId));

      await db.insert(transactions).values({
        userId: user.id,
        type: "bonus",
        amount: winAmount,
        method: "system",
        status: "completed",
        note: `এভিয়েটর উইন (${parsedMult.toFixed(2)}x) - ৳${winAmount.toFixed(0)}`,
      });

      return NextResponse.json({
        success: true,
        message: `অভিনন্দন! ${parsedMult.toFixed(2)}x এ ক্যাশআউট করে ৳${winAmount.toFixed(0)} জিতেছেন!`,
        winAmount,
        newBalance,
      });
    }

    // Action: 'crashed' (Lost)
    if (action === "crashed") {
      const parsedBetId = parseInt(betId, 10);
      if (parsedBetId) {
        await db
          .update(gameBets)
          .set({
            isWin: false,
            outcome: `Crashed at ${crashPoint || "1.00"}x`,
          })
          .where(eq(gameBets.id, parsedBetId));
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "অজানা অ্যাকশন" }, { status: 400 });
  } catch (error) {
    console.error("Aviator bet error:", error);
    return NextResponse.json({ error: "এভিয়েটর বেট সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
