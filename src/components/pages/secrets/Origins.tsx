import { useState } from "react";
import { useForm } from "@tanstack/react-form";

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

function domainError(raw: string, origins: string[]): string | undefined {
  const origin = toOrigin(raw);
  if (!origin) {
    return "Enter a domain like xyz.com or https://xyz.com (http only for localhost).";
  }
  if (origins.includes(origin)) return `${origin} is already listed.`;
  if (origins.length >= MAX_ORIGINS) return `At most ${MAX_ORIGINS} domains.`;
  return undefined;
}

export function Origins({ saved, isSaving, onSave }: OriginsProps) {
  const [origins, setOrigins] = useState(saved);

  const dirty =
    origins.length !== saved.length || origins.some((o, i) => o !== saved[i]);

  const {
    Field: FormField,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: { domain: "" },
    onSubmit: ({ value }) => {
      const origin = toOrigin(value.domain);
      if (!origin) return;
      setOrigins([...origins, origin]);
      reset();
    },
  });

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
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        <FormField
          name="domain"
          validators={{
            onSubmit: ({ value }) => domainError(value, origins),
          }}
          children={(field) => {
            const error = field.state.meta.errors[0];
            return (
              <>
                <div className="flex gap-2">
                  <label htmlFor="origin-input" className="sr-only">
                    Portfolio domain
                  </label>
                  <Input
                    id="origin-input"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://xyz.com"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "origin-error" : undefined}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="rounded-md"
                  >
                    <Plus aria-hidden="true" />
                    Add
                  </Button>
                </div>
                {error && (
                  <p
                    id="origin-error"
                    role="alert"
                    className="text-sm text-red-400"
                  >
                    {error}
                  </p>
                )}
              </>
            );
          }}
        />
      </form>

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
              reset();
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
