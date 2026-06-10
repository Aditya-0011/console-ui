import { Copy } from "lucide-react";
import { toast } from "sonner";

import { UpdatedOn } from "@/components/pages/UpdatedOn";
import { Button } from "@/components/ui/button";

import { type GetKeyResponse, type SimpleResponse } from "@/lib/objects";
import { Rotate } from "@/components/pages/Rotate";

type DisplayProps = {
  data: GetKeyResponse;
  isRotating: boolean;
  rotateAsync: (request: null) => Promise<SimpleResponse>;
};

export function Display({ data, isRotating, rotateAsync }: DisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(data.key);
    toast.success("Key copied to clipboard", { toasterId: "root" });
  };

  const maskedKey = data.key.substring(0, 8) + "•".repeat(32);

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Secrets</h1>
          {data?.updated_at && <UpdatedOn value={data.updated_at} />}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-32">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-medium">API Key</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Keep this key safe and do not share it publicly. To authenticate
            your read-only (
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs text-neutral-300">
              GET
            </code>
            ) requests, include this key in the{" "}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs text-neutral-300">
              X-API-KEY
            </code>{" "}
            header when accessing data via the manager API for your portfolio.
          </p>
        </div>

        <div className="flex w-full max-w-lg items-center justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-900/50 p-2 pl-4 font-mono text-sm text-lime-400 sm:gap-4 sm:pl-6">
          <span className="overflow-hidden tracking-widest whitespace-nowrap">
            {maskedKey}
          </span>
          <div className="flex shrink-0 items-center gap-1 border-l border-neutral-800 pl-2 sm:pl-4">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/50 hover:bg-white/10 hover:text-white hover:ring hover:ring-white"
              onClick={handleCopy}
              title="Copy Key"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Rotate
              description="This action cannot be undone. This will rotate the"
              name="API Key"
              title="Rotate API Key"
              isRotating={isRotating}
              rotateAsync={rotateAsync}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
