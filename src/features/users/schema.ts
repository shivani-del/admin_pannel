import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Needs an uppercase letter")
  .regex(/[a-z]/, "Needs a lowercase letter")
  .regex(/[0-9]/, "Needs a number");

const pin = z.string().regex(/^\d{4,6}$/, "4–6 digit pin");

const baseFields = {
  full_name: z.string().trim().min(2, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  mobile: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Invalid mobile number"),
  projects: z.array(z.string()).min(1, "Pick at least one project"),
  budgets: z.array(z.string()).min(1, "Pick at least one budget"),
};

export const createUserSchema = z.object({
  ...baseFields,
  password: strongPassword,
  secure_pin: pin,
});

export const updateUserSchema = z.object({
  ...baseFields,
  password: z.union([z.literal(""), strongPassword]).optional(),
  secure_pin: z.union([z.literal(""), pin]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
