import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, giftCodes, userGiftClaims, transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureSeedData } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    await ensureSeedData();
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অনুগ্রহ করে প্রথমে লগইন করুন" }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "সঠিক গিফট কোড লিখুন" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const [gift] = await db
      .select()
      .from(giftCodes)
      .where(and(eq(giftCodes.code, cleanCode), eq(giftCodes.isActive, true)));

    if (!gift) {
      return NextResponse.json({ error: "অবৈধ বা মেয়াদোত্তীর্ণ গিফট কোড!" }, { status: 404 });
    }

    // Check if user already claimed this code
    const existingClaim = await db
      .select()
      .from(userGiftClaims)
      .where(and(eq(userGiftClaims.userId, user.id), eq(userGiftClaims.giftCodeId, gift.id)));

    if (existingClaim.length > 0) {
      return NextResponse.json({ error: "আপনি এই গিফট কোডটি ইতিমধ্যে ব্যবহার করেছেন!" }, { status: 400 });
    }

    const newBalance = user.balance + gift.amount;

    await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, user.id));

    await db.insert(userGiftClaims).values({
      userId: user.id,
      giftCodeId: gift.id,
      amount: gift.amount,
    });

    await db
      .update(giftCodes)
      .set({ claimsCount: (gift.claimsCount || 0) + 1 })
      .where(eq(giftCodes.id, gift.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "gift_code",
      amount: gift.amount,
      method: "system",
      status: "completed",
      note: `গিফট কোড রিডিম (${cleanCode})`,
    });

    return NextResponse.json({
      success: true,
      message: `অভিনন্দন! গিফট কোড সফলভাবে রিডিম হয়েছে। ৳${gift.amount} যোগ হয়েছে!`,
      amount: gift.amount,
      newBalance,
    });
  } catch (error) {
    console.error("Gift code error:", error);
    return NextResponse.json({ error: "গিফট কোড রিডিম করা যায়নি" }, { status: 500 });
  }
}
