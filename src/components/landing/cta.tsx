"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section id="pricing" className="relative overflow-hidden border-b border-border py-28 md:py-36">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />

      {/* Noise overlay */}
      <div className="noise-overlay pointer-events-none absolute inset-0 z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <h2 className="text-balance text-5xl font-semibold leading-[1] tracking-tight md:text-7xl">
          Ready to ship from
          <br />
          <span className="text-muted-strong">your back pocket?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-strong md:text-lg">
          Free while in beta. Pair your machine in under a minute and route
          your first task today.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={"/signup" as Route}>
            <Button size="lg" variant="primary" className="group btn-shimmer">
              Start free
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href={"/signin" as Route}>
            <Button size="lg" variant="ghost">
              I already have an account
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted">
          No credit card required · Bring your own machine
        </p>
      </motion.div>
    </section>
  );
}
