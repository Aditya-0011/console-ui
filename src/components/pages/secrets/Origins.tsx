import { useState } from "react";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_ORIGINS = 10;
const ORIGIN_PATTERN =
  /^(https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+|http:\/\/(localhost|127\.0\.0\.1))(:[0-9]{1,5})?$/;

/** Accepts "xyz.com", "https://xyz.com/" or a full URL and returns its origin. */
function toOrigin(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(
      /^[a-z]+:\/\//i.test(value) ? value : `https://${value}`,
    );
    const origin = url.origin.toLowerCase();
    return ORIGIN_PATTERN.test(origin) ? origin : null;
  } catch {
    return null;
  }
}

type OriginsProps = {
  saved: string[];
  isSaving: boolean;
  onSave: (origins: string[]) => void;
};

export function Origins({ saved, isSaving, onSave }: OriginsProps) {
  const [origins, setOrigins] = useState(saved);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dirty =
    origins.length !== saved.length || origins.some((o, i) => o !== saved[i]);

  const add = () => {
    const origin = toOrigin(draft);
    if (!origin) {
      setError(
        "Enter a domain like xyz.com or https://xyz.com (http only for localhost).",
      );
      return;
    }
    if (origins.includes(origin)) {
      setError(`${origin} is already listed.`);
      return;
    }
    if (origins.length >= MAX_ORIGINS) {
      setError(`At most ${MAX_ORIGINS} domains.`);
      return;
    }
    setOrigins([...origins, origin]);
    setDraft("");
    setError(null);
  };

  return (
    <section
      className="flex w-full max-w-lg flex-col gap-4"
      aria-labelledby="origins-heading"
    >
      <div>
        <h2 id="origins-heading" className="text-xl font-medium">
          Allowed domains
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Browsers may call the API with your key only from these sites.
          Server-side calls don't need an entry. A key used in the browser is
          visible to visitors, so it can only read your public content and send
          messages.
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        noValidate
      >
        <label htmlFor="origin-input" className="sr-only">
          Portfolio domain
        </label>
        <Input
          id="origin-input"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          placeholder="https://xyz.com"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "origin-error" : undefined}
        />
        <Button type="submit" variant="outline" className="rounded-md">
          <Plus aria-hidden="true" />
          Add
        </Button>
      </form>
      {error && (
        <p id="origin-error" role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {origins.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No domains: the key works only from servers.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {origins.map((origin) => (
            <li
              key={origin}
              className="flex items-center justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-900/50 py-1 pr-1 pl-3 font-mono text-sm"
            >
              <span className="min-w-0 truncate" translate="no">
                {origin}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${origin}`}
                onClick={() => setOrigins(origins.filter((o) => o !== origin))}
                className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end gap-2">
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            className="rounded-md"
            onClick={() => {
              setOrigins(saved);
              setError(null);
            }}
          >
            Discard
          </Button>
        )}
        <Button
          type="button"
          disabled={!dirty || isSaving}
          onClick={() => onSave(origins)}
          className="rounded-md bg-lime-500 text-neutral-950 hover:bg-neutral-950 hover:text-lime-500 hover:ring hover:ring-lime-500"
        >
          {isSaving ? "Saving..." : "Save domains"}
        </Button>
      </div>
    </section>
  );
}
