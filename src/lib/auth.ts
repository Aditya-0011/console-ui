import { API_URLS } from "@/lib/env";
import { Role, type Identity, type SessionIdentity } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/storage";

/**
 * Client-side mirror of the gateway session (an HttpOnly cookie). The
 * localStorage flag is only an optimistic hint; the Identity always comes
 * from POST /login or GET /session and is never persisted.
 */
const STORAGE_KEY = "isAuthenticated";

export type AuthSnapshot = {
  isAuthenticated: boolean;
  /** True until the boot-time GET /session check has settled. */
  isVerifying: boolean;
  identity: Identity | null;
  sessionId: string | null;
};

function readHint(): boolean {
  return readStorage("localStorage", STORAGE_KEY) === "true";
}

function writeHint(value: boolean) {
  writeStorage("localStorage", STORAGE_KEY, String(value));
}

let snapshot: AuthSnapshot = {
  isAuthenticated: readHint(),
  isVerifying: true,
  identity: null,
  sessionId: null,
};

const listeners = new Set<() => void>();

function update(next: Partial<AuthSnapshot>) {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
}

function signIn(identity: Identity, sessionId: string | null = null) {
  writeHint(true);
  update({
    isAuthenticated: true,
    identity,
    sessionId: sessionId ?? snapshot.sessionId,
  });
}

function signOut() {
  writeHint(false);
  update({ isAuthenticated: false, identity: null, sessionId: null });
}

export const authStore = {
  getSnapshot: (): AuthSnapshot => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  login: signIn,
  logout: signOut,
  /** The server answered 403 "Password change required". */
  requirePasswordChange() {
    if (snapshot.identity && !snapshot.identity.must_change_password) {
      update({
        identity: { ...snapshot.identity, must_change_password: true },
      });
    }
  },
  /** POST /first-login succeeded and the backup codes were acknowledged. */
  completeFirstLogin() {
    if (snapshot.identity) {
      update({
        identity: { ...snapshot.identity, must_change_password: false },
      });
    }
  },
};

export function isAdmin(identity: Identity | null): boolean {
  return identity?.role === Role.Admin;
}

/** Portfolio API keys belong to Manager, so Manager access unlocks them. */
export function canUseApiKey(identity: Identity | null): boolean {
  return isAdmin(identity) || (identity?.projects.includes("manager") ?? false);
}

window.addEventListener("storage", (event) => {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  const isAuthenticated = event.newValue === "true";
  if (isAuthenticated === snapshot.isAuthenticated) return;
  if (isAuthenticated) {
    // Another tab logged in: fetch our own Identity for this tab.
    verification = null;
    update({ isAuthenticated: true, isVerifying: true });
    void verifySession();
  } else {
    update({ isAuthenticated: false, identity: null, sessionId: null });
  }
});

let verification: Promise<void> | null = null;

/** Re-sync with the gateway: GET /session returns the Identity or 401. */
export function verifySession(): Promise<void> {
  verification ??= (async () => {
    try {
      const res = await fetch(`${API_URLS.auth}/session`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const body = (await res.json()) as SessionIdentity;
        const { session_id: sessionId, ...identity } = body;
        signIn(identity, sessionId);
      } else if (res.status === 401) {
        signOut();
      }
      // Other statuses: keep the optimistic hint; API calls will re-check.
    } catch {
      // Offline or malformed body: keep the optimistic hint.
    } finally {
      update({ isVerifying: false });
    }
  })();
  return verification;
}
