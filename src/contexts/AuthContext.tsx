import { useSyncExternalStore } from "react";

import { authStore, canUseApiKey, isAdmin } from "@/lib/auth";

export function useAuth() {
  const { isAuthenticated, isVerifying, identity, sessionId } =
    useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
  return {
    isAuthenticated,
    isVerifying,
    identity,
    sessionId,
    isAdmin: isAdmin(identity),
    canUseApiKey: canUseApiKey(identity),
    mustChangePassword: identity?.must_change_password ?? false,
    login: authStore.login,
    logout: authStore.logout,
    completeFirstLogin: authStore.completeFirstLogin,
  };
}
