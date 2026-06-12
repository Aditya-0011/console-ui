import { DateTime } from "luxon";

type UpdatedOnProps = {
  value: { seconds: number; nanos: number } | string;
};

export function UpdatedOn({ value }: UpdatedOnProps) {
  const displayValue =
    typeof value === "string"
      ? value
      : DateTime.fromSeconds(value.seconds, {
          zone: "Asia/Kolkata",
        }).toLocaleString(DateTime.DATETIME_MED);

  return (
    <span className="text-xs text-white/50">
      Last Updated On:{" "}
      <span className="text-muted-foreground hidden font-medium sm:inline">
        {displayValue}
      </span>
      <span className="text-muted-foreground inline font-medium sm:hidden">
        {displayValue}
      </span>
    </span>
  );
}
