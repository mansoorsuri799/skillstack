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
      {
        href: "/dashboard/keyword-research-tool",
        label: "Keyword Research",
        icon: Search,
      },
      {
        href: "/dashboard/domain-overview-tool",
        label: "Domain Overview",
        icon: Globe,
      },
      {
        href: "/dashboard/backlink-checker",
        label: "Backlinks",
        icon: Link2,
      },
      {
        href: "/dashboard/brand-lookup-tool",
        label: "Brand Lookup",
        icon: Sparkles,
      },
    ],
  },
  {
    label: "Organic search",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        href: "/dashboard/organic-keyword-checker",
        label: "Organic keywords",
      },
      {
        href: "/dashboard/organic-position-checker",
        label: "Organic positions",
      },
      {
        href: "/dashboard/top-pages-finder",
        label: "Top pages",
      },
      {
        href: "/dashboard/organic-competitor-finder",
        label: "Organic competitors",
      },
    ],
  },
  {
    label: "Competitive analysis",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        href: "/dashboard/content-gap-finder",
        label: "Content gap",
      },
    ],
  },
  {
    label: "Pages",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        href: "/dashboard/best-by-links-finder",
        label: "Best by links",
      },
    ],
  },
  {
    label: "Internal links",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        href: "/dashboard/internal-link-checker",
        label: "Internal links",
        exact: true,
      },
      {
        href: "/dashboard/internal-link-checker/most-linked",
        label: "Most linked pages",
      },
      {
        href: "/dashboard/internal-link-checker/anchors",
        label: "Internal anchors",
      },
    ],
  },
  {
    label: "My Site",
    items: [
      {
        href: "/dashboard/gsc-insights-tool",
        label: "GSC Insights",
        icon: BarChart3,
      },
      {
        href: "/dashboard/rank-tracker",
        label: "Rank Tracking",
        icon: TrendingUp,
      },
      {
        href: "/dashboard/saved-keywords-manager",
        label: "Saved Keywords",
        icon: Bookmark,
      },
      {
        href: "/dashboard/site-audit-tool",
        label: "Site Audit",
        icon: ClipboardCheck,
      },
    ],
  },
  connectNavGroup,
];

export const allDashboardNavItems = dashboardNavGroups.flatMap((g) => g.items);
