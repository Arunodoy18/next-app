import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "BlackmontAcademy";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

let cached = (global as Record<string, unknown>).__mongoose as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} | undefined;

if (!cached) {
  cached = { conn: null, promise: null };
  (global as Record<string, unknown>).__mongoose = cached;
}

export default async function connectToDatabase() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

