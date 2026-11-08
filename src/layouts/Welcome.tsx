import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/contexts/AuthContext";
import { SessionLoading } from "@/components/SessionLoading";

/** Only reachable while the account still has a temporary password. */
export function WelcomeLayout() {
  const { isAuthenticated, isVerifying, identity, mustChangePassword } =
    useAuth();

  if (!isAuthenticated) {
    return isVerifying ? <SessionLoading /> : <Navigate to="/login" replace />;
  }
  if (!identity) {
    return isVerifying ? <SessionLoading /> : <Navigate to="/" replace />;
  }
  if (!mustChangePassword) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-neutral-950">
      <Outlet />
    </main>
  );
}
