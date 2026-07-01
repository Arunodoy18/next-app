import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import Programme from "@/models/programmeModel";
import { programmeWriteSchema } from "@/schema/programmeSchema";
import { requireAuth } from "@/auth/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ programmeId: string }> }) {
  const auth = requireAuth(req, "Admin");
  if (!auth.ok) return auth.response;

  const { programmeId } = await params;
  const body = await req.json();
  const parsed = programmeWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await connectToDatabase();

  // Optimistic concurrency: only write if the client's updatedAt still matches.
  const expectedUpdatedAt = typeof body.updatedAt === "string" ? new Date(body.updatedAt) : null;
  const filter = expectedUpdatedAt ? { programmeId, updatedAt: expectedUpdatedAt } : { programmeId };

  let programme;
  try {
    programme = await Programme.findOneAndUpdate(filter, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    }).lean();
  } catch {
    return NextResponse.json({ error: "Couldn't save the programme" }, { status: 500 });
  }

  if (!programme) {
    // Distinguish a stale-write conflict from a genuinely missing programme.
    if (expectedUpdatedAt && (await Programme.exists({ programmeId }))) {
      return NextResponse.json(
        { error: "This programme was changed by someone else.", code: "stale" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Programme not found" }, { status: 404 });
  }

  return NextResponse.json(programme);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ programmeId: string }> }) {
  const auth = requireAuth(req, "Admin");
  if (!auth.ok) return auth.response;

  const { programmeId } = await params;
  await connectToDatabase();
  const programme = await Programme.findOneAndDelete({ programmeId });

  if (!programme) {
    return NextResponse.json({ error: "Programme not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
