import { Suspense, lazy } from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { queryClient } from "@/api/query-client";

import { AdminRoute, ApiKeyRoute } from "@/layouts/Admin";
import { LoginLayout } from "@/layouts/Login";
import { RootLayout } from "@/layouts/Root";
import { WelcomeLayout } from "@/layouts/Welcome";
import { Loading } from "@/components/Loading";

const Login = lazy(() => import("@/pages/Login.tsx"));
const Reset = lazy(() => import("@/pages/Reset.tsx"));
const Welcome = lazy(() => import("@/pages/Welcome.tsx"));
const Apps = lazy(() => import("@/pages/Apps.tsx"));
const Security = lazy(() => import("@/pages/Security.tsx"));
const ApiKey = lazy(() => import("@/pages/ApiKey.tsx"));
const AdminUsers = lazy(() => import("@/pages/admin/Users.tsx"));
const AdminProjects = lazy(() => import("@/pages/admin/Projects.tsx"));
import NotFound from "@/pages/NotFound.tsx";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex h-screen w-full items-center justify-center text-center">
              <Loading />
            </div>
          }
        >
          <Routes>
            <Route element={<LoginLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/reset" element={<Reset />} />
            </Route>
            <Route element={<WelcomeLayout />}>
              <Route path="/welcome" element={<Welcome />} />
            </Route>
            <Route element={<RootLayout />}>
              <Route index element={<Apps />} />
              <Route path="/apps" element={<Navigate to="/" replace />} />
              <Route path="/security" element={<Security />} />
              <Route element={<ApiKeyRoute />}>
                <Route path="/api-key" element={<ApiKey />} />
                <Route
                  path="/secrets"
                  element={<Navigate to="/api-key" replace />}
                />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/projects" element={<AdminProjects />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
