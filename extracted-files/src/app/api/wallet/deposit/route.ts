import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "অনুগ্রহ করে প্রথমে লগইন করুন" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, method, accountNumber, trxId } = body;

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 100) {
      return NextResponse.json({ error: "সর্বনিম্ন রিচার্জ পরিমাণ ৳১০০" }, { status: 400 });
    }

    if (!trxId || trxId.trim().length < 4) {
      return NextResponse.json({ error: "সঠিক ট্রানজেকশন আইডি (TrxID) দিন" }, { status: 400 });
    }

    // 5% Extra Deposit Bonus promotion
    const extraBonus = depositAmount * 0.05;
    const totalCredit = depositAmount + extraBonus;

    // Credit balance
    const newBalance = user.balance + totalCredit;
    const newTotalDeposited = (user.totalDeposited || 0) + depositAmount;

    // Check VIP advancement (every ৳1000 deposited advances VIP)
    let newVip = user.vipLevel;
    const newExp = (user.vipExp || 0) + Math.floor(depositAmount);
    if (newExp >= 1000 && newVip < 10) {
      newVip = Math.min(10, 1 + Math.floor(newExp / 1000));
    }

    await db
      .update(users)
      .set({
        balance: newBalance,
        totalDeposited: newTotalDeposited,
        vipLevel: newVip,
        vipExp: newExp,
      })
      .where(eq(users.id, user.id));

    // Record Deposit Transaction
    const [txn] = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "deposit",
        amount: depositAmount,
        method: method || "bkash",
        accountNumber: accountNumber || "Unknown",
        trxId: trxId.trim().toUpperCase(),
        status: "completed",
        note: `রিচার্জ সফল (+৫% বোনাস ৳${extraBonus.toFixed(0)})`,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `রিচার্জ সফল! ৳${depositAmount} + ৫% বোনাস ৳${extraBonus.toFixed(0)} আপনার ওয়ালেটে যোগ হয়েছে।`,
      transaction: txn,
      newBalance,
    });
  } catch (error) {
    console.error("Deposit error:", error);
    return NextResponse.json({ error: "রিচার্জ সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
