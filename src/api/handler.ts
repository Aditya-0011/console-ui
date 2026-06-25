import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { toast } from "sonner";
import {
  FetchError,
  type RequestMethod,
  type ServiceApiMapping,
  type ServiceList,
} from "@/lib/objects";
import { useAuth } from "@/contexts/AuthContext";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;
const MANAGER_API_URL = import.meta.env.VITE_MANAGER_API_URL;

const appApiMapping: ServiceApiMapping = {
  auth: AUTH_API_URL,
  manager: MANAGER_API_URL,
};

async function fetcher<Request, Response>(
  app: ServiceList,
  url: string,
  variables: Request | undefined,
  method: RequestMethod,
  textOnlyResponse: boolean,
): Promise<Response> {
  try {
    const res = await fetch(`${appApiMapping[app]}${url}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: variables ? JSON.stringify(variables) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new FetchError(msg || res.statusText, res.status);
    }

    if (textOnlyResponse) {
      return (await res.text()) as unknown as Response;
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof FetchError) throw err;
    const message =
      err instanceof Error ? err.message : "Network request failed";
    throw new FetchError(message, 0);
  }
}

export function useDataQuery<Request, Response>(
  app: ServiceList,
  key: QueryKey,
  url: string,
  textOnlyResponse: boolean,
  options?: {
    invalidateKey?: QueryKey[];
    staleTime?: number;
    refetchInterval?: number;
    onSuccess?: (data: Response) => void;
    skipAuthErrorHandling?: boolean;
  },
) {
  const { logout } = useAuth();

  return useQuery<Response, Error>({
    queryKey: [...key, url, app, textOnlyResponse],
    queryFn: () =>
      fetcher<Request, Response>(app, url, undefined, "GET", textOnlyResponse),
    enabled: true,
    staleTime: options?.staleTime ?? 30 * 60 * 1000,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error) => {
      if (error instanceof FetchError) {
        if (
          error.status === 401 ||
          error.status === 404 ||
          error.status === 0
        ) {
          return false;
        }
      }
      return failureCount <= 3;
    },
    meta: {
      onSuccess: options?.onSuccess,
      invalidateKey: options?.invalidateKey,
      skipAuthErrorHandling: options?.skipAuthErrorHandling,
      logout,
    },
  });
}
export function useDataMutation<Request, Response>(
  app: ServiceList,
  url: string,
  textOnlyResponse: boolean,
  options?: {
    invalidateKey?: QueryKey[];
    onSuccess?: (data: Response) => void;
  },
) {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  return useMutation<Response, FetchError, Request>({
    mutationFn: (variables) =>
      fetcher<Request, Response>(app, url, variables, "POST", textOnlyResponse),
    onSuccess: (data) => {
      if (options?.onSuccess) options.onSuccess(data);
      if (options?.invalidateKey) {
        for (const key of options.invalidateKey) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        const currentPath = window.location.pathname.slice(1);
        
        if (error.status === 401 || error.status === 0) {
          queryClient.clear();
          logout();
          toast.error(error.message, { toasterId: "login" });
          window.location.href = `/login`;
          return;
        } else {
          if (currentPath !== "login") {
            toast.error(error.message, { toasterId: "root" });
          } else {
            toast.error(error.message, { toasterId: "login" });
          }
        }
      }
    },
  });
}
