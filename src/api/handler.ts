import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";

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
    select?: (data: unknown) => Response;
    skipAuthErrorHandling?: boolean;
  },
) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const currentPath = location.pathname.slice(1);

  const queryResult = useQuery<Response, Error>({
    queryKey: [...key, url, app, textOnlyResponse],
    queryFn: () =>
      fetcher<Request, Response>(app, url, undefined, "GET", textOnlyResponse),
    enabled: true,
    staleTime: options?.staleTime ?? 30 * 60 * 1000,
    refetchInterval: options?.refetchInterval,
    select: options?.select as ((data: unknown) => Response) | undefined,
    retry: (failureCount, error) => {
      if (
        error instanceof FetchError &&
        (error.status === 401 || error.status === 0)
      ) {
        return false;
      }
      return failureCount <= 3;
    },
  });

  useEffect(() => {
    if (queryResult.isSuccess) {
      if (options?.onSuccess) options.onSuccess(queryResult.data as Response);
      if (options?.invalidateKey) {
        for (const key of options.invalidateKey) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    }
  }, [queryResult.isSuccess, queryResult.data, options, queryClient]);

  useEffect(() => {
    if (queryResult.isError && queryResult.error instanceof FetchError) {
      const { message, status } = queryResult.error as FetchError;
      if (status === 401 || status === 0) {
        if (!options?.skipAuthErrorHandling) {
          queryClient.clear();
          logout();
          navigate("/login", { replace: true });
          toast.error(message, { toasterId: "login" });
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
  }, [
    queryResult.isError,
    queryResult.error,
    queryClient,
    navigate,
    currentPath,
    logout,
    options?.skipAuthErrorHandling,
  ]);

  return queryResult;
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
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const currentPath = location.pathname.slice(1);

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
        if (error.status === 401 || error.status === 0) {
          queryClient.clear();
          logout();
          navigate("/login", { replace: true });
          toast.error(error.message, { toasterId: "login" });
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
