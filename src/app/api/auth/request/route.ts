import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { loginRequestSchema } from "@/schema/authSchema";
import { hashSecret } from "@/auth/server";
import { generateToken, generateOtp } from "@/auth/authTokens";
import { sendMagicLinkEmail, sendOtpEmail, sendInviteEmail } from "@/email/templates";
import { rateLimit, getClientIp } from "@/auth/rateLimit";

const CHALLENGE_TTL_MS = 15 * 60 * 1000;
const INVITE_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req.headers), "login-request", { maxRequests: 5, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const parsed = loginRequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { email, method } = parsed.data;

  await connectToDatabase();
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) return NextResponse.json({ success: true, status: method });

  if (user.verified !== "complete") {
    const token = generateToken();
    user.inviteToken = token;
    user.inviteTokenExpiry = new Date(Date.now() + INVITE_TTL_MS);
    await user.save();
    await sendInviteEmail(user.email, user.name, token);
    return NextResponse.json({ success: true, status: "invited" });
  }

  if (method === "otp") {
    const code = generateOtp();
    user.loginCode = await hashSecret(code);
    user.loginCodeExpiry = new Date(Date.now() + CHALLENGE_TTL_MS);
    await user.save();
    await sendOtpEmail(user.email, user.name, code);
  } else {
    const token = generateToken();
    user.loginToken = token;
    user.loginTokenExpiry = new Date(Date.now() + CHALLENGE_TTL_MS);
    await user.save();
    await sendMagicLinkEmail(user.email, user.name, token);
  }

  return NextResponse.json({ success: true, status: method });
}
