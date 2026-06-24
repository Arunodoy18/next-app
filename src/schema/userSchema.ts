import { z } from "zod";

export const authRoleEnum = z.enum(
  ["Student", "Instructor", "Admin", "Human Resources", "Project Management", "Business Development"],
  { message: "Please select a role" }
);

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
  email: z.string().email("Please enter a valid email"),
  role: authRoleEnum,
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  email: z.string().email("Please enter a valid email").optional(),
  role: authRoleEnum.optional(),
  verified: z.enum(["pending", "complete"]).optional(),
});

export type UserResponse = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
