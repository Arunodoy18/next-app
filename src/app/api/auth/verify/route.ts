import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { acceptInviteSchema } from "@/schema/authSchema";
import { setSessionCookie, ROLE_HOME } from "@/auth/server";
import type { AuthRole } from "@/auth/server";
import { rateLimit, getClientIp } from "@/auth/rateLimit";

export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req.headers), "verify-get", { maxRequests: 10, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({
    inviteToken: token,
    inviteTokenExpiry: { $gt: new Date() },
    verified: "pending",
  }).select("name").lean();

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  return NextResponse.json({ valid: true, name: (user as { name?: string }).name ?? "" });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req.headers), "verify-post", { maxRequests: 5, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const parsed = acceptInviteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({
    inviteToken: parsed.data.token,
    inviteTokenExpiry: { $gt: new Date() },
    verified: "pending",
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  user.name = parsed.data.name;
  user.verified = "complete";
  user.inviteToken = null;
  user.inviteTokenExpiry = null;
  await user.save();

  const role = user.role as AuthRole;
  const res = NextResponse.json({ success: true, role, home: ROLE_HOME[role] });
  setSessionCookie(res, { userId: user.userId, name: user.name, email: user.email, role });
  return res;
}
