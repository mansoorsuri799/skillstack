import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Bot,
  ClipboardCheck,
  Globe,
  LayoutDashboard,
  Link2,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  exact?: boolean;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export const connectNavGroup: DashboardNavGroup = {
  label: "Connect",
  items: [{ href: "/dashboard/connect", label: "AI & MCP", icon: Bot }],
};

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "Research",
    items: [
      { href: "/dashboard/keywords", label: "Keyword Research", icon: Search },
      { href: "/dashboard/domain", label: "Domain Overview", icon: Globe },
      { href: "/dashboard/backlinks", label: "Backlinks", icon: Link2 },
      { href: "/dashboard/brand-lookup", label: "Brand Lookup", icon: Sparkles },
      {
        href: "/dashboard/prompt-explorer",
        label: "Prompt Explorer",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Organic search",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        href: "/dashboard/organic/keywords",
        label: "Organic keywords",
      },
      {
        href: "/dashboard/organic/positions",
        label: "Organic positions",
      },
      {
        href: "/dashboard/organic/pages",
        label: "Top pages",
      },
      {
        href: "/dashboard/organic/competitors",
        label: "Organic competitors",
      },
    ],
  },
  {
    label: "My Site",
    items: [
      { href: "/dashboard/gsc", label: "GSC Insights", icon: BarChart3 },
      {
        href: "/dashboard/rank-tracking",
        label: "Rank Tracking",
        icon: TrendingUp,
      },
      { href: "/dashboard/saved", label: "Saved Keywords", icon: Bookmark },
      { href: "/dashboard/audit", label: "Site Audit", icon: ClipboardCheck },
    ],
  },
  connectNavGroup,
];

export const allDashboardNavItems = dashboardNavGroups.flatMap((g) => g.items);
