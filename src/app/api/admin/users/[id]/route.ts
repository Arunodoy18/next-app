import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { updateUserSchema } from "@/schema/userSchema";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findByIdAndUpdate(id, parsed.data, { returnDocument: "after" })
    .select("-password -salt")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDatabase();
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
