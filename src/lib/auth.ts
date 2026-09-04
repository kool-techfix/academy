import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = loginSchema
  .extend({
    name: z.string().min(1, 'Name is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const expertiseOptions = [
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'Mobile Development',
  'DevOps',
  'Database Administration',
  'UI/UX Design',
  'Other',
] as const;

export const instructorRegisterSchema = registerSchema
  .and(
    z.object({
      expertise: z.enum(expertiseOptions, {
        message: 'Select an area of expertise',
      }),
      otherExpertise: z.string().optional(),
    }),
  )
  .superRefine((data, context) => {
    if (data.expertise === 'Other' && !data.otherExpertise?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter your area of expertise',
        path: ['otherExpertise'],
      });
    }
  });

export type AuthValues = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export type InstructorRegisterValues = z.infer<typeof instructorRegisterSchema>;