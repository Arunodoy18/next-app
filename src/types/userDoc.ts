export type AuthRole = "Student" | "Instructor" | "Admin" | "Human Resources" | "Project Management" | "Business Development";

export interface User {
  _id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  password: string | null;
  role: AuthRole;
  verified: "pending" | "complete";
  credentialsToken?: string | null;
  credentialsTokenExpiry?: Date | null;
  credentialsVerified: "pending" | "complete";
  createdAt: Date;
  updatedAt: Date;
}
