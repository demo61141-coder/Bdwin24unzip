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
    const { amount, method, accountNumber } = body;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 110) {
      return NextResponse.json({ error: "সর্বনিম্ন উত্তোলন পরিমাণ ৳১১০" }, { status: 400 });
    }

    if (user.balance < withdrawAmount) {
      return NextResponse.json({ error: "আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!" }, { status: 400 });
    }

    if (!accountNumber || accountNumber.trim().length < 10) {
      return NextResponse.json({ error: "সঠিক ওয়ালেট / মোবাইল নাম্বার দিন" }, { status: 400 });
    }

    const newBalance = user.balance - withdrawAmount;
    const newTotalWithdrawn = (user.totalWithdrawn || 0) + withdrawAmount;

    await db
      .update(users)
      .set({
        balance: newBalance,
        totalWithdrawn: newTotalWithdrawn,
      })
      .where(eq(users.id, user.id));

    const [txn] = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "withdraw",
        amount: withdrawAmount,
        method: method || "bkash",
        accountNumber: accountNumber.trim(),
        status: "completed", // Fast automated withdrawal simulation
        note: `উত্তোলন সফল (${method.toUpperCase()}: ${accountNumber})`,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `৳${withdrawAmount} উত্তোলনের আবেদন সফল হয়েছে! ৫-১০ মিনিটের মধ্যে আপনার ${method.toUpperCase()} অ্যাকাউন্টে জমা হবে।`,
      transaction: txn,
      newBalance,
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json({ error: "উত্তোলন সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
