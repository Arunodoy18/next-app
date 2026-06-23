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
  username: string;
  email: string;
  role: AuthRole;
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
