import { formatTimestamp, type GrpcTimestamp } from "@/lib/time";

type UpdatedOnProps = {
  value: GrpcTimestamp;
};

export function UpdatedOn({ value }: UpdatedOnProps) {
  return (
    <span className="text-xs text-white/50">
      Last Updated On:{" "}
      <span className="text-muted-foreground font-medium">
        {formatTimestamp(value)}
      </span>
    </span>
  );
}
