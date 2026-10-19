import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureSeedData } from "./seed";

export async function getCurrentUser(req: NextRequest) {
  await ensureSeedData();

  // 1. Try from cookie
  const cookieUserId = req.cookies.get("bdwin_user_id")?.value;
  // 2. Try from header
  const headerUserId = req.headers.get("x-user-id");

  const userIdStr = cookieUserId || headerUserId;
  if (!userIdStr) return null;

  const userId = parseInt(userIdStr, 10);
  if (isNaN(userId)) return null;

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user || null;
}

export function generateInviteCode(length = 7): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
