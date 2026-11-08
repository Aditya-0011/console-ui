import { Link, useNavigate } from "react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { KeyRound } from "lucide-react";

import { useDataMutation } from "@/api/handler";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  PASSWORD_MAX_LENGTH,
  ResetPasswordFormSchema,
  type ResetPasswordRequest,
  type SimpleResponse,
} from "@/lib/objects";

import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";

const inputClass =
  "rounded-md focus-visible:border-lime-500 focus-visible:ring-0 focus-visible:ring-lime-500";

export function Form() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const { submit, isPending } = useDataMutation<
    ResetPasswordRequest,
    SimpleResponse
  >("auth", "/reset-password", false, {
    skipAuthErrorHandling: true,
    onSuccess: (data) => {
      queryClient.clear();
      logout();
      toast.success(
        data.message || "Password reset. Log in with your new password.",
      );
      navigate("/login", { replace: true });
    },
  });

  const { Field: FormField, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      recovery_code: "",
      new_password: "",
      confirm_password: "",
    },
    validators: { onSubmit: ResetPasswordFormSchema },
    onSubmit: async ({ value }) => {
      await submit({
        email: value.email.trim(),
        recovery_code: value.recovery_code.trim().toUpperCase(),
        new_password: value.new_password,
      });
    },
  });

  return (
    <Card className="border-none bg-inherit ring-0">
      <CardContent>
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <KeyRound aria-hidden="true" className="size-10 text-lime-500" />
          <h1 className="text-xl font-semibold text-white">Reset password</h1>
          <p className="text-muted-foreground text-sm">
            Use one of your recovery codes. Every active session will be signed
            out.
          </p>
        </div>
        <form
          id="reset-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FieldGroup>
            <FormField
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                    <Input
                      id="reset-email"
                      name={field.name}
                      type="email"
                      autoComplete="username"
                      spellCheck={false}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      required
                      className={inputClass}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <FormField
              name="recovery_code"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="reset-code">Recovery code</FieldLabel>
                    <Input
                      id="reset-code"
                      name={field.name}
                      autoComplete="one-time-code"
                      autoCapitalize="characters"
                      spellCheck={false}
                      placeholder="ABCD-EFGH-IJKL-MNOP"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      required
                      className={`${inputClass} font-mono uppercase`}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <FormField
              name="new_password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="reset-new-password">
                      New password
                    </FieldLabel>
                    <PasswordInput
                      id="reset-new-password"
                      name={field.name}
                      autoComplete="new-password"
                      maxLength={PASSWORD_MAX_LENGTH}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      required
                    />
                    <FieldDescription>12 to 128 characters.</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <FormField
              name="confirm_password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="reset-confirm-password">
                      Confirm new password
                    </FieldLabel>
                    <PasswordInput
                      id="reset-confirm-password"
                      name={field.name}
                      autoComplete="new-password"
                      maxLength={PASSWORD_MAX_LENGTH}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      required
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <Field>
              <Button
                type="submit"
                form="reset-form"
                disabled={isPending}
                className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
              >
                {isPending ? "Resetting..." : "Reset password"}
              </Button>
              <Link
                to="/login"
                className="text-center text-xs text-lime-500 underline-offset-2 hover:underline"
              >
                Back to login
              </Link>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
