"use client";

import { motion } from "framer-motion";
import {
  KeyRound,
  Radio,
  ShieldCheck,
  Zap,
} from "lucide-react";

const items = [
  {
    icon: KeyRound,
    title: "One account, all your machines",
    body: "Each user pairs their own desktop and keeps full ownership of their workflow. No shared sessions, no leaked context.",
  },
  {
    icon: Radio,
    title: "Live bridge to your tools",
    body: "Convex pipes commands to your local connector in real time. Your prompts hit Codex or Cursor on your machine, not a sandbox.",
  },
  {
    icon: Zap,
    title: "Mobile-first command surface",
    body: "Send tasks, queue templates, and watch activity stream in — from a phone-friendly UI that feels calm under pressure.",
  },
  {
    icon: ShieldCheck,
    title: "Trust-first by design",
    body: "Clerk for identity, short-lived pairing codes, and a connector you run yourself. Nothing happens you didn’t ask for.",
  },
];

export function Capabilities() {
  return (
    <section
      id="product"
      className="relative border-b border-border py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Capabilities"
          title={
            <>
              Everything you need.{" "}
              <span className="text-muted-strong">Nothing you don’t.</span>
            </>
          }
        />

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {items.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0.001, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{
                duration: 0.6,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative bg-background p-8 transition-colors duration-300 hover:bg-surface md:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-border-strong bg-surface-elevated text-muted-strong transition-colors duration-300 group-hover:border-accent/40 group-hover:text-accent">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <h3 className="mt-8 text-2xl font-semibold tracking-tight md:text-[1.65rem]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-strong md:text-[0.95rem]">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-pretty text-base text-muted-strong md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
