import { db } from "@/db";
import { giftCodes, sportsMatches, wingoHistory, siteSettings } from "@/db/schema";
import { count } from "drizzle-orm";

export async function ensureSeedData() {
  try {
    // 1. Seed Site Settings if not existing
    const settingsCount = await db.select({ val: count() }).from(siteSettings);
    if (settingsCount[0]?.val === 0) {
      await db.insert(siteSettings).values({
        bkashNumber: "01788223344",
        nagadNumber: "01899112233",
        rocketNumber: "01955443322",
        upayNumber: "01622334455",
        usdtAddress: "TQx7Y2bnWpL8mQ9vZxKrP3sD1fG5hJ4kL8",
        minDeposit: 100.0,
        minWithdraw: 110.0,
        depositBonusPercent: 5.0,
        welcomeBonus: 500.0,
        adminPin: "admin1234",
        siteNotice: "BDWIN24 অফিসিয়াল বাংলাদেশ গেমিং প্ল্যাটফর্ম। বিকাশ ও নগদে ডিপোজিটে পান ৫% এক্সট্রা বোনাস।",
        isDepositAutoApprove: true,
      });
    }

    // 2. Seed Gift Codes if not existing
    const giftCountResult = await db.select({ val: count() }).from(giftCodes);
    if (giftCountResult[0]?.val === 0) {
      await db.insert(giftCodes).values([
        { code: "BDWIN2026", amount: 100, maxClaims: 10000, isActive: true },
        { code: "WELCOME500", amount: 500, maxClaims: 10000, isActive: true },
        { code: "BONUS100", amount: 100, maxClaims: 10000, isActive: true },
        { code: "VIPBDWIN", amount: 250, maxClaims: 10000, isActive: true },
        { code: "FREEBDT", amount: 50, maxClaims: 10000, isActive: true },
      ]);
    }

    // 3. Seed Sports Matches
    const sportsCountResult = await db.select({ val: count() }).from(sportsMatches);
    if (sportsCountResult[0]?.val === 0) {
      await db.insert(sportsMatches).values([
        {
          sport: "cricket",
          tournament: "BPL 2026 (Bangladesh Premier League)",
          teamA: "Comilla Victorians",
          teamB: "Fortune Barishal",
          oddsA: 1.85,
          oddsDraw: 4.5,
          oddsB: 1.95,
          status: "live",
          score: "Comilla: 142/3 (15.2 ov) | RR: 9.26",
          startTime: "Live Now",
        },
        {
          sport: "cricket",
          tournament: "ICC Champions Trophy",
          teamA: "Bangladesh Tigers",
          teamB: "India",
          oddsA: 2.45,
          oddsDraw: 5.0,
          oddsB: 1.55,
          status: "upcoming",
          score: "Starts at 7:30 PM",
          startTime: "Today 19:30",
        },
        {
          sport: "football",
          tournament: "UEFA Champions League",
          teamA: "Real Madrid",
          teamB: "Manchester City",
          oddsA: 2.30,
          oddsDraw: 3.40,
          oddsB: 2.10,
          status: "live",
          score: "2 - 2 (78')",
          startTime: "Live Now",
        },
        {
          sport: "football",
          tournament: "English Premier League",
          teamA: "Arsenal",
          teamB: "Chelsea",
          oddsA: 1.72,
          oddsDraw: 3.60,
          oddsB: 3.80,
          status: "upcoming",
          score: "Match in 2 hours",
          startTime: "Tonight 22:00",
        },
      ]);
    }

    // 4. Seed Wingo History if empty
    const wingoCountResult = await db.select({ val: count() }).from(wingoHistory);
    if (wingoCountResult[0]?.val === 0) {
      const now = Date.now();
      const initialRounds = [];
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

      for (let i = 20; i >= 1; i--) {
        const num = Math.floor(Math.random() * 10);
        const meta = colorsMap[num as keyof typeof colorsMap];
        const period = `${new Date(now - i * 60000).toISOString().slice(0, 10).replace(/-/g, "")}${1000 + i}`;
        initialRounds.push({
          periodNumber: period,
          timerType: "1m",
          winningNumber: num,
          winningColor: meta.color,
          winningSize: meta.size,
          createdAt: new Date(now - i * 60000),
        });
      }

      await db.insert(wingoHistory).values(initialRounds);
    }
  } catch (err) {
    console.error("Seed data error:", err);
  }
}
