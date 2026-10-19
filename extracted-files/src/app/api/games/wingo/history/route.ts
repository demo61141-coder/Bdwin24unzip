import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wingoHistory } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureSeedData } from "@/lib/seed";

export async function GET(req: NextRequest) {
  try {
    await ensureSeedData();
    const { searchParams } = new URL(req.url);
    const timerType = searchParams.get("timerType") || "1m";

    const history = await db
      .select()
      .from(wingoHistory)
      .where(eq(wingoHistory.timerType, timerType))
      .orderBy(desc(wingoHistory.createdAt))
      .limit(30);

    // Calculate current period based on UTC / BDT time
    const now = Date.now();
    let secondsInterval = 60;
    if (timerType === "30s") secondsInterval = 30;
    if (timerType === "3m") secondsInterval = 180;
    if (timerType === "5m") secondsInterval = 300;

    const currentEpochSec = Math.floor(now / 1000);
    const remainingSeconds = secondsInterval - (currentEpochSec % secondsInterval);
    const periodIndex = Math.floor(currentEpochSec / secondsInterval);
    const dateStr = new Date(now).toISOString().slice(0, 10).replace(/-/g, "");
    const activePeriodNumber = `${dateStr}${periodIndex}`;

    // Calculate statistics
    let redCount = 0;
    let greenCount = 0;
    let violetCount = 0;
    let bigCount = 0;
    let smallCount = 0;

    history.forEach((h) => {
      if (h.winningColor.includes("red")) redCount++;
      if (h.winningColor.includes("green")) greenCount++;
      if (h.winningColor.includes("violet")) violetCount++;
      if (h.winningSize === "big") bigCount++;
      if (h.winningSize === "small") smallCount++;
    });

    return NextResponse.json({
      history,
      activePeriod: activePeriodNumber,
      remainingSeconds,
      stats: {
        redCount,
        greenCount,
        violetCount,
        bigCount,
        smallCount,
        total: history.length,
      },
    });
  } catch (error) {
    console.error("Wingo history error:", error);
    return NextResponse.json({ error: "উইন গো হিস্ট্রি পাওয়া যায়নি" }, { status: 500 });
  }
}
