import * as v from "valibot";

export const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("Email address is required."),
    v.email("Enter a valid email address."),
  ),
  password: v.pipe(v.string(), v.nonEmpty("Password is required.")),
});

export const SignupSchema = v.object({
  name: v.pipe(
    v.string(),
    v.nonEmpty("Name is required."),
    v.minLength(2, "Name must be at least 2 characters."),
  ),
  email: v.pipe(
    v.string(),
    v.nonEmpty("Email address is required."),
    v.email("Enter a valid email address."),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Password is required."),
    v.minLength(8, "Password must be at least 8 characters."),
  ),
});

export const EmailOtpSchema = v.object({
  otp: v.pipe(
    v.string(),
    v.nonEmpty("Verification code is required."),
    v.regex(/^\d{6}$/, "Enter the 6-digit verification code."),
  ),
});

export const ForgotPasswordSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("Email address is required."),
    v.email("Enter a valid email address."),
  ),
});

export const ResetPasswordSchema = v.object({
  otp: v.pipe(
    v.string(),
    v.nonEmpty("Verification code is required."),
    v.regex(/^\d{6}$/, "Enter the 6-digit verification code."),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Password is required."),
    v.minLength(8, "Password must be at least 8 characters."),
  ),
});
