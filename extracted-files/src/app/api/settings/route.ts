import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  try {
    await ensureSeedData();
    const [settings] = await db.select().from(siteSettings).limit(1);

    return NextResponse.json({
      settings: settings || {
        bkashNumber: "01788223344",
        nagadNumber: "01899112233",
        rocketNumber: "01955443322",
        upayNumber: "01622334455",
        usdtAddress: "TQx7Y2bnWpL8mQ9vZxKrP3sD1fG5hJ4kL8",
        minDeposit: 100.0,
        minWithdraw: 110.0,
        depositBonusPercent: 5.0,
        welcomeBonus: 500.0,
        siteNotice: "BDWIN24 অফিসিয়াল বাংলাদেশ গেমিং প্ল্যাটফর্ম। বিকাশ ও নগদে ডিপোজিটে পান ৫% এক্সট্রা বোনাস।",
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      {
        settings: {
          bkashNumber: "01788223344",
          nagadNumber: "01899112233",
          rocketNumber: "01955443322",
          upayNumber: "01622334455",
          usdtAddress: "TQx7Y2bnWpL8mQ9vZxKrP3sD1fG5hJ4kL8",
          minDeposit: 100.0,
          minWithdraw: 110.0,
          depositBonusPercent: 5.0,
          welcomeBonus: 500.0,
          siteNotice: "BDWIN24 অফিসিয়াল বাংলাদেশ গেমিং প্ল্যাটফর্ম। বিকাশ ও নগদে ডিপোজিটে পান ৫% এক্সট্রা বোনাস।",
        },
      },
      { status: 200 }
    );
  }
}
