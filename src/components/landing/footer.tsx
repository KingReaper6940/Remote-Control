import Link from "next/link";
import type { Route } from "next";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Capabilities", href: "#product" },
      { label: "Process", href: "#process" },
      { label: "Network", href: "#network" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/signin" },
      { label: "Sign up", href: "/signup" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="relative grid h-7 w-7 place-items-center rounded-md border border-border-strong bg-surface-elevated">
                <span className="absolute inset-1 rounded-sm bg-foreground/90" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-background" />
              </span>
              Remote Control
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-strong">
              The remote cockpit for your local AI dev tools. Pair once. Route
              work from anywhere. Stay in flow.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href as Route}
                      className="text-sm text-muted-strong transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-8 text-xs text-muted md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Remote Control. Built for shipping.</p>
          <div className="flex items-center gap-4">
            <Link href={"#" as Route} className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href={"#" as Route} className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href={"#" as Route} className="transition-colors hover:text-foreground">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
