import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { AuthRole } from "@/types/userDoc";

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;

export type { AuthRole };

export const SESSION_COOKIE = "session";

export const ROLE_HOME: Record<AuthRole, string> = {
  Student: "/student",
  Instructor: "/instructor",
  Admin: "/admin",
  "Human Resources": "/internal",
  "Project Management": "/internal",
  "Business Development": "/internal",
};

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: AuthRole;
}

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, SALT_ROUNDS);
}

export async function verifySecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(res: NextResponse, payload: TokenPayload): void {
  res.cookies.set(SESSION_COOKIE, signToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

type AuthResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; response: NextResponse };

export function requireAuth(req: NextRequest, ...allowedRoles: AuthRole[]): AuthResult {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const payload = verifyToken(token);
  if (!payload) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, payload };
}
