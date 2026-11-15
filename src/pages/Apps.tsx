import { useDataQuery } from "@/api/handler";
import { type Project, type ProjectsResponse } from "@/lib/objects";

import { List } from "@/components/pages/apps/List";
import { Loading } from "@/components/Loading";
import { Error } from "@/components/Error";

const EMPTY_PROJECTS: Project[] = [];

export default function Apps() {
  const { data, isLoading, isError, refetch } = useDataQuery<
    null,
    ProjectsResponse
  >("auth", ["projects"], "/projects", false);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Apps</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Apps you have access to
          </p>
        </div>
      </div>
      {isLoading ? (
        <Loading content="apps" />
      ) : isError ? (
        <Error content="apps" onRetry={() => void refetch()} />
      ) : (
        <List projects={data?.projects ?? EMPTY_PROJECTS} />
      )}
    </div>
  );
}
