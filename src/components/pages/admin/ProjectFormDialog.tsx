import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { Edit2, Plus, Save, X } from "lucide-react";

import { useDataMutation } from "@/api/handler";
import {
  PROJECT_STATUS_LABELS,
  ProjectFormSchema,
  ProjectStatus,
  type Project,
  type ProjectEditRequest,
  type ProjectRequest,
  type SimpleResponse,
} from "@/lib/objects";
import {
  DEFAULT_PROJECT_ICON,
  PROJECT_ICONS,
  PROJECT_ICON_KEYS,
  isProjectIconKey,
  projectIcon,
} from "@/lib/project-icons";
import {
  accentActionClass,
  cancelButtonClass,
  formDialogClass,
  inputClass,
  primaryButtonClass,
  selectContentClass,
  selectTriggerClass,
  submitButtonClass,
} from "@/lib/styles";
import { cn } from "@/lib/utils";

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STATUS_VALUES = [
  ProjectStatus.Active,
  ProjectStatus.Maintenance,
  ProjectStatus.Hidden,
] as const;

type ProjectFormDialogProps = { project?: Project };

function defaultsFor(project?: Project): ProjectRequest {
  return project
    ? {
        slug: project.slug,
        name: project.name,
        description: project.description,
        url: project.url,
        icon: isProjectIconKey(project.icon)
          ? project.icon
          : DEFAULT_PROJECT_ICON,
        status: project.status,
      }
    : {
        slug: "",
        name: "",
        description: "",
        url: "",
        icon: DEFAULT_PROJECT_ICON,
        status: ProjectStatus.Active,
      };
}

export function ProjectFormDialog({ project }: ProjectFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = project !== undefined;
  const idPrefix = isEdit ? `project-${project.id}` : "project-new";

  const { mutateAsync, isPending } = useDataMutation<
    ProjectRequest | ProjectEditRequest,
    SimpleResponse
  >("auth", isEdit ? "/admin/projects/edit" : "/admin/projects/add", false, {
    // The tenant-facing list shares the same data.
    invalidateKey: [["admin", "projects"], ["projects"]],
    onSuccess: (response) => toast.success(response.message),
  });

  const {
    Field: FormField,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: defaultsFor(project),
    validators: { onSubmit: ProjectFormSchema },
    onSubmit: async ({ value }) => {
      const body: ProjectRequest = {
        slug: value.slug.trim(),
        name: value.name.trim(),
        description: value.description.trim(),
        url: value.url.trim(),
        icon: value.icon,
        status: value.status,
      };
      try {
        await mutateAsync(isEdit ? { ...body, id: project.id } : body);
        reset();
        setOpen(false);
      } catch {
        // Reported by the global mutation error handler.
      }
    },
  });

  const textField = (
    name: "name" | "slug" | "url",
    label: string,
    extra: React.ComponentProps<typeof Input> & { hint?: string } = {},
  ) => {
    const { hint, ...inputProps } = extra;
    return (
      <FormField
        name={name}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          const id = `${idPrefix}-${name}`;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={id}>{label}</FieldLabel>
              <Input
                id={id}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                disabled={isPending}
                autoComplete="off"
                className={inputClass}
                {...inputProps}
              />
              {hint && <FieldDescription>{hint}</FieldDescription>}
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
    );
  };

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
          isEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${project.name}`}
              title={`Edit ${project.name}`}
              className={accentActionClass}
            />
          ) : (
            <Button className={primaryButtonClass} />
          )
        }
      >
        {isEdit ? (
          <Edit2 aria-hidden="true" />
        ) : (
          <>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add project
          </>
        )}
      </DialogTrigger>
      <DialogContent
        className={cn(formDialogClass, "sm:max-w-lg")}
        showCloseButton={false}
      >
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
              {isEdit ? (
                <>
                  Edit{" "}
                  <span className="wrap-anywhere text-lime-500">
                    {project.name}
                  </span>
                </>
              ) : (
                <>
                  Add <span className="text-lime-500">project</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Projects appear on the Apps page of every user granted access.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-1">
            {textField("name", "Name", { maxLength: 100 })}
            {textField("slug", "Slug", {
              spellCheck: false,
              maxLength: 50,
              hint: "Lowercase letters, digits and dashes. Manager and Wallet match it on login redirects.",
            })}
            {textField("url", "URL", {
              type: "url",
              inputMode: "url",
              spellCheck: false,
              maxLength: 255,
              placeholder: "https://",
            })}
            <FormField
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const id = `${idPrefix}-description`;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={id}>Description</FieldLabel>
                    <Textarea
                      id={id}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={isPending}
                      maxLength={500}
                      rows={3}
                      className={inputClass}
                    />
                    <FieldDescription>Up to 500 characters.</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="icon"
                children={(field) => {
                  const labelId = `${idPrefix}-icon-label`;
                  return (
                    <Field>
                      <FieldLabel id={labelId}>Icon</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => {
                          if (value) field.handleChange(value);
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          aria-labelledby={labelId}
                          className={selectTriggerClass}
                        >
                          <SelectValue>
                            {(value: string | null) => {
                              const key = value ?? DEFAULT_PROJECT_ICON;
                              const Icon = projectIcon(key);
                              return (
                                <span className="flex items-center gap-2">
                                  <Icon aria-hidden="true" />
                                  {isProjectIconKey(key)
                                    ? PROJECT_ICONS[key].label
                                    : key}
                                </span>
                              );
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className={selectContentClass}>
                          <SelectGroup>
                            {PROJECT_ICON_KEYS.map((key) => {
                              const Icon = PROJECT_ICONS[key].icon;
                              return (
                                <SelectItem
                                  key={key}
                                  value={key}
                                  className="rounded-md"
                                >
                                  <Icon aria-hidden="true" />
                                  {PROJECT_ICONS[key].label}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  );
                }}
              />
              <FormField
                name="status"
                children={(field) => {
                  const labelId = `${idPrefix}-status-label`;
                  return (
                    <Field>
                      <FieldLabel id={labelId}>Status</FieldLabel>
                      <Select
                        value={String(field.state.value)}
                        onValueChange={(value) => {
                          const status = STATUS_VALUES.find(
                            (s) => String(s) === value,
                          );
                          if (status) field.handleChange(status);
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          aria-labelledby={labelId}
                          className={selectTriggerClass}
                        >
                          <SelectValue>
                            {(value: string | null) =>
                              PROJECT_STATUS_LABELS[
                                STATUS_VALUES.find(
                                  (s) => String(s) === value,
                                ) ?? ProjectStatus.Active
                              ]
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className={selectContentClass}>
                          <SelectGroup>
                            {STATUS_VALUES.map((status) => (
                              <SelectItem
                                key={status}
                                value={String(status)}
                                className="rounded-md"
                              >
                                {PROJECT_STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Maintenance and hidden projects are visible to admins
                        only.
                      </FieldDescription>
                    </Field>
                  );
                }}
              />
            </div>
          </FieldGroup>
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
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
