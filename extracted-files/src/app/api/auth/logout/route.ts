import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "লগআউট সফল হয়েছে" });
  res.cookies.set("bdwin_user_id", "", {
    httpOnly: false,
    path: "/",
    maxAge: 0,
  });
  return res;
}
