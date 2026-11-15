import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

const TONES = {
  accent: "bg-lime-500/10 text-lime-600 ring-lime-500",
  neutral: "ring-white/20",
  success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500",
  danger: "bg-red-500/10 text-red-600 ring-red-500",
  warning: "bg-amber-500/10 text-amber-600 ring-amber-500",
} as const;

type StatusPillProps = {
  tone: keyof typeof TONES;
  children: React.ReactNode;
};

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 px-1.5 py-0.5 text-[10px] tracking-wider uppercase ring",
        TONES[tone],
      )}
    >
      {children}
    </Badge>
  );
}
