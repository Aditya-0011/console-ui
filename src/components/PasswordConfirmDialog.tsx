import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { Save, X } from "lucide-react";

import { PASSWORD_MAX_LENGTH, PasswordConfirmFormSchema } from "@/lib/objects";
import {
  cancelButtonClass,
  destructiveButtonClass,
  destructiveFormDialogClass,
  formDialogClass,
  primaryButtonClass,
  submitButtonClass,
} from "@/lib/styles";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/PasswordInput";

type PasswordConfirmDialogProps = {
  id: string;
  triggerLabel: string;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  destructive?: boolean;
  isPending: boolean;
  /** Resolve true to close the dialog; false keeps it open (e.g. bad password). */
  onConfirm: (password: string) => Promise<boolean>;
};

export function PasswordConfirmDialog({
  id,
  triggerLabel,
  title,
  description,
  confirmLabel,
  pendingLabel,
  destructive = false,
  isPending,
  onConfirm,
}: PasswordConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    Field: FormField,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: PasswordConfirmFormSchema },
    onSubmit: async ({ value }) => {
      if (await onConfirm(value.password)) {
        reset();
        setOpen(false);
      }
    },
  });

  const inputId = `${id}-password`;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={destructive ? "outline" : "default"}
            className={
              destructive ? destructiveButtonClass : primaryButtonClass
            }
          />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent
        className={destructive ? destructiveFormDialogClass : formDialogClass}
        showCloseButton={false}
      >
        <form
          noValidate
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-1">
            <FormField
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={inputId}>
                      Confirm with your password
                    </FieldLabel>
                    <PasswordInput
                      id={inputId}
                      name={field.name}
                      autoComplete="current-password"
                      maxLength={PASSWORD_MAX_LENGTH}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={isPending}
                      required
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className={cancelButtonClass}
                />
              }
            >
              <X className="size-4" aria-hidden="true" />
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className={
                destructive
                  ? cn("flex items-center gap-1.5", destructiveButtonClass)
                  : submitButtonClass
              }
            >
              {!destructive && <Save className="size-4" aria-hidden="true" />}
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
