import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { setSessionCookie, ROLE_HOME } from "@/auth/server";
import type { AuthRole } from "@/auth/server";
import { rateLimit, getClientIp } from "@/auth/rateLimit";

async function verifyMagicToken(token: string) {
  await connectToDatabase();
  const user = await User.findOne({
    loginToken: token,
    loginTokenExpiry: { $gt: new Date() },
    verified: "complete",
  });
  if (!user) return null;

  user.loginToken = null;
  user.loginTokenExpiry = null;
  await user.save();
  return user;
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req.headers), "magic", { maxRequests: 10, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Invalid link" }, { status: 400 });

  const user = await verifyMagicToken(token);
  if (!user) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  const role = user.role as AuthRole;
  const res = NextResponse.json({ home: ROLE_HOME[role] });
  setSessionCookie(res, { userId: user.userId, name: user.name, email: user.email, role });
  return res;
}
