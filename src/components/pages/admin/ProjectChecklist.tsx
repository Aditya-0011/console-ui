import { useId } from "react";

import { type Project } from "@/lib/objects";
import { projectIcon } from "@/lib/project-icons";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";

type ProjectChecklistProps = {
  projects: Project[];
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
};

export function ProjectChecklist({
  projects,
  value,
  onChange,
  disabled = false,
}: ProjectChecklistProps) {
  const baseId = useId();
  const selected = new Set(value);

  const toggle = (id: number, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    onChange(projects.filter((p) => next.has(p.id)).map((p) => p.id));
  };

  return (
    <FieldSet className="min-w-0">
      <FieldLegend variant="label">Project access</FieldLegend>
      {projects.length === 0 ? (
        <FieldDescription>
          No projects exist yet. Create one under Admin → Projects.
        </FieldDescription>
      ) : (
        <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
          {projects.map((project) => {
            const id = `${baseId}-${project.id}`;
            const Icon = projectIcon(project.icon);
            return (
              <li key={project.id} className="flex items-center gap-3">
                <Checkbox
                  id={id}
                  checked={selected.has(project.id)}
                  onCheckedChange={(checked) => toggle(project.id, checked)}
                  disabled={disabled}
                />
                <label
                  htmlFor={id}
                  className="flex min-w-0 flex-1 items-center gap-2 text-sm"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-lime-500"
                  />
                  <span className="min-w-0 truncate">{project.name}</span>
                  <span className="text-muted-foreground min-w-0 truncate font-mono text-xs">
                    {project.slug}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </FieldSet>
  );
}
