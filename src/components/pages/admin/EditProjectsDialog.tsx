import { useState } from "react";
import { useForm } from "@tanstack/react-form";

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
  const formId = `edit-projects-form-${user.id}`;

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

  const {
    Field: FormField,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: { project_ids: user.project_ids },
    onSubmit: ({ value }) => {
      mutate({ target_user_id: user.id, project_ids: value.project_ids });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) reset({ project_ids: user.project_ids });
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
            Choose which apps{" "}
            <span className="wrap-anywhere text-white">{user.email}</span> can
            open. This replaces their current access.
          </DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FormField
            name="project_ids"
            children={(field) => (
              <ProjectChecklist
                projects={projects}
                value={field.state.value}
                onChange={(next) => field.handleChange(next)}
                disabled={isPending}
              />
            )}
          />
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
            className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
          >
            {isPending ? "Saving..." : "Save access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
