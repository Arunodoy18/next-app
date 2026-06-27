import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { setSessionCookie, ROLE_HOME } from "@/auth/server";
import type { AuthRole } from "@/auth/server";

export async function GET() {
  await connectToDatabase();
  const users = await User.find({}).select("userId role").lean();

  return NextResponse.json(
    users
      .filter((u) => !!u.userId)
      .map((u) => ({ userId: u.userId, role: u.role }))
  );
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ userId }).select("userId name email role").lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const role = user.role as AuthRole;
  const res = NextResponse.json({ success: true, role, home: ROLE_HOME[role] });
  setSessionCookie(res, { userId: user.userId, name: user.name, email: user.email, role });
  return res;
}
