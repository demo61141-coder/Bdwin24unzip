import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sportsMatches } from "@/db/schema";
import { ensureSeedData } from "@/lib/seed";

export async function GET(req: NextRequest) {
  try {
    await ensureSeedData();
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get("sport");

    let matches = await db.select().from(sportsMatches);
    if (sport && sport !== "all") {
      matches = matches.filter((m) => m.sport === sport);
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Get matches error:", error);
    return NextResponse.json({ error: "ম্যাচ পাওয়া যায়নি" }, { status: 500 });
  }
}
