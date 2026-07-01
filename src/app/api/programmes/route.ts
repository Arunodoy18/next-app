import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db/mongodb";
import Programme from "@/models/programmeModel";
import { programmeWriteSchema } from "@/schema/programmeSchema";
import { requireAuth } from "@/auth/server";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "Admin");
  if (!auth.ok) return auth.response;

  await connectToDatabase();
  const programmes = await Programme.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(programmes);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, "Admin");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = programmeWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await connectToDatabase();
  try {
    const created = await Programme.create(parsed.data);
    const programme = await Programme.findById(created._id).lean();
    return NextResponse.json(programme, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Couldn't create the programme" }, { status: 500 });
  }
}
