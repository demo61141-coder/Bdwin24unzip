import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, gameBets, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

const SLOT_SYMBOLS = {
  fortune_tiger: ["🐯", "🧧", "🍊", "🪙", "🔔", "💎", "⭐"],
  gates_of_olympus: ["⚡", "👑", "💍", "⏳", "💎", "🏆", "🔥"],
  sweet_bonanza: ["🍭", "🍬", "🍇", "🍉", "🍎", "🍌", "💣"],
  super_ace: ["🃏", "♠️", "♥️", "♦️", "♣️", "👑", "🌟"],
  crazy_777: ["7️⃣", "🔔", "🍒", "BAR", "💎", "🪙", "⭐"],
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অনুগ্রহ করে প্রথমে লগইন করুন" }, { status: 401 });
    }

    const body = await req.json();
    const { slotId = "fortune_tiger", betAmount = 20 } = body;

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 5) {
      return NextResponse.json({ error: "সর্বনিম্ন বেটের পরিমাণ ৳৫" }, { status: 400 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: "পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন" }, { status: 400 });
    }

    // Deduct bet amount
    let balance = user.balance - amount;

    // Generate 3x3 reel grid
    const symbolPool = SLOT_SYMBOLS[slotId as keyof typeof SLOT_SYMBOLS] || SLOT_SYMBOLS.fortune_tiger;
    const grid: string[][] = [
      [symbolPool[Math.floor(Math.random() * symbolPool.length)], symbolPool[Math.floor(Math.random() * symbolPool.length)], symbolPool[Math.floor(Math.random() * symbolPool.length)]],
      [symbolPool[Math.floor(Math.random() * symbolPool.length)], symbolPool[Math.floor(Math.random() * symbolPool.length)], symbolPool[Math.floor(Math.random() * symbolPool.length)]],
      [symbolPool[Math.floor(Math.random() * symbolPool.length)], symbolPool[Math.floor(Math.random() * symbolPool.length)], symbolPool[Math.floor(Math.random() * symbolPool.length)]],
    ];

    // Win Evaluation Logic
    let isWin = false;
    let multiplier = 0;
    const winningLines: number[] = [];

    // Check middle horizontal line (Row 1)
    if (grid[1][0] === grid[1][1] && grid[1][1] === grid[1][2]) {
      isWin = true;
      multiplier += 5.0;
      winningLines.push(1);
    }
    // Check top row (Row 0)
    if (grid[0][0] === grid[0][1] && grid[0][1] === grid[0][2]) {
      isWin = true;
      multiplier += 3.0;
      winningLines.push(0);
    }
    // Check bottom row (Row 2)
    if (grid[2][0] === grid[2][1] && grid[2][1] === grid[2][2]) {
      isWin = true;
      multiplier += 3.0;
      winningLines.push(2);
    }
    // Check diagonals
    if (grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
      isWin = true;
      multiplier += 4.0;
      winningLines.push(3);
    }
    if (grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
      isWin = true;
      multiplier += 4.0;
      winningLines.push(4);
    }

    // 2 matching symbols in middle line partial win
    if (!isWin && (grid[1][0] === grid[1][1] || grid[1][1] === grid[1][2])) {
      if (Math.random() < 0.45) {
        isWin = true;
        multiplier = 1.5;
        winningLines.push(1);
      }
    }

    // Random Jackpot feature chance (50x or 10x)
    if (Math.random() < 0.04) {
      isWin = true;
      multiplier = 25.0;
    }

    const winAmount = isWin ? amount * multiplier : 0;
    balance += winAmount;

    await db
      .update(users)
      .set({
        balance,
        totalBetAmount: (user.totalBetAmount || 0) + amount,
        totalWinAmount: (user.totalWinAmount || 0) + winAmount,
      })
      .where(eq(users.id, user.id));

    await db.insert(gameBets).values({
      userId: user.id,
      gameType: "slots",
      gameId: slotId,
      betAmount: amount,
      winAmount,
      multiplier,
      prediction: "Spin",
      outcome: isWin ? `Win ${multiplier.toFixed(1)}x` : "No Match",
      isWin,
    });

    if (isWin && winAmount > 0) {
      await db.insert(transactions).values({
        userId: user.id,
        type: "bonus",
        amount: winAmount,
        method: "system",
        status: "completed",
        note: `স্লট উইন (${slotId}) - ৳${winAmount.toFixed(0)}`,
      });
    }

    return NextResponse.json({
      success: true,
      grid,
      isWin,
      multiplier,
      winAmount,
      winningLines,
      newBalance: balance,
    });
  } catch (error) {
    console.error("Slots spin error:", error);
    return NextResponse.json({ error: "স্লট স্পিন সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
