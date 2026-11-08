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

type NewKeyDialogProps = {
  apiKey: string | null;
  onClose: () => void;
};

export function NewKeyDialog({ apiKey, onClose }: NewKeyDialogProps) {
  return (
    <AlertDialog
      open={apiKey !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent className="border border-lime-500 sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Your new API key</AlertDialogTitle>
          <AlertDialogDescription>
            Copy it now. It is stored hashed and cannot be shown again. Update
            every client that uses the old key.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <code
          translate="no"
          className="block rounded-md bg-neutral-900 p-3 font-mono text-sm break-all text-lime-400"
        >
          {apiKey}
        </code>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              apiKey && copyText(apiKey, "Key copied to clipboard")
            }
          >
            <Copy data-icon="inline-start" aria-hidden="true" />
            Copy key
          </Button>
          <AlertDialogAction onClick={onClose}>I saved it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
