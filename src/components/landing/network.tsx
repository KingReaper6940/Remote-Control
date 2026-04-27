"use client";

import { motion } from "framer-motion";
import { Activity, Globe2 } from "lucide-react";

import { SectionHeading } from "@/components/landing/capabilities";

const nodes = [
  { city: "San Francisco", region: "US West", latency: "12ms" },
  { city: "New York", region: "US East", latency: "18ms" },
  { city: "London", region: "Europe", latency: "24ms" },
  { city: "Tokyo", region: "Asia Pacific", latency: "32ms" },
  { city: "Sydney", region: "Oceania", latency: "45ms" },
  { city: "São Paulo", region: "South America", latency: "38ms" },
];

export function Network() {
  return (
    <section
      id="network"
      className="relative border-b border-border py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow="Infrastructure"
            title={
              <>
                Global by{" "}
                <span className="text-muted-strong">default.</span>
              </>
            }
            description="Your connector phones home over a Convex realtime channel that spans the globe. Your prompts hit your machine in milliseconds, no matter where you are."
          />

          <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface p-6 md:p-8">
            <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Globe2 className="h-4 w-4 text-accent" />
                <span className="font-medium">Edge network</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-2.5 py-1 text-[0.7rem] font-medium text-success">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                All operational
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              {[
                { value: "17", label: "Edge regions" },
                { value: "99.99%", label: "Uptime SLA" },
                { value: "<50ms", label: "Bridge latency" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-background/50 p-3"
                >
                  <div className="text-xl font-semibold tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-muted">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-1.5">
              {nodes.map((node, idx) => (
                <motion.div
                  key={node.city}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.05,
                    ease: "easeOut",
                  }}
                  className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm transition-colors hover:border-border hover:bg-background/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                    <div>
                      <div className="font-medium">{node.city}</div>
                      <div className="text-xs text-muted">{node.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Activity className="h-3 w-3 text-muted" />
                    <span className="font-mono text-muted-strong">
                      {node.latency}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
