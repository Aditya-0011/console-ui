import { ExternalLink } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  PROJECT_STATUS_LABELS,
  ProjectStatus,
  type Project,
} from "@/lib/objects";
import { projectIcon } from "@/lib/project-icons";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusPill } from "@/components/StatusPill";

function StatusBadge({
  status,
  isAdmin,
}: {
  status: Project["status"];
  isAdmin: boolean;
}) {
  if (status === ProjectStatus.Maintenance) {
    return (
      <StatusPill tone="warning">{PROJECT_STATUS_LABELS[status]}</StatusPill>
    );
  }
  if (status === ProjectStatus.Hidden && isAdmin) {
    return (
      <StatusPill tone="neutral">{PROJECT_STATUS_LABELS[status]}</StatusPill>
    );
  }
  return null;
}

export function List({ projects }: { projects: Project[] }) {
  const { isAdmin } = useAuth();

  if (projects.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        No apps have been shared with you yet.
      </p>
    );
  }

  return (
    <ul className="columns-1 gap-4 pb-4 sm:columns-2 lg:columns-4">
      {projects.map((project) => {
        const Icon = projectIcon(project.icon);
        const unavailable =
          project.status === ProjectStatus.Maintenance && !isAdmin;
        const header = (
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-lg leading-tight font-semibold tracking-tight">
              <Icon aria-hidden="true" className="size-5 text-lime-500" />
              <span className="min-w-0 truncate">{project.name}</span>
              <StatusBadge status={project.status} isAdmin={isAdmin} />
              {!unavailable && (
                <ExternalLink
                  aria-hidden="true"
                  className="text-muted-foreground ml-auto size-3.5 shrink-0"
                />
              )}
            </CardTitle>
            {project.description && (
              <CardDescription className="text-muted-foreground text-sm leading-tight">
                {project.description}
              </CardDescription>
            )}
            {unavailable ? (
              <span className="text-muted-foreground text-xs">
                Temporarily unavailable while under maintenance.
              </span>
            ) : (
              <span className="sr-only">(opens in a new tab)</span>
            )}
          </CardHeader>
        );
        return (
          <li key={project.id} className="mb-4 break-inside-avoid">
            {unavailable ? (
              <Card
                aria-disabled="true"
                className="bg-muted/5 opacity-60 ring ring-white/10 contain-content"
              >
                {header}
              </Card>
            ) : (
              <Card className="group bg-muted/5 hover:bg-muted/50 ring ring-white/10 transition-[scale,background-color,box-shadow] contain-content hover:scale-[1.01] hover:ring-white motion-reduce:hover:scale-100">
                <a
                  href={project.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-lime-500"
                >
                  {header}
                </a>
              </Card>
            )}
          </li>
        );
      })}
    </ul>
  );
}
