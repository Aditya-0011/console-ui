import { Suspense, lazy } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { toast } from "sonner";

import { FetchError } from "@/lib/objects";

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
  queryCache: new QueryCache({
    onSuccess: (data: unknown, query) => {
      const meta = query.meta as Record<string, unknown> | undefined;
      if (meta?.onSuccess && typeof meta.onSuccess === "function") meta.onSuccess(data);
      if (meta?.invalidateKey && Array.isArray(meta.invalidateKey)) {
        for (const key of meta.invalidateKey) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    },
    onError: (error, query) => {
      if (error instanceof FetchError) {
        const meta = query.meta as Record<string, unknown> | undefined;
        const { message, status } = error;
        const currentPath = window.location.pathname.slice(1);

        if (status === 401 || status === 0) {
          if (!meta?.skipAuthErrorHandling) {
            queryClient.clear();
            if (meta?.logout && typeof meta.logout === "function") meta.logout();
            toast.error(message, { toasterId: "login" });
            window.location.href = `/login`;
            return;
          } else {
            if (currentPath !== "login") {
              toast.error(message, { toasterId: "root" });
            }
          }
        } else {
          if (currentPath !== "login") {
            toast.error(message, { toasterId: "root" });
          } else {
            toast.error(message, { toasterId: "login" });
          }
        }
      }
    },
  }),
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
