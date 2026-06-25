import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { verifyCredentialsSchema } from "@/schema/settingsSchema";
import { sendCredentialsEmail } from "@/email/templates";
import { generatePassword } from "@/utils/credentials";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req.headers), "verify-get", { maxRequests: 10, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({
    credentialsToken: token,
    credentialsTokenExpiry: { $gt: new Date() },
  }).select("verified name").lean();

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  return NextResponse.json({ type: user.verified === "pending" ? "new" : "reset" });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req.headers), "verify-post", { maxRequests: 5, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const body = await req.json();
  const parsed = verifyCredentialsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({
    credentialsToken: parsed.data.token,
    credentialsTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const isNewAccount = user.verified === "pending";

  if (isNewAccount && !parsed.data.name) {
    return NextResponse.json({ error: "Name is required for new accounts" }, { status: 400 });
  }

  const newPassword = generatePassword();
  const hash = await bcrypt.hash(newPassword, 10);

  const updateData: Record<string, unknown> = {
    password: hash,
    credentialsToken: null,
    credentialsTokenExpiry: null,
    verified: "complete",
  };

  if (isNewAccount && parsed.data.name) {
    updateData.name = parsed.data.name;
  }

  await User.findOneAndUpdate({ userId: user.userId }, updateData);

  const displayName = isNewAccount ? parsed.data.name! : user.name;
  await sendCredentialsEmail(user.email, displayName, user.username, newPassword);

  return NextResponse.json({ success: true });
}
