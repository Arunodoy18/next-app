import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken, setSessionCookie } from "@/auth/server";
import type { AuthRole } from "@/auth/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ session: null });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ session: null });
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({ userId: payload.userId });

    if (!user) {
      const res = NextResponse.json({ session: null });
      res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }
    const fresh = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role as AuthRole,
    };

    const res = NextResponse.json({
      session: { ...fresh, createdAt: user.createdAt, verified: user.verified },
    });
    setSessionCookie(res, fresh);
    return res;
  } catch {
    return NextResponse.json({ session: payload });
  }
}
