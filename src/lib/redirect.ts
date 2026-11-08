import { toast } from "sonner";

import { apiFetch } from "@/api/handler";
import {
  ProjectStatus,
  Role,
  type Identity,
  type ProjectsResponse,
} from "@/lib/types";

/**
 * Only same-origin absolute paths ("/transactions?page=2") are accepted, so
 * ?next= can never point the browser at another host.
 */
function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  if (/[\\\s]/.test(next)) return null;
  return next;
}

/**
 * Resolve ?redirect=<app> (Manager/Wallet send their slug) against the
 * projects this user can see, matching slug or name case-insensitively, and
 * continue to ?next= on that project's own origin.
 * Returns true when the browser is leaving for the project.
 */
export async function followProjectRedirect(
  target: string,
  identity: Identity,
  next: string | null = null,
): Promise<boolean> {
  const wanted = target.trim().toLowerCase();
  if (!wanted) return false;

  let projects: ProjectsResponse["projects"];
  try {
    ({ projects } = await apiFetch<ProjectsResponse>("auth", "/projects"));
  } catch {
    toast.error("Could not load your apps to continue the redirect.");
    return false;
  }

  const project = projects.find(
    (p) => p.slug.toLowerCase() === wanted || p.name.toLowerCase() === wanted,
  );
  const usable =
    project &&
    (identity.role === Role.Admin ||
      (project.status === ProjectStatus.Active &&
        identity.projects.includes(project.slug)));

  if (!project || !usable) {
    toast.error(`You don't have access to ${target}.`);
    return false;
  }

  let url: URL;
  try {
    url = new URL(project.url);
    if (url.protocol !== "https:" && url.protocol !== "http:")
      throw new Error();
  } catch {
    toast.error(`${project.name} has an invalid URL.`);
    return false;
  }
  const path = safeNextPath(next);
  if (path) {
    const destination = new URL(path, url.origin);
    if (destination.origin === url.origin) url = destination;
  }
  url.searchParams.set("auth", "success");
  window.location.assign(url.toString());
  return true;
}
