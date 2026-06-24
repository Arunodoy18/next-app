import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { createUserSchema } from "@/schema/userSchema";
import { sendCredentialsVerificationEmail } from "@/email/templates";
import { generateUsername } from "@/utils/credentials";

export async function GET() {
  await connectToDatabase();
  const users = await User.find({}).select("-password -salt").sort({ createdAt: -1 }).lean();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const username = await generateUsername(parsed.data.name);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    name: parsed.data.name,
    username,
    email: parsed.data.email,
    password: "pending_verification",
    role: parsed.data.role,
    verified: "pending",
    credentialsToken: verificationToken,
    credentialsTokenExpiry: expiry,
  });

  await sendCredentialsVerificationEmail(user.email, user.name, verificationToken);

  const savedUser = await User.findById(user._id).select("-password").lean();
  return NextResponse.json(savedUser, { status: 201 });
}
