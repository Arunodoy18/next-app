import { z } from "zod";

export const changeNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export const changeCredentialsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const requestCredentialsResetSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const verifyCredentialsSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
});

export type ChangeNameInput = z.infer<typeof changeNameSchema>;
export type ChangeCredentialsInput = z.infer<typeof changeCredentialsSchema>;
export type RequestCredentialsResetInput = z.infer<typeof requestCredentialsResetSchema>;
export type VerifyCredentialsInput = z.infer<typeof verifyCredentialsSchema>;
