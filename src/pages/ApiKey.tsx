import { useState } from "react";
import { toast } from "sonner";

import { useDataMutation, useDataQuery } from "@/api/handler";
import {
  type GetKeyResponse,
  type KeyOriginsResponse,
  type RotateKeyResponse,
  type SimpleResponse,
} from "@/lib/objects";

import { Display } from "@/components/pages/secrets/Display";
import { NewKeyDialog } from "@/components/pages/secrets/NewKeyDialog";
import { Origins } from "@/components/pages/secrets/Origins";

import { Loading } from "@/components/Loading";
import { Error } from "@/components/Error";
import { Separator } from "@/components/ui/separator";

export default function ApiKey() {
  const { data, isLoading, isError, refetch } = useDataQuery<
    null,
    GetKeyResponse
  >("auth", ["secrets"], "/key", false);

  const [newKey, setNewKey] = useState<string | null>(null);

  const { mutate: rotate, isPending: isRotating } = useDataMutation<
    null,
    RotateKeyResponse
  >("auth", "/rotate-key", false, {
    invalidateKey: [["secrets"]],
    onSuccess: (response) => setNewKey(response.key),
  });

  const { mutate: revoke, isPending: isRevoking } = useDataMutation<
    null,
    SimpleResponse
  >("auth", "/key/revoke", false, {
    invalidateKey: [["secrets"]],
    onSuccess: (response) =>
      toast.success(response.message || "API key revoked"),
  });

  const { mutate: saveOrigins, isPending: isSaving } = useDataMutation<
    { origins: string[] },
    KeyOriginsResponse
  >("auth", "/key/origins", false, {
    invalidateKey: [["secrets"]],
    onSuccess: () => toast.success("Allowed domains saved"),
  });

  if (isLoading) {
    return <Loading content="key" />;
  }

  if (isError || !data) {
    return <Error content="key" onRetry={() => void refetch()} />;
  }

  const origins = data.origins ?? [];

  return (
    <div className="flex w-full flex-col gap-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">API Key</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Portfolio key and allowed domains
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-10">
        <Display
          data={data}
          isRotating={isRotating}
          isRevoking={isRevoking}
          onRotate={() => rotate(null)}
          onRevoke={() => revoke(null)}
        />
        <Separator className="max-w-lg bg-neutral-800" />
        <Origins
          key={origins.join(",")}
          saved={origins}
          isSaving={isSaving}
          onSave={(next) => saveOrigins({ origins: next })}
        />
      </div>
      <NewKeyDialog apiKey={newKey} onClose={() => setNewKey(null)} />
    </div>
  );
}
