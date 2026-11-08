import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { PASSWORD_MAX_LENGTH, PasswordConfirmFormSchema } from "@/lib/objects";

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

const destructiveClass =
  "rounded-md bg-neutral-950 text-red-500 ring ring-red-500/50 hover:bg-red-500/10 hover:text-red-400";
const primaryClass =
  "rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500";

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

  const formId = `${id}-form`;
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
            className={destructive ? destructiveClass : primaryClass}
          />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent
        className={
          destructive
            ? "border border-red-500 bg-neutral-950"
            : "border border-white bg-neutral-950"
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FieldGroup>
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
        </form>
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" className="rounded-md" />}
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form={formId}
            disabled={isPending}
            className={destructive ? destructiveClass : primaryClass}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
