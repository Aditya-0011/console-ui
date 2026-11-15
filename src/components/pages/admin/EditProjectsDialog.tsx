import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { FolderKanban, Save, X } from "lucide-react";

import { useDataMutation } from "@/api/handler";
import {
  type Project,
  type SimpleResponse,
  type User,
  type UserProjectsRequest,
} from "@/lib/objects";
import {
  accentActionClass,
  cancelButtonClass,
  formDialogClass,
  submitButtonClass,
} from "@/lib/styles";
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
import { LockedButton } from "@/components/ConfirmButton";
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
  const label = `Edit project access for ${user.email}`;

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

  if (disabledReason) {
    return (
      <LockedButton
        icon={<FolderKanban aria-hidden="true" />}
        label="Projects"
        ariaLabel={label}
        reason={disabledReason}
        className={accentActionClass}
      />
    );
  }

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
            size="icon-sm"
            disabled={disabled}
            title="Project access"
            aria-label={label}
            className={accentActionClass}
          />
        }
      >
        <FolderKanban aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className={formDialogClass} showCloseButton={false}>
        <form
          noValidate
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              Project <span className="text-lime-500">access</span>
            </DialogTitle>
            <DialogDescription>
              Choose which apps{" "}
              <span className="wrap-anywhere text-white">{user.email}</span> can
              open. This replaces their current access.
            </DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className={cancelButtonClass}
                />
              }
            >
              <X className="size-4" aria-hidden="true" />
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className={submitButtonClass}
            >
              <Save className="size-4" aria-hidden="true" />
              {isPending ? "Saving..." : "Save access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
