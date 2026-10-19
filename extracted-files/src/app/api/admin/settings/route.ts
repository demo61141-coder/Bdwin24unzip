import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  try {
    await ensureSeedData();
    const [settings] = await db.select().from(siteSettings).limit(1);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin get settings error:", error);
    return NextResponse.json({ error: "সেটিংস লোড করা যায়নি" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const {
      bkashNumber,
      nagadNumber,
      rocketNumber,
      upayNumber,
      usdtAddress,
      minDeposit,
      minWithdraw,
      depositBonusPercent,
      welcomeBonus,
      adminPin,
      siteNotice,
      isDepositAutoApprove,
    } = body;

    const [existing] = await db.select().from(siteSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({
          bkashNumber: bkashNumber || existing.bkashNumber,
          nagadNumber: nagadNumber || existing.nagadNumber,
          rocketNumber: rocketNumber || existing.rocketNumber,
          upayNumber: upayNumber || existing.upayNumber,
          usdtAddress: usdtAddress || existing.usdtAddress,
          minDeposit: minDeposit !== undefined ? parseFloat(minDeposit) : existing.minDeposit,
          minWithdraw: minWithdraw !== undefined ? parseFloat(minWithdraw) : existing.minWithdraw,
          depositBonusPercent:
            depositBonusPercent !== undefined ? parseFloat(depositBonusPercent) : existing.depositBonusPercent,
          welcomeBonus: welcomeBonus !== undefined ? parseFloat(welcomeBonus) : existing.welcomeBonus,
          adminPin: adminPin || existing.adminPin,
          siteNotice: siteNotice !== undefined ? siteNotice : existing.siteNotice,
          isDepositAutoApprove:
            isDepositAutoApprove !== undefined ? isDepositAutoApprove : existing.isDepositAutoApprove,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, existing.id))
        .returning();

      return NextResponse.json({
        success: true,
        message: "পেমেন্ট নাম্বার ও সেটিংস সফলভাবে আপডেট হয়েছে!",
        settings: updated,
      });
    }

    return NextResponse.json({ error: "সেটিংস পাওয়া যায়নি" }, { status: 404 });
  } catch (error) {
    console.error("Admin update settings error:", error);
    return NextResponse.json({ error: "সেটিংস আপডেট করা যায়নি" }, { status: 500 });
  }
}
