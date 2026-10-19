import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const deposits = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        amount: transactions.amount,
        method: transactions.method,
        accountNumber: transactions.accountNumber,
        trxId: transactions.trxId,
        status: transactions.status,
        note: transactions.note,
        createdAt: transactions.createdAt,
        username: users.username,
        phone: users.phone,
        userBalance: users.balance,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.type, "deposit"))
      .orderBy(desc(transactions.createdAt))
      .limit(100);

    return NextResponse.json({ deposits });
  } catch (error) {
    console.error("Admin get deposits error:", error);
    return NextResponse.json({ error: "ডিপোজিট রেকর্ড আনা যায়নি" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txnId, action } = body; // action: 'approve' | 'reject'

    const [txn] = await db.select().from(transactions).where(eq(transactions.id, txnId));
    if (!txn || txn.type !== "deposit") {
      return NextResponse.json({ error: "ডিপোজিট রেকর্ড পাওয়া যায়নি" }, { status: 404 });
    }

    if (action === "approve") {
      // If it was pending, credit user balance + 5% bonus
      if (txn.status !== "completed" && txn.userId) {
        const [u] = await db.select().from(users).where(eq(users.id, txn.userId));
        if (u) {
          const bonus = txn.amount * 0.05;
          const totalCredit = txn.amount + bonus;
          await db
            .update(users)
            .set({
              balance: u.balance + totalCredit,
              totalDeposited: (u.totalDeposited || 0) + txn.amount,
            })
            .where(eq(users.id, u.id));
        }
      }

      await db
        .update(transactions)
        .set({
          status: "completed",
          note: "এডমিন কর্তৃক অনুমোদিত (Approved)",
        })
        .where(eq(transactions.id, txnId));

      return NextResponse.json({ success: true, message: "ডিপোজিট সফলভাবে অনুমোদন করা হয়েছে!" });
    }

    if (action === "reject") {
      await db
        .update(transactions)
        .set({
          status: "rejected",
          note: "ভুল TrxID বা অপ্রাপ্ত পেমেন্ট (Rejected)",
        })
        .where(eq(transactions.id, txnId));

      return NextResponse.json({ success: true, message: "ডিপোজিট বাতিল করা হয়েছে" });
    }

    return NextResponse.json({ error: "অবৈধ অ্যাকশন" }, { status: 400 });
  } catch (error) {
    console.error("Admin deposit action error:", error);
    return NextResponse.json({ error: "অ্যাকশন সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
