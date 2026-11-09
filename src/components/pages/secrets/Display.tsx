import { KeyRound } from "lucide-react";

import { UpdatedOn } from "@/components/pages/UpdatedOn";
import { Rotate } from "@/components/pages/Rotate";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Button } from "@/components/ui/button";

import { type GetKeyResponse } from "@/lib/objects";

type DisplayProps = {
  data: GetKeyResponse;
  isRotating: boolean;
  isRevoking: boolean;
  onRotate: () => void;
  onRevoke: () => void;
};

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs text-neutral-300">
      {children}
    </code>
  );
}

export function Display({
  data,
  isRotating,
  isRevoking,
  onRotate,
  onRevoke,
}: DisplayProps) {
  const hint = data.key_hint;

  return (
    <section className="flex w-full max-w-lg flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-medium">Portfolio key</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Send it in the <Code>X-API-KEY</Code> header to read your Manager
          content (<Code>/user/details</Code>, <Code>/technology/list</Code>,{" "}
          <Code>/project/list</Code>, <Code>/experience/list</Code>) and to post
          contact messages (<Code>/message/add</Code>). Nothing else accepts it.
          The full key is shown only once, right after it is created.
        </p>
      </div>

      {hint ? (
        <div className="flex w-full max-w-lg flex-col items-center gap-3">
          <div className="flex w-full items-center justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-900/50 p-2 pl-4 font-mono text-sm text-lime-400 sm:gap-4 sm:pl-6">
            <span
              className="min-w-0 overflow-hidden tracking-widest whitespace-nowrap"
              aria-label={`Key starting with ${hint}`}
              translate="no"
            >
              {hint}
              <span aria-hidden="true">{"•".repeat(24)}</span>
            </span>
            <div className="flex shrink-0 items-center gap-1 border-l border-neutral-800 pl-2 sm:pl-4">
              <Rotate
                description="The current key stops working immediately. This will rotate the"
                name="API Key"
                title="Rotate API Key"
                isRotating={isRotating}
                onRotate={onRotate}
              />
            </div>
          </div>
          <div className="flex w-full items-center justify-between">
            {data.updated_at ? <UpdatedOn value={data.updated_at} /> : <span />}
            <ConfirmButton
              label={isRevoking ? "Revoking..." : "Revoke key"}
              title="Revoke API key"
              description="Your portfolio stops loading Manager content immediately, until you create a new key."
              confirmLabel="Revoke"
              destructive
              disabled={isRevoking}
              onConfirm={onRevoke}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-muted-foreground text-sm">
            You don't have a key yet.
          </p>
          <Button
            type="button"
            disabled={isRotating}
            onClick={onRotate}
            className="rounded-md bg-lime-500 text-neutral-950 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
          >
            <KeyRound aria-hidden="true" />
            {isRotating ? "Creating..." : "Create key"}
          </Button>
        </div>
      )}
    </section>
  );
}
