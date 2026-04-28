"use client";

import { useEffect, useRef, useCallback } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

const ASCII_CHARS = " .:-=+*#%@";

/**
 * Animated 3D torus-knot of ASCII glyphs, ported from the sample UI's
 * ascii-scene. Rendered to a <canvas> with perspective projection,
 * mouse-reactive parallax, and floating particles for depth.
 */
export function TorusBackdrop({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.addEventListener("mousemove", handleMouseMove);

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // ── Torus-knot geometry (p=2, q=3) ──
    const generateTorusKnot = (
      p: number,
      q: number,
      segments: number,
      tubeSegments: number
    ): Point3D[] => {
      const points: Point3D[] = [];
      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < tubeSegments; j++) {
          const u = (i / segments) * Math.PI * 2;
          const v = (j / tubeSegments) * Math.PI * 2;

          const r = 2 + Math.cos(q * u);
          const x = r * Math.cos(p * u);
          const y = r * Math.sin(p * u);
          const z = -Math.sin(q * u);

          const tubeRadius = 0.4;
          const nx = Math.cos(p * u) * Math.cos(v);
          const ny = Math.sin(p * u) * Math.cos(v);
          const nz = Math.sin(v);

          points.push({
            x: x + tubeRadius * nx,
            y: y + tubeRadius * ny,
            z: z + tubeRadius * nz,
          });
        }
      }
      return points;
    };

    const torusKnot = generateTorusKnot(2, 3, 160, 20);

    // ── 3D rotation ──
    const rotatePoint = (
      point: Point3D,
      angleX: number,
      angleY: number,
      angleZ: number
    ): Point3D => {
      let { x, y, z } = point;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const newY = y * cosX - z * sinX;
      const newZ = y * sinX + z * cosX;
      y = newY;
      z = newZ;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const newX = x * cosY + z * sinY;
      z = -x * sinY + z * cosY;
      x = newX;

      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);
      const finalX = x * cosZ - y * sinZ;
      const finalY = x * sinZ + y * cosZ;

      return { x: finalX, y: finalY, z };
    };

    // ── Perspective projection ──
    const project = (
      point: Point3D,
      centerX: number,
      centerY: number,
      scale: number
    ): { x: number; y: number; z: number } => {
      const perspective = 5;
      const factor = perspective / (perspective + point.z);
      return {
        x: centerX + point.x * scale * factor,
        y: centerY + point.y * scale * factor,
        z: point.z,
      };
    };

    const render = () => {
      if (width === 0 || height === 0) {
        frameRef.current = requestAnimationFrame(render);
        return;
      }

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const scale = Math.min(width, height) * 0.32;

      ctx.clearRect(0, 0, width, height);

      const mouseInfluenceX = (mouseRef.current.x - 0.5) * 0.5;
      const mouseInfluenceY = (mouseRef.current.y - 0.5) * 0.5;

      const time = timeRef.current;
      const angleX = time * 0.3 + mouseInfluenceY;
      const angleY = time * 0.5 + mouseInfluenceX;
      const angleZ = time * 0.2;

      // Project and depth-sort
      const projectedPoints = torusKnot
        .map((point) => {
          const rotated = rotatePoint(point, angleX, angleY, angleZ);
          return project(rotated, centerX, centerY, scale);
        })
        .sort((a, b) => a.z - b.z);

      // Render ASCII glyphs
      const charSize = Math.max(12, Math.min(width, height) * 0.025);
      ctx.font = `${charSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      projectedPoints.forEach((point) => {
        const normalizedZ = (point.z + 3) / 6;
        const charIndex = Math.floor(normalizedZ * (ASCII_CHARS.length - 1));
        const char =
          ASCII_CHARS[Math.max(0, Math.min(ASCII_CHARS.length - 1, charIndex))];

        const brightness = 0.15 + normalizedZ * 0.85;
        // Emerald-gold palette bridging sample green with our accent amber
        const green = Math.floor(170 + normalizedZ * 80);
        const red = Math.floor(green * 0.65 + normalizedZ * 40);
        const blue = Math.floor(green * 0.45);
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${(brightness * 0.7).toFixed(3)})`;
        ctx.fillText(char, point.x, point.y);
      });

      // Floating particles
      const particleCount = 40;
      for (let i = 0; i < particleCount; i++) {
        const px = (Math.sin(time * 0.5 + i * 0.5) * 0.35 + 0.5) * width;
        const py = (Math.cos(time * 0.3 + i * 0.7) * 0.35 + 0.5) * height;
        const pz = Math.sin(time + i) * 0.5 + 0.5;

        ctx.fillStyle = `rgba(180, 210, 160, ${(pz * 0.2).toFixed(3)})`;
        ctx.fillText(
          ASCII_CHARS[Math.floor(pz * (ASCII_CHARS.length - 1))],
          px,
          py
        );
      }

      if (!reduceMotion) {
        timeRef.current += 0.006;
      }
      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [handleMouseMove]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
