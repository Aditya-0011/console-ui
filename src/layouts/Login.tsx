import { useEffect } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router";
import { Toaster } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

export function LoginLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTarget = searchParams.get("redirect");
      if (!redirectTarget) {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, searchParams]);

  return (
    <div className="h-screen bg-neutral-950">
      <Toaster id="login" richColors position="top-right" />
      <Outlet />
    </div>
  );
}
