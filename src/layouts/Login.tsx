import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Toaster } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

export function LoginLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-screen bg-neutral-950">
      <Toaster id="login" richColors position="top-right" />
      <Outlet />
    </div>
  );
}
