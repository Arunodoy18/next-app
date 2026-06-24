import mongoose, { Schema } from "mongoose";
import type { User } from "@/types/userDoc";

const UserSchema = new Schema<User>(
  {
    userId: {
      type: String,
      unique: true,
      default: function () {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
      },
    },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["Student", "Instructor", "Admin", "Human Resources", "Project Management", "Business Development"] },
    verified: { type: String, enum: ["pending", "complete"], default: "pending" },
    credentialsToken: { type: String, default: null },
    credentialsTokenExpiry: { type: Date, default: null },
    credentialsVerified: { type: String, enum: ["pending", "complete"], default: "pending" },
  },
  { timestamps: true, collection: "Users" }
);

export default mongoose.models.User || mongoose.model<User>("User", UserSchema);
