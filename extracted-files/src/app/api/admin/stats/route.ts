import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, transactions, gameBets } from "@/db/schema";
import { count, sum, eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const totalUsersResult = await db.select({ val: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.val || 0;

    const allTxns = await db.select().from(transactions);

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let pendingDepositsCount = 0;
    let pendingWithdrawalsCount = 0;

    allTxns.forEach((t) => {
      if (t.type === "deposit" && t.status === "completed") {
        totalDeposits += t.amount;
      }
      if (t.type === "deposit" && t.status === "pending") {
        pendingDepositsCount++;
      }
      if (t.type === "withdraw" && t.status === "completed") {
        totalWithdrawals += t.amount;
      }
      if (t.type === "withdraw" && t.status === "pending") {
        pendingWithdrawalsCount++;
      }
    });

    const allBets = await db.select().from(gameBets);
    let totalBetVolume = 0;
    let totalPaidWinnings = 0;

    allBets.forEach((b) => {
      totalBetVolume += b.betAmount;
      if (b.isWin) {
        totalPaidWinnings += b.winAmount;
      }
    });

    const houseProfit = totalBetVolume - totalPaidWinnings;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalDeposits,
        totalWithdrawals,
        pendingDepositsCount,
        pendingWithdrawalsCount,
        totalBetVolume,
        totalPaidWinnings,
        houseProfit,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "পরিসংখ্যান আনা যায়নি" }, { status: 500 });
  }
}
