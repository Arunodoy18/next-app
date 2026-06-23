import { z } from "zod";

export const authRoleEnum = z.enum(["Student", "Instructor", "Admin", "Human Resources", "Project Management", "Business Development"]);

export const userSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: authRoleEnum,
  verified: z.enum(["pending", "complete"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: authRoleEnum,
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: authRoleEnum.optional(),
  verified: z.enum(["pending", "complete"]).optional(),
});

export type UserResponse = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
