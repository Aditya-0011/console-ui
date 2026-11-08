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
            className="text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:ring hover:ring-red-500"
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
      <AlertDialogContent className="border border-red-500">
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-neutral-950! text-red-500 hover:bg-red-500/10! hover:text-red-600 hover:ring hover:ring-red-500"
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
