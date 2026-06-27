import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { otpVerifySchema } from "@/schema/authSchema";
import { setSessionCookie, verifySecret, ROLE_HOME } from "@/auth/server";
import type { AuthRole } from "@/auth/server";
import { rateLimit, getClientIp } from "@/auth/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req.headers), "otp-verify", { maxRequests: 10, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const parsed = otpVerifySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const { email, code } = parsed.data;

  await connectToDatabase();
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    loginCodeExpiry: { $gt: new Date() },
    verified: "complete",
  });

  if (!user || !user.loginCode || !(await verifySecret(code, user.loginCode))) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  user.loginCode = null;
  user.loginCodeExpiry = null;
  await user.save();

  const role = user.role as AuthRole;
  const res = NextResponse.json({ success: true, role, home: ROLE_HOME[role] });
  setSessionCookie(res, { userId: user.userId, name: user.name, email: user.email, role });
  return res;
}
