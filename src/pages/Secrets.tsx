import { toast } from "sonner";

import { useDataQuery, useDataMutation } from "@/api/handler";
import { type GetKeyResponse, type SimpleResponse } from "@/lib/objects";

import { Display } from "@/components/pages/secrets/Display";

import { Loading } from "@/components/Loading";
import { Error } from "@/components/Error";

export default function Secrets() {
  const { data, isLoading, isError } = useDataQuery<null, GetKeyResponse>(
    "auth",
    ["secrets"],
    "/key",
    false,
  );

  const {
    mutateAsync,
    isPending,
    isError: rotateError,
  } = useDataMutation<null, SimpleResponse>("auth", "/rotate-key", false, {
    invalidateKey: [["secrets"]],
    onSuccess: (data) => {
      toast.success(data.message, { toasterId: "root" });
    },
  });

  if (isLoading || isPending) {
    return <Loading content="key" />;
  }

  if (isError || rotateError || !data) {
    return <Error content="key" />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <Display data={data} isRotating={isPending} rotateAsync={mutateAsync} />
    </div>
  );
}
