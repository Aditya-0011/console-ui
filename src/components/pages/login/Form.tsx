import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { SquareChevronRight, Eye, EyeOff } from "lucide-react";

import { useDataMutation } from "@/api/handler";
import { useAuth } from "@/contexts/AuthContext";

import {
  LoginRequestSchema,
  AppListSchema,
  type LoginRequest,
  type SimpleResponse,
} from "@/lib/objects";
import { appUrlMapping } from "@/components/pages/apps/List";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

export function Form({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const redirectTarget = searchParams.get("redirect");

  const { mutateAsync, isPending } = useDataMutation<
    LoginRequest,
    SimpleResponse
  >("auth", "/login", false, {
    onSuccess: () => {
      login();
      if (redirectTarget) {
        const parsed = AppListSchema.safeParse(redirectTarget);
        if (parsed.success && parsed.data !== "Portfolio") {
          const app = appUrlMapping.find((a) => a.name === parsed.data);
          if (app) {
            window.location.href = app.url;
            return;
          }
        }
      }
      navigate("/", { replace: true });
    },
  });

  const { Field: FormField, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => {
      if (redirectTarget) {
        const parsed = AppListSchema.safeParse(redirectTarget);
        if (!parsed.success || parsed.data === "Portfolio") {
          toast.error("Invalid redirect target application.", {
            toasterId: "root",
          });
          return;
        }
      }
      await mutateAsync(value);
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("flex-col gap-6", className)} {...props}>
      <Card className="border-none bg-inherit ring-0">
        <CardContent>
          <div className="mb-8 flex items-center justify-center">
            <SquareChevronRight className="size-10 text-lime-500" />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            id="login-form"
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
                        autoComplete="off"
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
                      <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      </div>
                      <InputGroup className="rounded-md has-[[data-slot=input-group-control]:focus-visible]:border-lime-500 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-lime-500">
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          autoComplete="off"
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          type={showPassword ? "text" : "password"}
                          required
                        />
                        <InputGroupAddon align="inline-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-lime-600 hover:text-lime-500 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <Eye /> : <EyeOff />}
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
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
