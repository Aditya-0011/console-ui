import { Loading } from "@/components/Loading";

export function SessionLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-center">
      <Loading content="session" />
    </div>
  );
}
