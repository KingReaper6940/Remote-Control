"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/landing/capabilities";

const steps = [
  {
    label: "I",
    title: "Sign in once",
    body: "Create an account and land in a dashboard that knows who owns each connected device.",
  },
  {
    label: "II",
    title: "Pair your desktop",
    body: "Generate a short-lived code, run the bridge command locally, and link your machine to your account.",
  },
  {
    label: "III",
    title: "Ship from anywhere",
    body: "Queue work into your own Codex or Cursor workflow and review activity as it streams back.",
  },
];

export function Process() {
  return (
    <section
      id="process"
      className="relative border-b border-border bg-surface/30 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Process"
          title={
            <>
              Three steps.{" "}
              <span className="text-muted-strong">Infinite output.</span>
            </>
          }
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          {/* Connecting line between cards (desktop only) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden md:block">
            <div className="absolute top-1/2 left-[calc(33.333%_-_12px)] right-[calc(33.333%_-_12px)] h-px">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                className="h-full w-full origin-left bg-gradient-to-r from-accent/40 via-accent/20 to-accent/40"
              />
            </div>
            {/* Pulsing dots on the line */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.2 }}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${16.667 + i * 33.333}%` }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border border-accent/40 bg-accent" />
                </span>
              </motion.div>
            ))}
          </div>

          {steps.map((step, idx) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background p-7 transition-all duration-300 hover:border-border-strong hover:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-[0.2em] text-muted">
                  Step {step.label}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
              </div>
              <h3 className="mt-10 text-3xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-strong">
                {step.body}
              </p>

              <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-accent/0 blur-3xl transition-all duration-500 group-hover:bg-accent/8" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
