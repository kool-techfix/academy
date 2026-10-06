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

const expertiseFields = z.object({
  expertise: z.enum(expertiseOptions, {
    message: 'Select an area of expertise',
  }),
  otherExpertise: z.string().optional(),
});

const requireOtherExpertise = (
  data: z.infer<typeof expertiseFields>,
  context: z.RefinementCtx,
) => {
  if (data.expertise === 'Other' && !data.otherExpertise?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter your area of expertise',
      path: ['otherExpertise'],
    });
  }
};

export const instructorRegisterSchema = registerSchema
  .and(expertiseFields)
  .superRefine(requireOtherExpertise);

/** Expertise-only step after verifying an instructor's email with Google. */
export const instructorExpertiseSchema =
  expertiseFields.superRefine(requireOtherExpertise);

export type InstructorExpertiseValues = z.infer<typeof instructorExpertiseSchema>;

export type AuthValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export type InstructorRegisterValues = z.infer<typeof instructorRegisterSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be 128 characters or fewer'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
