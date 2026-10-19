import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wingoHistory, gameBets, users, transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const colorsMap = {
  0: { color: "red_violet", size: "small" },
  1: { color: "green", size: "small" },
  2: { color: "red", size: "small" },
  3: { color: "green", size: "small" },
  4: { color: "red", size: "small" },
  5: { color: "green_violet", size: "big" },
  6: { color: "red", size: "big" },
  7: { color: "green", size: "big" },
  8: { color: "red", size: "big" },
  9: { color: "green", size: "big" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { periodNumber, timerType = "1m" } = body;

    if (!periodNumber) {
      return NextResponse.json({ error: "পিরিয়ড নাম্বার প্রয়োজন" }, { status: 400 });
    }

    // Check if already settled
    const existing = await db
      .select()
      .from(wingoHistory)
      .where(eq(wingoHistory.periodNumber, periodNumber));

    let winningResult = existing[0];

    if (!winningResult) {
      // Generate winning number (0-9)
      const winningNumber = Math.floor(Math.random() * 10);
      const meta = colorsMap[winningNumber as keyof typeof colorsMap];

      const [newRound] = await db
        .insert(wingoHistory)
        .values({
          periodNumber,
          timerType,
          winningNumber,
          winningColor: meta.color,
          winningSize: meta.size,
        })
        .returning();

      winningResult = newRound;
    }

    // Settle pending bets for this period
    const pendingBets = await db
      .select()
      .from(gameBets)
      .where(and(eq(gameBets.gameType, "wingo"), eq(gameBets.periodNumber, periodNumber)));

    const updatedUserWinnings: Record<number, number> = {};

    for (const bet of pendingBets) {
      let isWin = false;
      let multiplier = 0;
      const pred = bet.prediction?.toLowerCase();

      if (!pred) continue;

      // Color bets
      if (pred === "green" && (winningResult.winningColor === "green" || winningResult.winningColor === "green_violet")) {
        isWin = true;
        multiplier = winningResult.winningColor === "green_violet" ? 1.5 : 2.0;
      } else if (pred === "red" && (winningResult.winningColor === "red" || winningResult.winningColor === "red_violet")) {
        isWin = true;
        multiplier = winningResult.winningColor === "red_violet" ? 1.5 : 2.0;
      } else if (pred === "violet" && (winningResult.winningNumber === 0 || winningResult.winningNumber === 5)) {
        isWin = true;
        multiplier = 4.5;
      }
      // Size bets
      else if (pred === "big" && winningResult.winningSize === "big") {
        isWin = true;
        multiplier = 2.0;
      } else if (pred === "small" && winningResult.winningSize === "small") {
        isWin = true;
        multiplier = 2.0;
      }
      // Exact number bets (0-9)
      else if (pred === String(winningResult.winningNumber)) {
        isWin = true;
        multiplier = 9.0;
      }

      const winAmount = isWin ? bet.betAmount * multiplier : 0;

      await db
        .update(gameBets)
        .set({
          isWin,
          multiplier,
          winAmount,
          outcome: `Number ${winningResult.winningNumber} (${winningResult.winningColor})`,
        })
        .where(eq(gameBets.id, bet.id));

      if (isWin && bet.userId) {
        updatedUserWinnings[bet.userId] = (updatedUserWinnings[bet.userId] || 0) + winAmount;
      }
    }

    // Credit winners
    for (const [userIdStr, totalWin] of Object.entries(updatedUserWinnings)) {
      const uId = parseInt(userIdStr, 10);
      const [u] = await db.select().from(users).where(eq(users.id, uId));
      if (u) {
        await db
          .update(users)
          .set({
            balance: u.balance + totalWin,
            totalWinAmount: (u.totalWinAmount || 0) + totalWin,
          })
          .where(eq(users.id, uId));

        await db.insert(transactions).values({
          userId: uId,
          type: "bonus",
          amount: totalWin,
          method: "system",
          status: "completed",
          note: `উইন গো লটারী পুরস্কার - পিরিয়ড ${periodNumber}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: winningResult,
    });
  } catch (error) {
    console.error("Wingo settle error:", error);
    return NextResponse.json({ error: "উইন গো সেটেল করা যায়নি" }, { status: 500 });
  }
}
