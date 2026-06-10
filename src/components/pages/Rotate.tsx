import { RefreshCw } from "lucide-react";

import { type SimpleResponse } from "@/lib/objects";

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
  rotateAsync: (request: null) => Promise<SimpleResponse>;
};

export function Rotate({
  description,
  name,
  title,
  isRotating,
  rotateAsync,
}: RotateProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          variant="ghost"
          size="icon-sm"
          title={title}
          className="text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:ring hover:ring-red-500"
        >
          <RefreshCw className="size-4" />
        </Button>
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
            onClick={() => rotateAsync(null)}
            disabled={isRotating}
          >
            Rotate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
