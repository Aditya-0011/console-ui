import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";

import { useAuth } from "@/contexts/AuthContext";

export function LoginLayout() {
  const { isAuthenticated, mustChangePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const { search } = useLocation();

  if (isAuthenticated && mustChangePassword) {
    return <Navigate to={`/welcome${search}`} replace />;
  }

  // With ?redirect= the user came from another app whose session failed, so
  // keep the form visible and let them log in again.
  if (isAuthenticated && !searchParams.get("redirect")) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="h-screen bg-neutral-950">
      <Outlet />
    </main>
  );
}
