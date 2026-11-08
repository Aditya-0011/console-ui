import { useState } from "react";

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
import { cn } from "@/lib/utils";

type ConfirmButtonProps = {
  label: React.ReactNode;
  ariaLabel?: string;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onConfirm: () => void;
};

/** A small action button guarded by a confirmation dialog. */
export function ConfirmButton({
  label,
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

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={ariaLabel}
            title={disabled ? disabledReason : undefined}
            className={cn(
              "rounded-md",
              destructive
                ? "text-red-500 hover:bg-red-500/10 hover:text-red-400"
                : "text-lime-500 hover:bg-lime-500/10 hover:text-lime-400",
            )}
          />
        }
      >
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent
        className={
          destructive ? "border border-red-500" : "border border-white"
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            className={
              destructive
                ? "bg-neutral-950! text-red-500 hover:bg-red-500/10! hover:text-red-600 hover:ring hover:ring-red-500"
                : "rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
