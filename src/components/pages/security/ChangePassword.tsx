import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { useDataMutation } from "@/api/handler";
import {
  ChangePasswordFormSchema,
  PASSWORD_MAX_LENGTH,
  type ChangePasswordRequest,
  type SimpleResponse,
} from "@/lib/objects";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";

const FIELDS = [
  {
    name: "current_password",
    label: "Current password",
    autoComplete: "current-password",
  },
  {
    name: "new_password",
    label: "New password",
    autoComplete: "new-password",
    description: "12 to 128 characters.",
  },
  {
    name: "confirm_password",
    label: "Confirm new password",
    autoComplete: "new-password",
  },
] as const;

export function ChangePassword() {
  const { submit, isPending } = useDataMutation<
    ChangePasswordRequest,
    SimpleResponse
  >("auth", "/change-password", false, {
    invalidateKey: [["sessions"]],
    onSuccess: (data) => {
      toast.success(data.message || "Password changed");
    },
  });

  const {
    Field: FormField,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validators: { onSubmit: ChangePasswordFormSchema },
    onSubmit: async ({ value }) => {
      const changed = await submit({
        current_password: value.current_password,
        new_password: value.new_password,
      });
      if (changed) reset();
    },
  });

  return (
    <Card className="bg-muted/5 ring ring-white/10">
      <CardHeader>
        <CardTitle>
          <h2>Change password</h2>
        </CardTitle>
        <CardDescription>
          Signs out your other devices; this one stays signed in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="change-password-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FieldGroup>
            {FIELDS.map((config) => (
              <FormField
                key={config.name}
                name={config.name}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const id = `change-${config.name}`;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={id}>{config.label}</FieldLabel>
                      <PasswordInput
                        id={id}
                        name={field.name}
                        autoComplete={config.autoComplete}
                        maxLength={PASSWORD_MAX_LENGTH}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        disabled={isPending}
                        required
                      />
                      {"description" in config && (
                        <FieldDescription>
                          {config.description}
                        </FieldDescription>
                      )}
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            ))}
            <Field orientation="horizontal" className="justify-end">
              <Button
                type="submit"
                form="change-password-form"
                disabled={isPending}
                className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
              >
                {isPending ? "Saving..." : "Change password"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
