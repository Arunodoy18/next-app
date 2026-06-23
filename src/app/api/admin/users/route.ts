import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { createUserSchema } from "@/schema/userSchema";
import { hashPassword } from "@/auth/server";

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

  const existing = await User.findOne({ username: parsed.data.username });
  if (existing) {
    return NextResponse.json({ error: "Username already exists" }, { status: 409 });
  }

  const { hash, salt } = await hashPassword(parsed.data.password);
  const user = await User.create({
    name: parsed.data.name,
    username: parsed.data.username,
    email: parsed.data.email,
    password: hash,
    salt,
    role: parsed.data.role,
  });

  const { password: _, salt: __, ...safeUser } = user.toObject();
  return NextResponse.json(safeUser, { status: 201 });
}
