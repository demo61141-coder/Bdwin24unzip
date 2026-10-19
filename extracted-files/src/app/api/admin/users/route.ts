import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100);

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json({ error: "ইউজারদের তালিকা আনা যায়নি" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, amount, newPassword, isBanned } = body;

    const [u] = await db.select().from(users).where(eq(users.id, userId));
    if (!u) {
      return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    // 1. Adjust Balance (add / deduct)
    if (action === "adjust_balance") {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        return NextResponse.json({ error: "সঠিক টাকার পরিমাণ দিন" }, { status: 400 });
      }

      const newBalance = Math.max(0, u.balance + parsedAmount);
      await db
        .update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, u.id));

      await db.insert(transactions).values({
        userId: u.id,
        type: parsedAmount >= 0 ? "bonus" : "transfer",
        amount: Math.abs(parsedAmount),
        method: "system",
        status: "completed",
        note: `এডমিন ব্যালেন্স সমন্বয় (${parsedAmount >= 0 ? "+" : "-"}৳${Math.abs(parsedAmount)})`,
      });

      return NextResponse.json({
        success: true,
        message: `ইউজারের ব্যালেন্স সফলভাবে আপডেট হয়েছে (নতুন ব্যালেন্স: ৳${newBalance.toFixed(2)})`,
      });
    }

    // 2. Change Password
    if (action === "change_password") {
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ error: "পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে" }, { status: 400 });
      }

      await db
        .update(users)
        .set({ password: newPassword })
        .where(eq(users.id, u.id));

      return NextResponse.json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" });
    }

    // 3. Ban / Unban
    if (action === "toggle_ban") {
      await db
        .update(users)
        .set({ isBanned: Boolean(isBanned) })
        .where(eq(users.id, u.id));

      return NextResponse.json({
        success: true,
        message: isBanned ? "ইউজারকে ব্যান করা হয়েছে" : "ইউজারকে আনব্যান করা হয়েছে",
      });
    }

    return NextResponse.json({ error: "অবৈধ অ্যাকশন" }, { status: 400 });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "অ্যাকশন সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
