type UpdatedOnProps = {
  value: string;
};


export function UpdatedOn({ value }: UpdatedOnProps) {
  return (
    <span className="text-xs text-white/50">
      Last Updated On:{" "}
      <span className="text-muted-foreground hidden font-medium sm:inline">
        {value}
      </span>
      <span className="text-muted-foreground inline font-medium sm:hidden">
        {value}
      </span>
    </span>
  );
}
