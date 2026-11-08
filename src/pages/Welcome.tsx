import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "@tanstack/react-form";

import { ShieldCheck } from "lucide-react";

import { useDataMutation } from "@/api/handler";
import { useAuth } from "@/contexts/AuthContext";
import {
  FirstLoginFormSchema,
  PASSWORD_MAX_LENGTH,
  type FirstLoginRequest,
  type RecoveryCodesResponse,
} from "@/lib/objects";
import { followProjectRedirect } from "@/lib/redirect";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/PasswordInput";
import { BackupCodesList } from "@/components/pages/security/BackupCodesList";

const FIELDS = [
  {
    name: "new_password",
    label: "New password",
    description: "12 to 128 characters.",
  },
  { name: "confirm_password", label: "Confirm new password" },
] as const;

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { identity, completeFirstLogin } = useAuth();

  // Step 2 state: the codes exist only here, only until the user continues.
  const [codes, setCodes] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const { mutateAsync, isPending } = useDataMutation<
    FirstLoginRequest,
    RecoveryCodesResponse
  >("auth", "/first-login", false);

  const { Field: FormField, handleSubmit } = useForm({
    defaultValues: { new_password: "", confirm_password: "" },
    validators: { onSubmit: FirstLoginFormSchema },
    onSubmit: async ({ value }) => {
      try {
        const response = await mutateAsync({
          new_password: value.new_password,
        });
        setCodes(response.codes);
      } catch {
        // Reported by the global mutation error handler.
      }
    },
  });

  const handleContinue = async () => {
    if (!identity) return;
    setIsLeaving(true);
    const redirectTarget = searchParams.get("redirect");
    const finishedIdentity = { ...identity, must_change_password: false };
    if (redirectTarget) {
      const leaving = await followProjectRedirect(
        redirectTarget,
        finishedIdentity,
        searchParams.get("next"),
      );
      if (leaving) return;
    }
    completeFirstLogin();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg items-center justify-center p-6 md:p-10">
      <Card className="w-full border-none bg-inherit ring-0">
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <ShieldCheck aria-hidden="true" className="size-10 text-lime-500" />
            <h1 className="text-xl font-semibold text-white">
              {codes ? "Save your backup codes" : "Welcome"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {codes
                ? "Each code resets your password once if you lose it. They are shown only now and cannot be retrieved later."
                : `Signed in as ${identity?.email ?? "you"} with a temporary password. Choose your own password to continue.`}
            </p>
            <p className="text-muted-foreground text-xs" aria-live="polite">
              Step {codes ? 2 : 1} of 2
            </p>
          </div>

          {codes ? (
            <div className="flex flex-col gap-5">
              <BackupCodesList codes={codes} />
              <Field orientation="horizontal">
                <Checkbox
                  id="welcome-saved"
                  checked={saved}
                  onCheckedChange={(checked) => setSaved(checked)}
                />
                <FieldLabel htmlFor="welcome-saved" className="font-normal">
                  I saved my backup codes somewhere safe
                </FieldLabel>
              </Field>
              <Button
                type="button"
                disabled={!saved || isLeaving}
                onClick={() => void handleContinue()}
                className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
              >
                {isLeaving ? "Continuing..." : "Continue"}
              </Button>
            </div>
          ) : (
            <form
              id="welcome-form"
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
                      const id = `welcome-${config.name}`;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={id}>{config.label}</FieldLabel>
                          <PasswordInput
                            id={id}
                            name={field.name}
                            autoComplete="new-password"
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
                <Field>
                  <Button
                    type="submit"
                    form="welcome-form"
                    disabled={isPending}
                    className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
                  >
                    {isPending ? "Saving..." : "Set password"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
