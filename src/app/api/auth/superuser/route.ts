import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { signToken, SESSION_COOKIE, ROLE_HOME } from "@/auth/server";
import type { AuthRole } from "@/auth/server";

export async function GET() {
  await connectToDatabase();
  const users = await User.find({}).select("userId username role").lean();

  return NextResponse.json(
    users
      .filter((u) => !!u.userId)
      .map((u) => ({ userId: u.userId, username: u.username, role: u.role }))
  );
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ userId }).select("userId name username email role").lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const role = user.role as AuthRole;
  const token = signToken({
    userId: user.userId,
    name: user.name,
    username: user.username,
    email: user.email,
    role,
  });

  const res = NextResponse.json({ success: true, role, home: ROLE_HOME[role] });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
