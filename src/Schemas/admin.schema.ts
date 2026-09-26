import { z } from "zod";

// IDs are Prisma cuid()s; this rejects anything that could not be one.
export const adminIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{1,64}$/, "Invalid ID");

export const moderationReasonSchema = z.object({
  reason: z
    .string({ required_error: "A reason is required" })
    .trim()
    .min(10, "Please give a reason of at least 10 characters")
    .max(1000, "Reason must be 1000 characters or fewer"),
});

export const instructorStatusFilterSchema = z
  .enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"])
  .optional();

export const moderatedUserRoleSchema = z
  .enum(["LEARNER", "INSTRUCTOR"])
  .optional();

export type ModerationReasonInput = z.infer<typeof moderationReasonSchema>;
