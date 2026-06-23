"use server";

import { auth } from "@/lib/auth/server";
import {
  LoginSchema,
  SignupSchema,
  ForgotPasswordSchema,
} from "@/lib/auth/schemas";
import * as v from "valibot";

export async function loginWithEmail(input: v.InferOutput<typeof LoginSchema>) {
  const { data, error } = await auth.signIn.email(input);
  if (error) {
    throw new Error(error.message || "Failed to log in.");
  }
  return data;
}

export async function signUpWithEmail(input: v.InferOutput<typeof SignupSchema>) {
  const { data, error } = await auth.signUp.email(input);
  if (error) {
    throw new Error(error.message || "Failed to create account.");
  }
  return data;
}

export async function verifyEmailOtp(input: { email: string; otp: string }) {
  const { data, error } = await (auth as any).emailOtp.verifyEmail(input);
  if (error) {
    throw new Error(error.message || "Failed to verify email.");
  }
  return data;
}

export async function resendSignupVerification(input: { email: string; callbackUrl: string }) {
  const { error } = await auth.sendVerificationEmail({
    email: input.email,
    callbackURL: input.callbackUrl,
  });
  if (error) {
    throw new Error(error.message || "Failed to resend verification code.");
  }
}

export async function sendForgotPasswordOtp(input: v.InferOutput<typeof ForgotPasswordSchema>) {
  const { error } = await (auth as any).emailOtp.sendVerificationOtp({
    email: input.email,
    type: "forget-password",
  });
  if (error) {
    throw new Error(error.message || "Failed to send reset code.");
  }
}



export async function signOutAction() {
  await auth.signOut();
}
