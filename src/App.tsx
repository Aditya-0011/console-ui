import { Suspense, lazy } from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AuthProvider } from "@/contexts/AuthContext";
import { LoginLayout } from "@/layouts/Login";
import { RootLayout } from "@/layouts/Root";
import { Loading } from "@/components/Loading";

const Login = lazy(() => import("@/pages/Login.tsx"));
const Apps = lazy(() => import("@/pages/Apps.tsx"));
const Secrets = lazy(() => import("@/pages/Secrets.tsx"));
import NotFound from "@/pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 0 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AuthProvider>
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
              </Route>
              <Route element={<RootLayout />}>
                <Route index element={<Navigate to="/apps" replace />} />
                <Route path="/apps" element={<Apps />} />
                <Route path="/secrets" element={<Secrets />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
