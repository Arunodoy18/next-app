export type AuthRole = "Student" | "Instructor" | "Admin" | "Human Resources" | "Project Management" | "Business Development";

export interface User {
  _id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  password: string;
  salt: string;
  role: AuthRole;
  verified: "pending" | "complete";
  createdAt: Date;
  updatedAt: Date;
}
