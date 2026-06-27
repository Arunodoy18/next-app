import mongoose, { Schema } from "mongoose";
import type { User } from "@/types/userDoc";

const UserSchema = new Schema<User>(
  {
    userId: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase(),
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, required: true, enum: ["Student", "Instructor", "Admin", "Human Resources", "Project Management", "Business Development"] },
    verified: { type: String, enum: ["pending", "complete"], default: "pending" },
    inviteToken: { type: String, default: null },
    inviteTokenExpiry: { type: Date, default: null },

    loginToken: { type: String, default: null },
    loginTokenExpiry: { type: Date, default: null },
    
    loginCode: { type: String, default: null },
    loginCodeExpiry: { type: Date, default: null },
  },
  { timestamps: true, collection: "Users" }
);

export default mongoose.models.User || mongoose.model<User>("User", UserSchema);
