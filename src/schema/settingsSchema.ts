import { z } from "zod";

export const changeNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export type ChangeNameInput = z.infer<typeof changeNameSchema>;
