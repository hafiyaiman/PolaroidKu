"use client";

import * as React from "react";
import { Field as FormischField, Form, useForm } from "@formisch/react";
import type { SubmitHandler } from "@formisch/react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Camera } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth/client";
import { LoginSchema } from "@/lib/auth/schemas";
import { useMutation } from "@tanstack/react-query";
import { loginWithEmail } from "@/app/(auth)/actions/auth-actions";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm({
    schema: LoginSchema,
    initialInput: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginWithEmail,
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const socialMutation = useMutation({
    mutationFn: async (provider: "google" | "github") => {
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/dashboard`,
        disableRedirect: true,
      });
      if (error) {
        throw new Error(error.message || "Failed to log in.");
      }
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit: SubmitHandler<typeof LoginSchema> = (output) => {
    setError(null);
    loginMutation.mutate(output);
  };

  const handleSignInSocial = (provider: "google" | "github") => {
    setError(null);
    socialMutation.mutate(provider);
  };

  const isPending = loginMutation.isPending || socialMutation.isPending;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form of={form} id="login-form" onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Camera className="size-6" weight="fill" />
              </div>
              <span className="sr-only">PolaroidKu</span>
            </a>
            <h1 className="text-2xl font-bold tracking-tight">Welcome to PolaroidKu</h1>
            <FieldDescription>
              Don&apos;t have an account? <a href="/signup" className="underline underline-offset-4 hover:text-primary">Sign up</a>
            </FieldDescription>
          </div>
          <FormischField of={form} path={["email"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  {...field.props}
                  id="login-email"
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
          <FormischField of={form} path={["password"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  {...field.props}
                  id="login-password"
                  type="password"
                  value={field.input ?? ""}
                  autoComplete="current-password"
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button" onClick={() => handleSignInSocial("github")}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleSignInSocial("google")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </Form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
