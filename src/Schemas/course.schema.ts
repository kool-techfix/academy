import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Course title must be at least 3 characters")
    .max(150, "Course title is too long"),

  description: z
    .string()
    .min(10, "Course description must be at least 10 characters")
    .max(2000, "Course description is too long"),
});

export type CreateCourseInput =
  z.infer<typeof createCourseSchema>;

export const updateCourseSchema =
  createCourseSchema.partial();

export type UpdateCourseInput =
  z.infer<typeof updateCourseSchema>;