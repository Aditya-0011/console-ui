import { useState } from "react";

import { useDataMutation } from "@/api/handler";
import {
  type Project,
  type SimpleResponse,
  type User,
  type UserProjectsRequest,
} from "@/lib/objects";
import { toast } from "sonner";

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
import { ProjectChecklist } from "@/components/pages/admin/ProjectChecklist";

type EditProjectsDialogProps = {
  user: User;
  projects: Project[];
  disabled: boolean;
  disabledReason?: string;
};

export function EditProjectsDialog({
  user,
  projects,
  disabled,
  disabledReason,
}: EditProjectsDialogProps) {
  const [open, setOpen] = useState(false);
  // Draft selection, re-seeded from the user every time the dialog opens.
  const [selection, setSelection] = useState<number[]>(user.project_ids);

  const { mutate, isPending } = useDataMutation<
    UserProjectsRequest,
    SimpleResponse
  >("auth", "/admin/users/projects", false, {
    invalidateKey: [["admin", "users"]],
    onSuccess: (response) => {
      toast.success(response.message || "Project access updated");
      setOpen(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) setSelection(user.project_ids);
        setOpen(isOpen);
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            title={disabled ? disabledReason : undefined}
            aria-label={`Edit project access for ${user.email}`}
            className="rounded-md text-lime-500 hover:bg-lime-500/10 hover:text-lime-400"
          />
        }
      >
        Projects
      </DialogTrigger>
      <DialogContent className="border border-white bg-neutral-950">
        <DialogHeader>
          <DialogTitle>Project access</DialogTitle>
          <DialogDescription>
            Choose which apps <span className="text-white">{user.email}</span>{" "}
            can open. This replaces their current access.
          </DialogDescription>
        </DialogHeader>
        <ProjectChecklist
          projects={projects}
          value={selection}
          onChange={setSelection}
          disabled={isPending}
        />
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" className="rounded-md" />}
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              mutate({ target_user_id: user.id, project_ids: selection })
            }
            className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
          >
            {isPending ? "Saving..." : "Save access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
