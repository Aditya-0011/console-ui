import {
  Box,
  Briefcase,
  ChartLine,
  Code,
  Globe,
  LayoutDashboard,
  Shield,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Fixed allowlist: the server stores only the key, never an arbitrary icon. */
export const PROJECT_ICONS = {
  briefcase: { label: "Briefcase", icon: Briefcase },
  wallet: { label: "Wallet", icon: Wallet },
  "layout-dashboard": { label: "Dashboard", icon: LayoutDashboard },
  shield: { label: "Shield", icon: Shield },
  globe: { label: "Globe", icon: Globe },
  box: { label: "Box", icon: Box },
  code: { label: "Code", icon: Code },
  "chart-line": { label: "Chart", icon: ChartLine },
} satisfies Record<string, { label: string; icon: LucideIcon }>;

export type ProjectIconKey = keyof typeof PROJECT_ICONS;

export const PROJECT_ICON_KEYS = Object.keys(PROJECT_ICONS) as ProjectIconKey[];

export const DEFAULT_PROJECT_ICON: ProjectIconKey = "box";

export function isProjectIconKey(key: string): key is ProjectIconKey {
  return Object.hasOwn(PROJECT_ICONS, key);
}

export function projectIcon(key: string): LucideIcon {
  return PROJECT_ICONS[isProjectIconKey(key) ? key : DEFAULT_PROJECT_ICON].icon;
}
