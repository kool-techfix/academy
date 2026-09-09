import { z } from "zod";

export const createEnrollmentSchema = z.object({
  courseId: z
    .string()
    .min(1, "Course ID is required"),
});

export type CreateEnrollmentInput = z.infer<
  typeof createEnrollmentSchema
>;