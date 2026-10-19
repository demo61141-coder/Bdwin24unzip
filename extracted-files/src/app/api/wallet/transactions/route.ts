import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });
    }

    const txns = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(50);

    return NextResponse.json({ transactions: txns });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json({ error: "লেনদেনের তথ্য আনা যায়নি" }, { status: 500 });
  }
}
