import { Copy } from "lucide-react";

import { copyText } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export type TemporaryPassword = { email: string; password: string };

type TemporaryPasswordDialogProps = {
  value: TemporaryPassword | null;
  onClose: () => void;
};

/** Shows a temporary password exactly once; nothing is cached or stored. */
export function TemporaryPasswordDialog({
  value,
  onClose,
}: TemporaryPasswordDialogProps) {
  return (
    <AlertDialog
      open={value !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent className="border border-lime-500 sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Temporary password</AlertDialogTitle>
          <AlertDialogDescription>
            For <span className="text-white">{value?.email}</span>. It is valid
            for 7 days, and the user must change it at first login. It will not
            be shown again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <code
          translate="no"
          className="block rounded-md bg-neutral-900 p-3 font-mono text-sm break-all text-lime-400"
        >
          {value?.password}
        </code>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              value && copyText(value.password, "Temporary password copied")
            }
          >
            <Copy data-icon="inline-start" aria-hidden="true" />
            Copy
          </Button>
          <AlertDialogAction onClick={onClose}>Done</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
