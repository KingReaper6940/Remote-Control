"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  PlayCircle,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const rotatingWords = ["scale", "reason", "execute", "adapt"];

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex text-left align-bottom" style={{ perspective: "600px" }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={rotatingWords[index]}
          initial={{ opacity: 0, y: 16, rotateX: -45 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -16, rotateX: 45 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block text-accent whitespace-nowrap"
          style={{ transformOrigin: "center bottom" }}
        >
          {rotatingWords[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-border">
      {/* Grid background */}
      <div className="grid-bg absolute inset-0 mask-fade-b opacity-50" />

      {/* Top ambient glow */}
      <div className="absolute -top-40 left-0 h-[420px] w-[820px] rounded-full bg-accent/15 blur-[140px]" />

      {/* Background video (Tree effect) */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center opacity-80 md:object-right"
        >
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-hero-0BnFGdr81Ifnj3WbBZoNt1KE4D5DMT.mp4" type="video/mp4" />
        </video>
        {/* Left readability gradient - stronger for left-aligned text */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 md:via-background/50 to-transparent" />
        {/* Bottom dissolve */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Noise overlay for depth */}
      <div className="noise-overlay pointer-events-none absolute inset-0 z-[2]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="flex items-center gap-4"
          >
            <div className="h-px w-8 bg-border-strong" />
            <span className="text-xs font-mono uppercase tracking-[0.1em] text-muted-strong">
              Autonomous AI agents for distributed computing
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-8 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem]"
          >
            Distributed compute,
            <br />
            <span className="text-muted-strong">
              agents that <RotatingWord />
            </span>
          </motion.h1>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link href={"/signup" as Route}>
              <Button size="lg" variant="primary" className="group btn-shimmer">
                Deploy agents
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <a href="#product">
              <Button size="lg" variant="ghost">
                <PlayCircle className="h-4 w-4" />
                View documentation
              </Button>
            </a>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-3"
          >
            {[
              { value: "3500+", label: "autonomous agents active" },
              { value: "99.7%", label: "distributed uptime" },
              { value: "<50ms", label: "execution latency" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.05em] text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}


