import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { verifyPassword, signToken, SESSION_COOKIE, ROLE_HOME } from "@/auth/server";
import type { AuthRole } from "@/auth/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({ username: username.trim().toLowerCase() });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const role = user.role as AuthRole;
  const token = signToken({
    userId: user.userId,
    name: user.name,
    username: user.username,
    email: user.email,
    role,
  });

  const res = NextResponse.json({
    success: true,
    role,
    home: ROLE_HOME[role],
    username: user.username,
  });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
