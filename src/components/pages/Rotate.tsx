import { useState } from "react";

import { RefreshCw } from "lucide-react";

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
  destructiveActionClass,
  destructiveButtonClass,
  destructiveDialogClass,
} from "@/lib/styles";

type RotateProps = {
  description: string;
  name: string;
  title: string;
  isRotating: boolean;
  onRotate: () => void;
};

export function Rotate({
  description,
  name,
  title,
  isRotating,
  onRotate,
}: RotateProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title={title}
            aria-label={title}
            disabled={isRotating}
            className={destructiveActionClass}
          />
        }
      >
        <RefreshCw
          aria-hidden="true"
          className={
            isRotating ? "animate-spin motion-reduce:animate-none" : ""
          }
        />
      </AlertDialogTrigger>
      <AlertDialogContent className={destructiveDialogClass}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            How <span className="font-medium text-emerald-500/50">high</span>{" "}
            are you?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}{" "}
            <span className="font-medium text-red-500">{name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={destructiveButtonClass}
            onClick={() => {
              onRotate();
              setOpen(false);
            }}
            disabled={isRotating}
          >
            Rotate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
