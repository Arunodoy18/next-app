import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/auth/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ session: null });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({ session: payload });
}
