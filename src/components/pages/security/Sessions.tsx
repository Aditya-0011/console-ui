import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDataMutation, useDataQuery } from "@/api/handler";
import { useAuth } from "@/contexts/AuthContext";
import {
  type DeviceSession,
  type SessionsResponse,
  type SimpleResponse,
} from "@/lib/objects";
import { formatTimestamp } from "@/lib/time";
import { describeUserAgent } from "@/lib/user-agent";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const SESSIONS_KEY = ["sessions"];
const EMPTY_SESSIONS: DeviceSession[] = [];

export function Sessions() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const { data, isLoading, isError, refetch } = useDataQuery<
    null,
    SessionsResponse
  >("auth", SESSIONS_KEY, "/sessions", false, { staleTime: 30 * 1000 });

  const revoke = useDataMutation<{ session_id: string }, SimpleResponse>(
    "auth",
    "/sessions/revoke",
    false,
    { invalidateKey: [SESSIONS_KEY] },
  );

  const revokeOthers = useDataMutation<null, SimpleResponse>(
    "auth",
    "/sessions/revoke-others",
    false,
    {
      invalidateKey: [SESSIONS_KEY],
      onSuccess: (response) =>
        toast.success(response.message || "Signed out other devices"),
    },
  );

  const sessions = data?.sessions ?? EMPTY_SESSIONS;
  const others = sessions.filter((session) => !session.current).length;

  const revokeSession = (session: DeviceSession) => {
    revoke.mutate(
      { session_id: session.id },
      {
        onSuccess: (response) => {
          if (session.current) {
            // Revoking this browser's session is a logout.
            queryClient.clear();
            logout();
            return;
          }
          toast.success(response.message || "Session revoked");
        },
      },
    );
  };

  return (
    <Card className="bg-muted/5 ring ring-white/10">
      <CardHeader>
        <CardTitle>
          <h2>Signed-in devices</h2>
        </CardTitle>
        <CardDescription>
          Revoke a device you don&apos;t recognise. Revoking this device signs
          you out.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-between gap-2 text-sm text-red-400">
            Could not load your sessions.
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-stack">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Device</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Signed in</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="border-white/5">
                    <TableCell data-label="Device">
                      <div className="flex flex-wrap items-center justify-end gap-2 xl:justify-start">
                        <span title={session.user_agent}>
                          {describeUserAgent(session.user_agent)}
                        </span>
                        {session.current && (
                          <Badge variant="secondary">This device</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className="font-mono text-xs wrap-anywhere whitespace-normal"
                      data-label="IP"
                      translate="no"
                    >
                      {session.ip || "—"}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground text-xs"
                      data-label="Signed in"
                    >
                      {formatTimestamp(session.created_at)}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground text-xs"
                      data-label="Last active"
                    >
                      {formatTimestamp(session.last_seen_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <RevokeButton
                        session={session}
                        disabled={revoke.isPending}
                        onConfirm={() => revokeSession(session)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={others === 0 || revokeOthers.isPending}
            onClick={() => revokeOthers.mutate(null)}
            className="rounded-md text-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            {revokeOthers.isPending
              ? "Signing out..."
              : "Sign out other devices"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RevokeButton({
  session,
  disabled,
  onConfirm,
}: {
  session: DeviceSession;
  disabled: boolean;
  onConfirm: () => void;
}) {
  const label = `Revoke ${describeUserAgent(session.user_agent)}${
    session.current ? " (this device)" : ""
  }`;

  if (!session.current) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        aria-label={label}
        onClick={onConfirm}
        className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
      >
        Revoke
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={label}
            className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
          />
        }
      >
        Revoke
      </AlertDialogTrigger>
      <AlertDialogContent className="border border-red-500">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out this device?</AlertDialogTitle>
          <AlertDialogDescription>
            This is the session you are using right now. You will be signed out
            immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-neutral-950! text-red-500 hover:bg-red-500/10! hover:text-red-600 hover:ring hover:ring-red-500"
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
