import { useId, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  accentActionClass,
  destructiveActionClass,
  destructiveButtonClass,
  destructiveDialogClass,
  dialogClass,
  lockedActionClass,
  submitButtonClass,
} from "@/lib/styles";
import { cn } from "@/lib/utils";

type ConfirmButtonProps = {
  label: React.ReactNode;
  icon?: React.ReactNode;
  ariaLabel?: string;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onConfirm: () => void;
};

type LockedButtonProps = {
  icon?: React.ReactNode;
  label: React.ReactNode;
  ariaLabel?: string;
  reason: string;
  className: string;
};

export function LockedButton({
  icon,
  label,
  ariaLabel,
  reason,
  className,
}: LockedButtonProps) {
  const reasonId = useId();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={icon ? "icon-sm" : "sm"}
        disabled
        focusableWhenDisabled
        aria-label={ariaLabel}
        aria-describedby={reasonId}
        title={reason}
        className={cn(className, lockedActionClass)}
      >
        {icon ?? label}
      </Button>
      <span id={reasonId} className="sr-only">
        {reason}
      </span>
    </>
  );
}

/** A small action button guarded by a confirmation dialog. */
export function ConfirmButton({
  label,
  icon,
  ariaLabel,
  title,
  description,
  confirmLabel,
  destructive = false,
  disabled = false,
  disabledReason,
  onConfirm,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerClass = destructive
    ? icon
      ? destructiveActionClass
      : destructiveButtonClass
    : accentActionClass;
  const hint = typeof label === "string" ? label : ariaLabel;

  if (disabledReason) {
    return (
      <LockedButton
        icon={icon}
        label={label}
        ariaLabel={ariaLabel}
        reason={disabledReason}
        className={triggerClass}
      />
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant={destructive && !icon ? "outline" : "ghost"}
            size={icon ? "icon-sm" : destructive ? "default" : "sm"}
            disabled={disabled}
            aria-label={ariaLabel}
            title={icon ? hint : undefined}
            className={triggerClass}
          />
        }
      >
        {icon ?? label}
      </AlertDialogTrigger>
      <AlertDialogContent
        className={destructive ? destructiveDialogClass : dialogClass}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            className={destructive ? destructiveButtonClass : submitButtonClass}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
