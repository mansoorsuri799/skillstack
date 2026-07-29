import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted sm:text-sm">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-white/25" aria-hidden>
                    /
                  </span>
                ) : null}
                {last || !crumb.href ? (
                  <span
                    className={last ? "font-medium text-snow/80" : undefined}
                    aria-current={last ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-accent"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
