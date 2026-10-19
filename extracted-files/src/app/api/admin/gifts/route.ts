import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { giftCodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const codes = await db.select().from(giftCodes).orderBy(desc(giftCodes.createdAt));
    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Admin get gifts error:", error);
    return NextResponse.json({ error: "গিফট কোড লোড করা যায়নি" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, code, amount, maxClaims, id, isActive } = body;

    if (action === "create") {
      if (!code || !amount) {
        return NextResponse.json({ error: "কোড ও টাকার পরিমাণ দিন" }, { status: 400 });
      }

      const cleanCode = code.trim().toUpperCase();
      const parsedAmount = parseFloat(amount);

      const [newCode] = await db
        .insert(giftCodes)
        .values({
          code: cleanCode,
          amount: parsedAmount,
          maxClaims: maxClaims ? parseInt(maxClaims, 10) : 1000,
          claimsCount: 0,
          isActive: true,
        })
        .returning();

      return NextResponse.json({ success: true, message: `নতুন গিফট কোড '${cleanCode}' তৈরি হয়েছে!`, code: newCode });
    }

    if (action === "toggle") {
      await db
        .update(giftCodes)
        .set({ isActive: Boolean(isActive) })
        .where(eq(giftCodes.id, id));

      return NextResponse.json({ success: true, message: "গিফট কোডের স্ট্যাটাস পরিবর্তন হয়েছে" });
    }

    return NextResponse.json({ error: "অবৈধ অ্যাকশন" }, { status: 400 });
  } catch (error) {
    console.error("Admin gift action error:", error);
    return NextResponse.json({ error: "গিফট কোড অপারেশন ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
