import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { sendCredentialsVerificationEmail } from "@/email/templates";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req.headers), "forgot", { maxRequests: 3, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.credentialsToken = verificationToken;
  user.credentialsTokenExpiry = expiry;
  await user.save();

  await sendCredentialsVerificationEmail(user.email, user.name, verificationToken);

  return NextResponse.json({ success: true });
}
