import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/db/mongodb";
import User from "@/models/userModel";
import { SESSION_COOKIE, verifyToken } from "@/auth/server";
import { sendCredentialsVerificationEmail } from "@/email/templates";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const user = await User.findOne({ userId: payload.userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.credentialsToken = verificationToken;
    user.credentialsTokenExpiry = expiry;
    await user.save();

    await sendCredentialsVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("Error requesting credentials reset:", error);
    return NextResponse.json({ error: "Failed to request credentials reset" }, { status: 500 });
  }
}
