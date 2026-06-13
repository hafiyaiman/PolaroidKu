"use client";

import { Field as FormischField, Form, useForm } from "@formisch/react";
import type { SubmitHandler } from "@formisch/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Camera } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth/client";
import { ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/auth/schemas";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useMutation } from "@tanstack/react-query";
import * as v from "valibot";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import {
  sendForgotPasswordOtp,
} from "@/app/(auth)/actions/auth-actions";

type Step = "forgot" | "reset";

export function ForgotPasswordForm({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const forgotForm = useForm({
    schema: ForgotPasswordSchema,
    initialInput: {
      email: "",
    },
  });

  const resetForm = useForm({
    schema: ResetPasswordSchema,
    initialInput: {
      otp: "",
      password: "",
    },
  });

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const sendOtpMutation = useMutation({
    mutationFn: async (output: v.InferOutput<typeof ForgotPasswordSchema>) => {
      await sendForgotPasswordOtp(output);
      return output.email;
    },
    onSuccess: (submittedEmail) => {
      setEmail(submittedEmail);
      setMessage("Verification code sent to " + submittedEmail + ". Check your inbox.");
      setStep("reset");
      setCountdown(60);
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (output: v.InferOutput<typeof ResetPasswordSchema>) => {
      const { data, error } = await authClient.emailOtp.resetPassword({
        email,
        otp: output.otp,
        password: output.password,
      });
      if (error) {
        throw new Error(error.message || "Failed to reset password.");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully. You can now log in.");
      router.push("/login");
      router.refresh();
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => sendForgotPasswordOtp({ email }),
    onSuccess: () => {
      setMessage("Verification code resent. Check your inbox.");
      setCountdown(60);
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const handleSendOtp: SubmitHandler<typeof ForgotPasswordSchema> = (output) => {
    setError(null);
    setMessage(null);
    sendOtpMutation.mutate(output);
  };

  const handleResetPassword: SubmitHandler<typeof ResetPasswordSchema> = (output) => {
    setError(null);
    setMessage(null);
    resetPasswordMutation.mutate(output);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setError(null);
    setMessage(null);
    resendMutation.mutate();
  };

  const isPending =
    sendOtpMutation.isPending ||
    resetPasswordMutation.isPending ||
    resendMutation.isPending;

  if (step === "reset") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Form of={resetForm} id="reset-password-form" onSubmit={handleResetPassword}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Camera className="size-6" weight="fill" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset password</h1>
              <FieldDescription>
                Enter the 6-digit verification code sent to <strong className="text-foreground">{email}</strong> and your new password.
              </FieldDescription>
            </div>

            <FormischField of={resetForm} path={["otp"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="reset-otp">Verification Code</FieldLabel>
                  <div className="flex justify-center py-2">
                    <InputOTP
                      id="reset-otp"
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={field.input ?? ""}
                      onChange={field.onChange}
                      aria-invalid={field.errors !== null}
                      required
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>

            <FormischField of={resetForm} path={["password"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="reset-password">New Password</FieldLabel>
                  <Input
                    {...field.props}
                    id="reset-password"
                    type="password"
                    value={field.input ?? ""}
                    autoComplete="new-password"
                    aria-invalid={field.errors !== null}
                    placeholder="••••••••"
                    required
                  />
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>

            {message && <FieldDescription className="text-emerald-600 dark:text-emerald-400 text-center font-medium">{message}</FieldDescription>}
            {error && <FieldError>{error}</FieldError>}

            <Field>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </Field>

            <div className="grid gap-2 sm:grid-cols-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={isPending || countdown > 0}
                className="w-full"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("forgot")}
                disabled={isPending}
                className="w-full"
              >
                Back to Email
              </Button>
            </div>
          </FieldGroup>
        </Form>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form of={forgotForm} id="forgot-password-form" onSubmit={handleSendOtp}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Camera className="size-6" weight="fill" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot password</h1>
            <FieldDescription>
              Enter your email address and we&apos;ll send you a verification code to reset your password.
            </FieldDescription>
          </div>

          <FormischField of={forgotForm} path={["email"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="forgot-email">Email Address</FieldLabel>
                <Input
                  {...field.props}
                  id="forgot-email"
                  type="email"
                  value={field.input ?? ""}
                  placeholder="m@example.com"
                  autoComplete="email"
                  aria-invalid={field.errors !== null}
                  required
                />
                {field.errors && (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                )}
              </Field>
            )}
          </FormischField>

          {error && <FieldError>{error}</FieldError>}

          <Field>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Sending..." : "Send Reset Code"}
            </Button>
          </Field>

          <div className="text-center text-sm text-muted-foreground mt-2">
            Remembered your password?{" "}
            <a href="/login" className="underline underline-offset-4 hover:text-primary font-medium">
              Back to Login
            </a>
          </div>
        </FieldGroup>
      </Form>
    </div>
  );
}
