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

        <div className="mt-16 grid gap-6 md:grid-cols-3">
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
              className="relative overflow-hidden rounded-2xl border border-border bg-background p-7"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-[0.2em] text-muted">
                  Step {step.label}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
              <h3 className="mt-10 text-3xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-strong">
                {step.body}
              </p>

              <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
