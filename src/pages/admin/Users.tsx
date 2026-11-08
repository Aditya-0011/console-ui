import { useState } from "react";
import { toast } from "sonner";

import { useDataMutation, useDataQuery } from "@/api/handler";
import { useAuth } from "@/contexts/AuthContext";
import {
  Role,
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
import { AddUserDialog } from "@/components/pages/admin/AddUserDialog";
import { EditProjectsDialog } from "@/components/pages/admin/EditProjectsDialog";
import {
  TemporaryPasswordDialog,
  type TemporaryPassword,
} from "@/components/pages/admin/TemporaryPasswordDialog";

const USERS_KEY = ["admin", "users"];
const PROJECTS_KEY = ["admin", "projects"];
const EMPTY_USERS: User[] = [];
const EMPTY_PROJECTS: Project[] = [];
const ADMIN_LOCKED = "Administrator accounts can't be changed here";

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
  const projectNames = new Map(projectList.map((p) => [p.id, p.name]));
  const isBusy =
    resetPassword.isPending || setStatus.isPending || deleteUser.isPending;

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

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-950/20">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="pl-4">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users yet.
                </TableCell>
              </TableRow>
            ) : (
              userList.map((user) => {
                const isAdminRow = user.role === Role.Admin;
                const isSelf = user.id === identity?.user_id;
                const isDisabled = user.status === UserStatus.Disabled;
                return (
                  <TableRow key={user.id} className="border-white/5">
                    <TableCell className="pl-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span translate="no">{user.email}</span>
                        {isSelf && <Badge variant="outline">You</Badge>}
                        {user.must_change_password && (
                          <Badge className="bg-amber-500/15 text-amber-400">
                            Pending first login
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isAdminRow ? "default" : "secondary"}>
                        {isAdminRow ? "Admin" : "Tenant"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isDisabled ? "destructive" : "secondary"}>
                        {isDisabled ? "Disabled" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-56 text-xs">
                      {isAdminRow ? (
                        <span className="text-muted-foreground">All</span>
                      ) : user.project_ids.length === 0 ? (
                        <span className="text-muted-foreground">None</span>
                      ) : (
                        user.project_ids
                          .map((id) => projectNames.get(id) ?? `#${id}`)
                          .join(", ")
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatTimestamp(user.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {user.last_login_at
                        ? formatTimestamp(user.last_login_at)
                        : "Never"}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex flex-wrap justify-end gap-1">
                        <EditProjectsDialog
                          user={user}
                          projects={projectList}
                          disabled={isAdminRow || isBusy}
                          disabledReason={ADMIN_LOCKED}
                        />
                        <ConfirmButton
                          label="Reset password"
                          ariaLabel={`Reset password for ${user.email}`}
                          title="Reset password?"
                          description={`${user.email} is signed out everywhere and gets a new temporary password that you share with them.`}
                          confirmLabel="Reset password"
                          disabled={isSelf || isBusy}
                          disabledReason="Use the Security page for your own password"
                          onConfirm={() =>
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
                        />
                        <ConfirmButton
                          label={isDisabled ? "Enable" : "Disable"}
                          ariaLabel={`${isDisabled ? "Enable" : "Disable"} ${user.email}`}
                          title={
                            isDisabled ? "Enable account?" : "Disable account?"
                          }
                          description={
                            isDisabled
                              ? `${user.email} will be able to log in again.`
                              : `${user.email} is signed out everywhere and can't log in until re-enabled.`
                          }
                          confirmLabel={isDisabled ? "Enable" : "Disable"}
                          destructive={!isDisabled}
                          disabled={isAdminRow || isBusy}
                          disabledReason={ADMIN_LOCKED}
                          onConfirm={() =>
                            setStatus.mutate({
                              target_user_id: user.id,
                              status: isDisabled
                                ? UserStatus.Active
                                : UserStatus.Disabled,
                            })
                          }
                        />
                        <ConfirmButton
                          label="Delete"
                          ariaLabel={`Delete ${user.email}`}
                          title="Delete user?"
                          description={`${user.email} loses access immediately. Their Manager and Wallet data is not deleted.`}
                          confirmLabel="Delete user"
                          destructive
                          disabled={isAdminRow || isBusy}
                          disabledReason={ADMIN_LOCKED}
                          onConfirm={() =>
                            deleteUser.mutate({ target_user_id: user.id })
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

      <TemporaryPasswordDialog value={secret} onClose={() => setSecret(null)} />
    </div>
  );
}
