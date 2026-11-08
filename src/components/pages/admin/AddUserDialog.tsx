import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { UserPlus } from "lucide-react";

import { useDataMutation } from "@/api/handler";
import {
  AddUserFormSchema,
  type AddUserRequest,
  type AddUserResponse,
  type Project,
} from "@/lib/objects";

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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ProjectChecklist } from "@/components/pages/admin/ProjectChecklist";
import { type TemporaryPassword } from "@/components/pages/admin/TemporaryPasswordDialog";

type AddUserDialogProps = {
  projects: Project[];
  onCreated: (secret: TemporaryPassword) => void;
};

export function AddUserDialog({ projects, onCreated }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending } = useDataMutation<
    AddUserRequest,
    AddUserResponse
  >("auth", "/admin/users/add", false, {
    invalidateKey: [["admin", "users"]],
  });

  const {
    Field: FormField,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: { email: "", project_ids: [] as number[] },
    validators: { onSubmit: AddUserFormSchema },
    onSubmit: async ({ value }) => {
      try {
        const response = await mutateAsync({
          email: value.email.trim(),
          project_ids: value.project_ids,
        });
        reset();
        setOpen(false);
        onCreated({
          email: response.user.email,
          password: response.temporary_password,
        });
      } catch {
        // Reported by the global mutation error handler.
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500" />
        }
      >
        <UserPlus data-icon="inline-start" aria-hidden="true" />
        Add user
      </DialogTrigger>
      <DialogContent className="border border-white bg-neutral-950">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            A temporary password is generated and shown once. The user sets
            their own password at first login.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-user-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FieldGroup>
            <FormField
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="add-user-email">Email</FieldLabel>
                    <Input
                      id="add-user-email"
                      name={field.name}
                      type="email"
                      autoComplete="off"
                      spellCheck={false}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={isPending}
                      required
                      className="rounded-md focus-visible:border-lime-500 focus-visible:ring-0"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
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
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" className="rounded-md" />}
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="add-user-form"
            disabled={isPending}
            className="rounded-md bg-lime-500 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
          >
            {isPending ? "Creating..." : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
