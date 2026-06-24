import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "BlackmontAcademy";

const UserSchema = new mongoose.Schema({
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
  credentialsVerified: { type: String, enum: ["pending", "complete"], default: "pending" },
  credentialsToken: { type: String, default: null },
  credentialsTokenExpiry: { type: Date, default: null },
}, { timestamps: true, collection: "Users" });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const SEED_USERS = [
  { name: "Demo Student", username: "student", password: "student123", role: "Student" },
  { name: "Demo Instructor", username: "instructor", password: "instructor123", role: "Instructor" },
  { name: "HR Manager", username: "hr", password: "hr123", role: "Human Resources" },
  { name: "Business Dev", username: "busdev", password: "bus123", role: "Business Development" },
  { name: "Project Manager", username: "pm", password: "pm123", role: "Project Management" },
  { name: "Admin", username: "admin", password: "admin123", role: "Admin" },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log("Connected to MongoDB");

  await User.deleteMany({});
  console.log("Cleared existing users");

  for (const u of SEED_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    const email = `${u.username}@axonstudio.in`;
    await User.create({
      name: u.name,
      username: u.username,
      email,
      password: hash,
      role: u.role,
      verified: "complete",
      credentialsVerified: "complete",
    });
    console.log(`Created user "${u.username}" (${u.role})`);
  }

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
