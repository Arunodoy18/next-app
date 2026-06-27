import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { createUserSchema } from "@/schema/userSchema";
import { sendInviteEmail } from "@/email/templates";
import { generateToken } from "@/auth/authTokens";
import { requireAuth } from "@/auth/server";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "Admin");
  if (!auth.ok) return auth.response;

  await connectToDatabase();
  const users = await User.find({}).select("-password -salt").sort({ createdAt: -1 }).lean();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, "Admin");
  if (!auth.ok) return auth.response;

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

  const inviteToken = generateToken();
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    verified: "pending",
    inviteToken,
    inviteTokenExpiry: expiry,
  });

  await sendInviteEmail(user.email, user.name, inviteToken);

  const savedUser = await User.findById(user._id).lean();
  return NextResponse.json(savedUser, { status: 201 });
}
