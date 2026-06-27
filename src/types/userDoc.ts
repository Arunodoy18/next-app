export type AuthRole = "Student" | "Instructor" | "Admin" | "Human Resources" | "Project Management" | "Business Development";

export interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: AuthRole;
  verified: "pending" | "complete";

  inviteToken?: string | null;
  inviteTokenExpiry?: Date | null;

  loginToken?: string | null;
  loginTokenExpiry?: Date | null;

  loginCode?: string | null;
  loginCodeExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
