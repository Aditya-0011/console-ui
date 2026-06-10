import { List } from "@/components/pages/apps/List";

export default function Apps() {
  return (
    <div className="mx-auto flex max-h-screen w-full flex-col gap-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Apps</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Apps currently deployed
          </p>
        </div>
      </div>
      <List />
    </div>
  );
}
