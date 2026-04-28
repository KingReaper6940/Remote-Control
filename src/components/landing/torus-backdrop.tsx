"use client";

import { useEffect, useRef } from "react";

/**
 * Animated 3D torus of glyphs, inspired by the classic ASCII donut renderer.
 * Rendered to a <canvas> for performance and projected with a perspective
 * transform; characters are weighted by surface luminance so the shape reads
 * as a soft, swirling galaxy of points rather than a solid object.
 */
export function TorusBackdrop({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const glyphs = [".", ",", ":", ";", "+", "*", "-", "/", "\\", "T", "L", "·"];

    const POINT_COUNT = 2600;
    type Point = {
      theta: number;
      phi: number;
      glyph: string;
      jitter: number;
    };
    const points: Point[] = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      points.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.random() * Math.PI * 2,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        jitter: (Math.random() - 0.5) * 0.6,
      });
    }

    const R = 1.6;
    const r = 0.85;

    let A = 0;
    let B = 0;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reduceMotion) {
        A += dt * 0.32;
        B += dt * 0.2;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const scale = Math.min(width, height) * 0.36;

      const cosA = Math.cos(A);
      const sinA = Math.sin(A);
      const cosB = Math.cos(B);
      const sinB = Math.sin(B);

      const lx = 0;
      const ly = 0.7071;
      const lz = -0.7071;

      ctx.font =
        '11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const ct = Math.cos(p.theta);
        const st = Math.sin(p.theta);
        const cp = Math.cos(p.phi);
        const sp = Math.sin(p.phi);

        const ox = (R + r * ct) * cp;
        const oy = (R + r * ct) * sp;
        const oz = r * st;

        const x1 = ox;
        const y1 = oy * cosA - oz * sinA;
        const z1 = oy * sinA + oz * cosA;

        const x2 = x1 * cosB - y1 * sinB;
        const y2 = x1 * sinB + y1 * cosB;
        const z2 = z1;

        const nx0 = ct * cp;
        const ny0 = ct * sp;
        const nz0 = st;
        const ny1 = ny0 * cosA - nz0 * sinA;
        const nz1 = ny0 * sinA + nz0 * cosA;
        const nx2 = nx0 * cosB - ny1 * sinB;
        const ny2 = nx0 * sinB + ny1 * cosB;
        const nz2 = nz1;

        const K = 5;
        const zCam = z2 + K;
        const invZ = 1 / zCam;
        const px = cx + x2 * scale * invZ * 2.4 + p.jitter;
        const py = cy + y2 * scale * invZ * 2.4 + p.jitter;

        if (px < -10 || px > width + 10 || py < -10 || py > height + 10) continue;

        const lum = nx2 * lx + ny2 * ly + nz2 * lz;
        const t = Math.max(0, Math.min(1, (lum + 1) * 0.5));
        const depth = Math.max(0, Math.min(1, (z2 + 2) / 4));

        const alpha = 0.08 + t * 1.05 * (0.45 + depth * 0.55);
        if (alpha < 0.05) continue;

        let glyph = p.glyph;
        if (t > 0.85) glyph = "+";
        else if (t < 0.15) glyph = ".";

        ctx.fillStyle = `rgba(245, 244, 240, ${alpha.toFixed(3)})`;
        ctx.fillText(glyph, px, py);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
