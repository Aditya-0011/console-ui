import { useState } from "react";
import { toast } from "sonner";

import { useDataMutation, useDataQuery } from "@/api/handler";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserStatus,
  type Project,
  type ProjectsResponse,
  type SimpleResponse,
  type TargetUserRequest,
  type TemporaryPasswordResponse,
  type User,
  type UserStatusRequest,
  type UsersResponse,
} from "@/lib/objects";

import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";
import { AddUserDialog } from "@/components/pages/admin/AddUserDialog";
import {
  TemporaryPasswordDialog,
  type TemporaryPassword,
} from "@/components/pages/admin/TemporaryPasswordDialog";
import { UsersTable } from "@/components/pages/admin/UsersTable";

const USERS_KEY = ["admin", "users"];
const PROJECTS_KEY = ["admin", "projects"];
const EMPTY_USERS: User[] = [];
const EMPTY_PROJECTS: Project[] = [];

export default function Users() {
  const { identity } = useAuth();
  const [secret, setSecret] = useState<TemporaryPassword | null>(null);

  const users = useDataQuery<null, UsersResponse>(
    "auth",
    USERS_KEY,
    "/admin/users",
    false,
    { staleTime: 30 * 1000 },
  );
  const projects = useDataQuery<null, ProjectsResponse>(
    "auth",
    PROJECTS_KEY,
    "/admin/projects",
    false,
  );

  const notify = (response: SimpleResponse) => toast.success(response.message);

  const resetPassword = useDataMutation<
    TargetUserRequest,
    TemporaryPasswordResponse
  >("auth", "/admin/users/reset-password", false, {
    invalidateKey: [USERS_KEY],
  });
  const setStatus = useDataMutation<UserStatusRequest, SimpleResponse>(
    "auth",
    "/admin/users/status",
    false,
    { invalidateKey: [USERS_KEY], onSuccess: notify },
  );
  const deleteUser = useDataMutation<TargetUserRequest, SimpleResponse>(
    "auth",
    "/admin/users/delete",
    false,
    { invalidateKey: [USERS_KEY], onSuccess: notify },
  );

  if (users.isLoading || projects.isLoading) {
    return <Loading content="users" />;
  }
  if (users.isError || projects.isError) {
    return (
      <Error
        content="users"
        onRetry={() => {
          void users.refetch();
          void projects.refetch();
        }}
      />
    );
  }

  const userList = users.data?.users ?? EMPTY_USERS;
  const projectList = projects.data?.projects ?? EMPTY_PROJECTS;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Users</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Accounts and the apps they can open
          </p>
        </div>
        <AddUserDialog projects={projectList} onCreated={setSecret} />
      </div>

      <UsersTable
        users={userList}
        currentUserId={identity?.user_id}
        projects={projectList}
        projectNames={new Map(projectList.map((p) => [p.id, p.name]))}
        isBusy={
          resetPassword.isPending || setStatus.isPending || deleteUser.isPending
        }
        onResetPassword={(user) =>
          resetPassword.mutate(
            { target_user_id: user.id },
            {
              onSuccess: (response) =>
                setSecret({
                  email: user.email,
                  password: response.temporary_password,
                }),
            },
          )
        }
        onToggleStatus={(user) =>
          setStatus.mutate({
            target_user_id: user.id,
            status:
              user.status === UserStatus.Disabled
                ? UserStatus.Active
                : UserStatus.Disabled,
          })
        }
        onDelete={(user) => deleteUser.mutate({ target_user_id: user.id })}
      />

      <TemporaryPasswordDialog value={secret} onClose={() => setSecret(null)} />
    </div>
  );
}
