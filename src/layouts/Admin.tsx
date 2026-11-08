import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/contexts/AuthContext";

/** Hides admin-only routes from tenants; the server enforces it anyway (403). */
export function AdminRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

/** API keys are for users with Manager access (and the admin). */
export function ApiKeyRoute() {
  const { canUseApiKey } = useAuth();
  return canUseApiKey ? <Outlet /> : <Navigate to="/" replace />;
}
