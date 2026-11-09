import { toast } from "sonner";

import { useDataMutation, useDataQuery } from "@/api/handler";
import {
  PROJECT_STATUS_LABELS,
  ProjectStatus,
  type Project,
  type ProjectsResponse,
  type SimpleResponse,
} from "@/lib/objects";
import { projectIcon } from "@/lib/project-icons";
import { formatTimestamp } from "@/lib/time";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { ProjectFormDialog } from "@/components/pages/admin/ProjectFormDialog";

const PROJECTS_KEY = ["admin", "projects"];
const EMPTY_PROJECTS: Project[] = [];

function StatusBadge({ status }: { status: Project["status"] }) {
  const label = PROJECT_STATUS_LABELS[status] ?? "Unknown";
  if (status === ProjectStatus.Active) {
    return <Badge variant="secondary">{label}</Badge>;
  }
  if (status === ProjectStatus.Maintenance) {
    return <Badge className="bg-amber-500/15 text-amber-400">{label}</Badge>;
  }
  return <Badge variant="outline">{label}</Badge>;
}

export default function Projects() {
  const { data, isLoading, isError, refetch } = useDataQuery<
    null,
    ProjectsResponse
  >("auth", PROJECTS_KEY, "/admin/projects", false);

  const deleteProject = useDataMutation<{ id: number }, SimpleResponse>(
    "auth",
    "/admin/projects/delete",
    false,
    {
      invalidateKey: [PROJECTS_KEY, ["projects"], ["admin", "users"]],
      onSuccess: (response) => toast.success(response.message),
    },
  );

  if (isLoading) return <Loading content="projects" />;
  if (isError) {
    return <Error content="projects" onRetry={() => void refetch()} />;
  }

  const projects = data?.projects ?? EMPTY_PROJECTS;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Apps listed in the Console and granted to users
          </p>
        </div>
        <ProjectFormDialog />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-950/20">
        <Table className="table-stack">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No projects yet.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => {
                const Icon = projectIcon(project.icon);
                return (
                  <TableRow key={project.id} className="border-white/5">
                    <TableCell className="pl-4" data-label="Name">
                      <div>
                        <div className="flex items-center justify-end gap-2 xl:justify-start">
                          <Icon
                            aria-hidden="true"
                            className="size-4 text-lime-500"
                          />
                          <span className="font-medium">{project.name}</span>
                        </div>
                        {project.description && (
                          <p className="text-muted-foreground mt-1 max-w-72 text-xs xl:truncate">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className="font-mono text-xs"
                      data-label="Slug"
                      translate="no"
                    >
                      {project.slug}
                    </TableCell>
                    <TableCell
                      className="max-w-56 truncate text-xs"
                      data-label="URL"
                    >
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lime-500 underline-offset-2 hover:underline"
                        translate="no"
                      >
                        {project.url}
                      </a>
                    </TableCell>
                    <TableCell data-label="Status">
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground text-xs"
                      data-label="Updated"
                    >
                      {formatTimestamp(project.updated_at)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-1">
                        <ProjectFormDialog project={project} />
                        <ConfirmButton
                          label="Delete"
                          ariaLabel={`Delete ${project.name}`}
                          title={`Delete ${project.name}?`}
                          description="It disappears from every user's Apps page and all grants to it are removed. The app itself and its data are not affected."
                          confirmLabel="Delete project"
                          destructive
                          disabled={deleteProject.isPending}
                          onConfirm={() =>
                            deleteProject.mutate({ id: project.id })
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
