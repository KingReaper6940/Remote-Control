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
import { GL } from "./gl";


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const rotatingWords = ["phone", "browser", "laptop", "iPad", "anywhere"];

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
          className="inline-block text-info whitespace-nowrap"
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
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden border-b border-border">
      {/* Grid background */}
      <div className="grid-bg absolute inset-0 mask-fade-b opacity-50" />

      {/* Top ambient glow */}
      <div className="absolute -top-40 left-0 h-[420px] w-[820px] rounded-full bg-info/15 blur-[140px]" />
      
      {/* Bottom ambient glow */}
      <div className="absolute -bottom-40 right-0 h-[420px] w-[820px] rounded-full bg-info/10 blur-[140px]" />

      {/* Animated sphere background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-100 mix-blend-screen">
        <GL hovering={false} />
      </div>

      {/* Noise overlay for depth */}
      <div className="noise-overlay pointer-events-none absolute inset-0 z-[2]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12">
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
              Run AI agents from anywhere
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-8 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem]"
          >
            Ship ideas.
            <br />
            <span className="text-muted-strong whitespace-nowrap">
              Make changes from your <RotatingWord />.
            </span>
          </motion.h1>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-8 max-w-2xl text-xl text-muted-strong md:text-2xl"
          >
            Your work doesn’t stop when you leave your desk.
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
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
        </div>
      </div>
    </section>
  );
}


