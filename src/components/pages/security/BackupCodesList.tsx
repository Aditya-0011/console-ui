import { Copy, Download } from "lucide-react";

import { copyText, downloadTextFile } from "@/lib/utils";

import { Button } from "@/components/ui/button";

type BackupCodesListProps = {
  codes: string[];
};

/** The one place freshly generated backup codes are rendered. */
export function BackupCodesList({ codes }: BackupCodesListProps) {
  const allCodes = codes.join("\n");

  return (
    <div className="flex flex-col gap-3">
      <ol
        aria-label="Backup codes"
        className="grid grid-cols-1 gap-2 rounded-md bg-neutral-900 p-4 font-mono text-sm text-lime-400 sm:grid-cols-2"
      >
        {codes.map((code) => (
          <li key={code} translate="no">
            {code}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(allCodes, "Backup codes copied")}
        >
          <Copy data-icon="inline-start" aria-hidden="true" />
          Copy all
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            downloadTextFile("console-backup-codes.txt", `${allCodes}\n`)
          }
        >
          <Download data-icon="inline-start" aria-hidden="true" />
          Download .txt
        </Button>
      </div>
    </div>
  );
}
