import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const messages = await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(30);

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json({ error: "চ্যাট লোড করা যায়নি" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "বার্তা লিখুন" }, { status: 400 });
    }

    const username = user ? user.username : "Guest Player";
    const [userMsg] = await db
      .insert(chatMessages)
      .values({
        userId: user ? user.id : null,
        username,
        message: message.trim(),
        isSupport: false,
      })
      .returning();

    // Auto-reply simulated support agent responses
    const replies = [
      "হ্যালো! BDWIN24 কাস্টমার সাপোর্টে স্বাগতম। আপনার যেকোনো ডিপোজিট/উইথড্র সমস্যায় বিকাশ/নগদ TrxID শেয়ার করুন।",
      "আমাদের পেমেন্ট গেটওয়ে সম্পূর্ণ সক্রিয়। ডিপোজিটে ৫% এক্সট্রা বোনাস ও উইথড্র ৫-১০ মিনিটে সম্পন্ন হয়।",
      "ধন্যবাদ আপনার বার্তার জন্য। আমাদের স্পেশাল গিফট কোড 'BDWIN2026' বা 'WELCOME500' রিডিম করে ফ্রি বোনাস নিন!",
    ];
    const autoReply = replies[Math.floor(Math.random() * replies.length)];

    setTimeout(async () => {
      try {
        await db.insert(chatMessages).values({
          username: "BDWIN24 Support Agent",
          message: autoReply,
          isSupport: true,
        });
      } catch {}
    }, 1200);

    return NextResponse.json({ success: true, message: userMsg });
  } catch (error) {
    console.error("Send chat error:", error);
    return NextResponse.json({ error: "বার্তা পাঠানো যায়নি" }, { status: 500 });
  }
}
