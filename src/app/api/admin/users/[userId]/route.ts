import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { updateUserSchema } from "@/schema/userSchema";
import { requireAuth } from "@/auth/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = requireAuth(req, "Admin");
  if (!auth.ok) return auth.response;

  const { userId } = await params;
  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await connectToDatabase();

  // Never demote the last remaining admin.
  if (parsed.data.role && parsed.data.role !== "Admin") {
    const target = await User.findOne({ userId }).select("role").lean();
    if (target?.role === "Admin" && (await User.countDocuments({ role: "Admin" })) <= 1) {
      return NextResponse.json({ error: "There must be at least one admin." }, { status: 400 });
    }
  }

  // Optimistic concurrency: only write if the client's updatedAt still matches.
  const expectedUpdatedAt = typeof body.updatedAt === "string" ? new Date(body.updatedAt) : null;
  const filter = expectedUpdatedAt ? { userId, updatedAt: expectedUpdatedAt } : { userId };

  const user = await User.findOneAndUpdate(filter, parsed.data, { returnDocument: "after" })
    .select("-password")
    .lean();

  if (!user) {
    // Distinguish a stale-write conflict from a genuinely missing account.
    if (expectedUpdatedAt && (await User.exists({ userId }))) {
      return NextResponse.json(
        { error: "This account was changed by someone else.", code: "stale" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = requireAuth(req, "Admin");
  if (!auth.ok) return auth.response;

  const { userId } = await params;

  // An admin can't delete their own account.
  if (userId === auth.payload.userId) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  await connectToDatabase();

  const target = await User.findOne({ userId }).select("role").lean();
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Never remove the last remaining admin.
  if (target.role === "Admin" && (await User.countDocuments({ role: "Admin" })) <= 1) {
    return NextResponse.json({ error: "There must be at least one admin." }, { status: 400 });
  }

  await User.findOneAndDelete({ userId });
  return NextResponse.json({ success: true });
}
