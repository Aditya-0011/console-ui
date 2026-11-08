import { useState } from "react";
import { toast } from "sonner";

import { useDataMutation, useDataQuery } from "@/api/handler";
import {
  type PasswordConfirmRequest,
  type RecoveryCodesResponse,
  type RecoveryCodesStatus,
  type SimpleResponse,
} from "@/lib/objects";
import { formatTimestamp } from "@/lib/time";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PasswordConfirmDialog } from "@/components/PasswordConfirmDialog";
import { BackupCodesList } from "@/components/pages/security/BackupCodesList";

const STATUS_KEY = ["recovery-codes"];
const TOTAL_CODES = 10;

export function BackupCodes() {
  // Fresh codes live only in component state, dropped when the dialog closes.
  const [codes, setCodes] = useState<string[] | null>(null);

  const { data: status, isLoading } = useDataQuery<null, RecoveryCodesStatus>(
    "auth",
    STATUS_KEY,
    "/recovery-codes",
    false,
  );

  const generate = useDataMutation<
    PasswordConfirmRequest,
    RecoveryCodesResponse
  >("auth", "/recovery-codes", false, {
    invalidateKey: [STATUS_KEY],
    onSuccess: (data) => setCodes(data.codes),
  });

  const destroy = useDataMutation<PasswordConfirmRequest, SimpleResponse>(
    "auth",
    "/recovery-codes/delete",
    false,
    {
      invalidateKey: [STATUS_KEY],
      onSuccess: (data) =>
        toast.success(data.message || "Backup codes deleted"),
    },
  );

  const run =
    (mutation: typeof generate | typeof destroy) =>
    async (password: string) => {
      try {
        await mutation.mutateAsync({ password });
        return true;
      } catch {
        return false; // Reported by the global mutation error handler.
      }
    };

  const remaining = status?.remaining ?? 0;

  return (
    <Card className="bg-muted/5 ring ring-white/10">
      <CardHeader>
        <CardTitle>
          <h2>Backup codes</h2>
        </CardTitle>
        <CardDescription>
          Each code resets your password once if you forget it. Generating a new
          set immediately invalidates the old one.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div aria-live="polite" className="text-sm">
          {isLoading ? (
            <Skeleton className="h-5 w-56" />
          ) : remaining > 0 ? (
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant={remaining <= 3 ? "destructive" : "secondary"}>
                {remaining} of {TOTAL_CODES} remaining
              </Badge>
              {status?.generated_at && (
                <span className="text-muted-foreground text-xs">
                  Generated {formatTimestamp(status.generated_at)}
                </span>
              )}
            </p>
          ) : (
            <p className="text-red-400">
              You have no backup codes. Generate a set so you can reset your
              password without the administrator.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {remaining > 0 && (
            <PasswordConfirmDialog
              id="destroy-codes"
              triggerLabel="Destroy all codes"
              title="Destroy all backup codes?"
              description="Without backup codes the only way to recover a forgotten password is asking the administrator for a temporary one."
              confirmLabel="Destroy codes"
              pendingLabel="Destroying..."
              destructive
              isPending={destroy.isPending}
              onConfirm={run(destroy)}
            />
          )}
          <PasswordConfirmDialog
            id="generate-codes"
            triggerLabel={
              remaining > 0 ? "Generate new codes" : "Generate codes"
            }
            title="Generate new backup codes"
            description={
              remaining > 0
                ? "Your current codes stop working as soon as the new set is created."
                : "You will see 10 single-use codes once. Store them somewhere safe."
            }
            confirmLabel="Generate"
            pendingLabel="Generating..."
            isPending={generate.isPending}
            onConfirm={run(generate)}
          />
        </div>
      </CardContent>

      <AlertDialog
        open={codes !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCodes(null);
            generate.reset();
          }
        }}
      >
        <AlertDialogContent className="border border-lime-500 sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Save your backup codes</AlertDialogTitle>
            <AlertDialogDescription>
              These codes are shown only once and cannot be retrieved later.
              Your previous codes no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {codes && <BackupCodesList codes={codes} />}
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setCodes(null);
                generate.reset();
              }}
            >
              I saved them
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
