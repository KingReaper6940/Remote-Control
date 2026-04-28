"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Process", href: "#process" },
  { label: "Network", href: "#network" },
  { label: "Pricing", href: "#pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide global header on dashboard — it has its own internal shell
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const isAuthRoute = pathname?.startsWith("/signin") || pathname?.startsWith("/signup");

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link
          href={"/" as Route}
          className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <BrandMark />
          <span>Remote Control</span>
        </Link>

        {!isAuthRoute ? (
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-muted-strong transition-all hover:text-foreground hover:underline hover:underline-offset-4"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" type="button">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="primary" size="sm" type="button">
                Get started
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href={"/dashboard" as Route}
              className="hidden rounded-full border border-border-strong bg-surface-elevated px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-border-strong/80 hover:bg-surface md:inline-flex"
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-1 ring-border-strong",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </motion.header>
  );
}

function BrandMark() {
  return (
    <span className="relative grid h-7 w-7 place-items-center rounded-md border border-border-strong bg-surface-elevated">
      <span className="absolute inset-1 rounded-sm bg-foreground/90" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-background" />
    </span>
  );
}
