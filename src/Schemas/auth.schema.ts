import { z } from "zod";

const learnerRegisterSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const instructorRegisterSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  expertise: z.string().trim().min(2),
});

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
});

export { learnerRegisterSchema, instructorRegisterSchema, loginSchema };