import { z } from "zod";

export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export const loginRequestSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  method: z.enum(["link", "otp"]),
});

export const otpVerifySchema = z.object({
  email: z.string().email("Please enter a valid email"),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type LoginRequestInput = z.infer<typeof loginRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
