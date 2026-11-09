import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/contexts/AuthContext";

import { Navigation } from "@/components/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SessionLoading } from "@/components/SessionLoading";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

export function RootLayout() {
  const { isAuthenticated, isVerifying, identity, mustChangePassword } =
    useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) {
    return isVerifying ? <SessionLoading /> : <Navigate to="/login" replace />;
  }
  // Wait for the Identity so role-based navigation renders correctly.
  if (!identity && isVerifying) {
    return <SessionLoading />;
  }
  if (mustChangePassword) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <SidebarProvider className="bg-neutral-950" defaultOpen={false}>
      <Navigation />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center bg-neutral-950/50 px-4 backdrop-blur-sm">
          <SidebarTrigger
            aria-label="Toggle navigation"
            className="h-10 w-10 text-white hover:bg-neutral-800"
          />
        </header>

        <main className="flex flex-1 flex-col p-4">
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
