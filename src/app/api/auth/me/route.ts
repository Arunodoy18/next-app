import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/auth/server";
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
    const user = await User.findOne({ userId: payload.userId }).select("-password");

    return NextResponse.json({
      session: {
        ...payload,
        name: user?.name,
        email: user?.email,
        createdAt: user?.createdAt,
        verified: user?.verified,
      },
    });
  } catch {
    return NextResponse.json({ session: null });
  }
}
