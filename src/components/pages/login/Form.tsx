import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";

import { SquareChevronRight } from "lucide-react";

import { useDataMutation } from "@/api/handler";
import { useAuth } from "@/contexts/AuthContext";

import {
  LoginRequestSchema,
  PASSWORD_MAX_LENGTH,
  type Identity,
  type LoginRequest,
} from "@/lib/objects";
import { followProjectRedirect } from "@/lib/redirect";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";

export function Form({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const redirectTarget = searchParams.get("redirect");

  const { mutateAsync, isPending } = useDataMutation<LoginRequest, Identity>(
    "auth",
    "/login",
    false,
    // 401 here means bad credentials / expired temporary password / disabled
    // account; the server's message is shown as a toast, no session handling.
    { skipAuthErrorHandling: true },
  );

  const { Field: FormField, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => {
      let identity: Identity;
      try {
        identity = await mutateAsync({
          email: value.email.trim(),
          password: value.password,
        });
      } catch {
        return; // Reported by the global mutation error handler.
      }

      // Never show one user's cached data to the next.
      queryClient.clear();
      login(identity);

      // A temporary password routes to /welcome (LoginLayout keeps ?redirect=).
      if (identity.must_change_password) return;

      if (redirectTarget) {
        const leaving = await followProjectRedirect(
          redirectTarget,
          identity,
          searchParams.get("next"),
        );
        if (leaving) return;
      }
      navigate("/", { replace: true });
    },
  });

  return (
    <div className={cn("flex-col gap-6", className)} {...props}>
      <Card className="border-none bg-inherit ring-0">
        <CardContent>
          <div className="mb-8 flex items-center justify-center">
            <SquareChevronRight
              aria-hidden="true"
              className="size-10 text-lime-500"
            />
          </div>
          <h1 className="sr-only">Log in</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            id="login-form"
            noValidate
          >
            <FieldGroup>
              <FormField
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        autoComplete="username"
                        spellCheck={false}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type="email"
                        required
                        className="rounded-md focus-visible:border-lime-500 focus-visible:ring-0 focus-visible:ring-lime-500"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <FormField
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Link
                          to="/reset"
                          className="text-xs text-lime-500 underline-offset-2 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <PasswordInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        autoComplete="current-password"
                        maxLength={PASSWORD_MAX_LENGTH}
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
                  form="login-form"
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
                >
                  {isPending ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
