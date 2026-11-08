import { ExternalLink } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  PROJECT_STATUS_LABELS,
  ProjectStatus,
  type Project,
} from "@/lib/objects";
import { projectIcon } from "@/lib/project-icons";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function StatusBadge({
  status,
  isAdmin,
}: {
  status: Project["status"];
  isAdmin: boolean;
}) {
  if (status === ProjectStatus.Maintenance) {
    return (
      <Badge className="bg-amber-500/15 text-amber-400">
        {PROJECT_STATUS_LABELS[status]}
      </Badge>
    );
  }
  if (status === ProjectStatus.Hidden && isAdmin) {
    return <Badge variant="secondary">{PROJECT_STATUS_LABELS[status]}</Badge>;
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
            <CardTitle className="flex items-center gap-2 text-lg leading-tight tracking-tight">
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
                className="bg-muted/5 opacity-60 ring ring-white/10 backdrop-blur contain-content"
              >
                {header}
              </Card>
            ) : (
              <Card className="group bg-muted/5 hover:bg-muted/50 ring ring-white/10 backdrop-blur transition-all contain-content hover:scale-[1.01] hover:text-lime-200 hover:ring-lime-600 motion-reduce:hover:scale-100">
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
