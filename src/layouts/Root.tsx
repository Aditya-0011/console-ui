import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import { Toaster } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

import { Navigation } from "@/components/Navigation";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

export function RootLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <SidebarProvider className="bg-neutral-950" defaultOpen={false}>
      <Navigation />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center bg-neutral-950/50 px-4 backdrop-blur-sm">
          <SidebarTrigger className="h-10 w-10 text-white hover:bg-neutral-800" />
        </header>

        <div className="flex flex-1 flex-col p-4">
          <Toaster id="root" richColors expand />
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
