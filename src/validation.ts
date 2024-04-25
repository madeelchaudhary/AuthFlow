import * as z from "zod";

export const SignUpSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .and(
        z.string().regex(/[A-Z]/, {
          message: "Password must contain at least one uppercase letter",
        })
      )
      .and(
        z.string().regex(/[a-z]/, {
          message: "Password must contain at least one lowercase letter",
        })
      )
      .and(
        z.string().regex(/[0-9]/, {
          message: "Password must contain at least one number",
        })
      ),
    confirmPassword: z.string({
      required_error: "Confirm password is required",
    }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
        fatal: true,
      });
    }
  });

export const SignInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string({ required_error: "Password is required" }),
});
