import React from "react";
import { useTheme } from "../context/ThemeContext";

const KEYFRAMES = `
  @keyframes ph-float1 {
    0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
    20%  { transform: translate(30px, -45px) rotate(8deg) scale(1.06); }
    45%  { transform: translate(-25px, 35px) rotate(-5deg) scale(0.94); }
    70%  { transform: translate(50px, 20px) rotate(12deg) scale(1.04); }
    100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  }
  @keyframes ph-float2 {
    0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
    25%  { transform: translate(-40px, -30px) rotate(-10deg) scale(1.08); }
    55%  { transform: translate(35px, 50px) rotate(6deg) scale(0.92); }
    80%  { transform: translate(-20px, -15px) rotate(-4deg) scale(1.03); }
    100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  }
  @keyframes ph-float3 {
    0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
    30%  { transform: translate(55px, 30px) rotate(15deg) scale(1.1); }
    60%  { transform: translate(-30px, -55px) rotate(-8deg) scale(0.88); }
    85%  { transform: translate(20px, 40px) rotate(5deg) scale(1.05); }
    100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  }
  @keyframes ph-float4 {
    0%   { transform: translate(0px, 0px) rotate(45deg) scale(1); }
    35%  { transform: translate(-50px, 25px) rotate(60deg) scale(1.12); }
    65%  { transform: translate(40px, -40px) rotate(30deg) scale(0.9); }
    100% { transform: translate(0px, 0px) rotate(45deg) scale(1); }
  }
  @keyframes ph-float5 {
    0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
    20%  { transform: translate(20px, -60px) rotate(-12deg) scale(1.07); }
    50%  { transform: translate(-45px, 20px) rotate(8deg) scale(0.93); }
    75%  { transform: translate(30px, 45px) rotate(-6deg) scale(1.04); }
    100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  }
  @keyframes ph-float6 {
    0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
    40%  { transform: translate(-35px, -50px) rotate(20deg) scale(1.15); }
    70%  { transform: translate(60px, 30px) rotate(-10deg) scale(0.85); }
    100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  }
  @keyframes ph-float7 {
    0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
    30%  { transform: translate(25px, 35px) rotate(18deg) scale(1.1); }
    60%  { transform: translate(-30px, -25px) rotate(-12deg) scale(0.9); }
    100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  }
  @keyframes ph-float8 {
    0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
    25%  { transform: translate(-60px, 40px) rotate(-20deg) scale(1.08); }
    50%  { transform: translate(40px, -30px) rotate(15deg) scale(0.92); }
    75%  { transform: translate(-20px, 50px) rotate(-8deg) scale(1.05); }
    100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  }
  @keyframes ph-pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.3); }
  }
  @keyframes ph-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

type Particle =
  | { kind: "orb";     x: string; y: string; size: number; color: string; blur: number; anim: string; dur: string; delay: string }
  | { kind: "ring";    x: string; y: string; size: number; border: string; bg: string; anim: string; dur: string; delay: string; spin?: boolean }
  | { kind: "dot";     x: string; y: string; size: number; color: string; blur: number; anim: string; dur: string; delay: string }
  | { kind: "diamond"; x: string; y: string; size: number; border: string; bg: string; anim: string; dur: string; delay: string };

const PARTICLES_DARK: Particle[] = [
  // ── large soft orbs ──
  { kind: "orb", x: "12%", y: "18%", size: 320, color: "rgba(124,58,237,0.10)", blur: 90,  anim: "ph-float1", dur: "24s", delay: "0s" },
  { kind: "orb", x: "68%", y: "55%", size: 260, color: "rgba(6,182,212,0.09)",  blur: 75,  anim: "ph-float2", dur: "30s", delay: "-9s" },
  { kind: "orb", x: "42%", y: "8%",  size: 200, color: "rgba(16,185,129,0.09)", blur: 65,  anim: "ph-float3", dur: "22s", delay: "-5s" },
  { kind: "orb", x: "5%",  y: "70%", size: 180, color: "rgba(217,70,239,0.08)", blur: 60,  anim: "ph-float6", dur: "26s", delay: "-14s" },

  // ── glass rings ──
  { kind: "ring", x: "28%", y: "42%", size: 130, border: "rgba(124,58,237,0.30)", bg: "rgba(124,58,237,0.04)", anim: "ph-float4", dur: "18s", delay: "-3s" },
  { kind: "ring", x: "62%", y: "18%", size: 90,  border: "rgba(6,182,212,0.35)",  bg: "rgba(6,182,212,0.05)",  anim: "ph-float5", dur: "14s", delay: "-7s" },
  { kind: "ring", x: "82%", y: "52%", size: 160, border: "rgba(16,185,129,0.25)", bg: "rgba(16,185,129,0.04)", anim: "ph-float7", dur: "20s", delay: "-11s", spin: true },
  { kind: "ring", x: "6%",  y: "78%", size: 110, border: "rgba(217,70,239,0.28)", bg: "rgba(217,70,239,0.04)", anim: "ph-float8", dur: "16s", delay: "-2s" },
  { kind: "ring", x: "52%", y: "78%", size: 70,  border: "rgba(245,158,11,0.30)", bg: "rgba(245,158,11,0.04)", anim: "ph-float2", dur: "12s", delay: "-6s" },
  { kind: "ring", x: "88%", y: "8%",  size: 100, border: "rgba(79,70,229,0.28)",  bg: "rgba(79,70,229,0.04)",  anim: "ph-float3", dur: "17s", delay: "-15s" },
  { kind: "ring", x: "38%", y: "65%", size: 55,  border: "rgba(139,92,246,0.35)", bg: "rgba(139,92,246,0.06)", anim: "ph-float6", dur: "11s", delay: "-8s" },
  { kind: "ring", x: "72%", y: "82%", size: 85,  border: "rgba(6,182,212,0.25)",  bg: "rgba(6,182,212,0.03)",  anim: "ph-float1", dur: "19s", delay: "-4s" },

  // ── diamond shapes ──
  { kind: "diamond", x: "45%", y: "38%", size: 48, border: "rgba(124,58,237,0.35)", bg: "rgba(124,58,237,0.06)", anim: "ph-float5", dur: "22s", delay: "-10s" },
  { kind: "diamond", x: "76%", y: "72%", size: 34, border: "rgba(6,182,212,0.35)",  bg: "rgba(6,182,212,0.05)",  anim: "ph-float3", dur: "27s", delay: "-18s" },
  { kind: "diamond", x: "18%", y: "52%", size: 28, border: "rgba(16,185,129,0.40)", bg: "rgba(16,185,129,0.07)", anim: "ph-float7", dur: "15s", delay: "-5s" },

  // ── sparkle dots ──
  { kind: "dot", x: "34%", y: "30%", size: 10, color: "rgba(139,92,246,0.75)", blur: 8,  anim: "ph-float1", dur: "7s",  delay: "-1s" },
  { kind: "dot", x: "64%", y: "12%", size: 7,  color: "rgba(6,182,212,0.80)",  blur: 5,  anim: "ph-float5", dur: "6s",  delay: "-4s" },
  { kind: "dot", x: "20%", y: "62%", size: 12, color: "rgba(16,185,129,0.70)", blur: 9,  anim: "ph-float2", dur: "9s",  delay: "-6s" },
  { kind: "dot", x: "79%", y: "38%", size: 8,  color: "rgba(217,70,239,0.80)", blur: 6,  anim: "ph-float6", dur: "5s",  delay: "-2s" },
  { kind: "dot", x: "56%", y: "68%", size: 14, color: "rgba(245,158,11,0.65)", blur: 10, anim: "ph-float4", dur: "10s", delay: "-8s" },
  { kind: "dot", x: "92%", y: "45%", size: 9,  color: "rgba(79,70,229,0.75)",  blur: 7,  anim: "ph-float3", dur: "8s",  delay: "-3s" },
];

const PARTICLES_LIGHT: Particle[] = [
  { kind: "orb", x: "12%", y: "18%", size: 320, color: "rgba(124,58,237,0.14)", blur: 90,  anim: "ph-float1", dur: "24s", delay: "0s" },
  { kind: "orb", x: "68%", y: "55%", size: 260, color: "rgba(6,182,212,0.12)",  blur: 75,  anim: "ph-float2", dur: "30s", delay: "-9s" },
  { kind: "orb", x: "42%", y: "8%",  size: 200, color: "rgba(16,185,129,0.12)", blur: 65,  anim: "ph-float3", dur: "22s", delay: "-5s" },
  { kind: "orb", x: "5%",  y: "70%", size: 180, color: "rgba(217,70,239,0.11)", blur: 60,  anim: "ph-float6", dur: "26s", delay: "-14s" },

  { kind: "ring", x: "28%", y: "42%", size: 130, border: "rgba(124,58,237,0.35)", bg: "rgba(124,58,237,0.07)", anim: "ph-float4", dur: "18s", delay: "-3s" },
  { kind: "ring", x: "62%", y: "18%", size: 90,  border: "rgba(6,182,212,0.40)",  bg: "rgba(6,182,212,0.08)",  anim: "ph-float5", dur: "14s", delay: "-7s" },
  { kind: "ring", x: "82%", y: "52%", size: 160, border: "rgba(16,185,129,0.30)", bg: "rgba(16,185,129,0.06)", anim: "ph-float7", dur: "20s", delay: "-11s", spin: true },
  { kind: "ring", x: "6%",  y: "78%", size: 110, border: "rgba(217,70,239,0.32)", bg: "rgba(217,70,239,0.06)", anim: "ph-float8", dur: "16s", delay: "-2s" },
  { kind: "ring", x: "52%", y: "78%", size: 70,  border: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.06)", anim: "ph-float2", dur: "12s", delay: "-6s" },
  { kind: "ring", x: "88%", y: "8%",  size: 100, border: "rgba(79,70,229,0.32)",  bg: "rgba(79,70,229,0.06)",  anim: "ph-float3", dur: "17s", delay: "-15s" },
  { kind: "ring", x: "38%", y: "65%", size: 55,  border: "rgba(139,92,246,0.40)", bg: "rgba(139,92,246,0.08)", anim: "ph-float6", dur: "11s", delay: "-8s" },
  { kind: "ring", x: "72%", y: "82%", size: 85,  border: "rgba(6,182,212,0.30)",  bg: "rgba(6,182,212,0.05)",  anim: "ph-float1", dur: "19s", delay: "-4s" },

  { kind: "diamond", x: "45%", y: "38%", size: 48, border: "rgba(124,58,237,0.40)", bg: "rgba(124,58,237,0.08)", anim: "ph-float5", dur: "22s", delay: "-10s" },
  { kind: "diamond", x: "76%", y: "72%", size: 34, border: "rgba(6,182,212,0.40)",  bg: "rgba(6,182,212,0.07)",  anim: "ph-float3", dur: "27s", delay: "-18s" },
  { kind: "diamond", x: "18%", y: "52%", size: 28, border: "rgba(16,185,129,0.45)", bg: "rgba(16,185,129,0.09)", anim: "ph-float7", dur: "15s", delay: "-5s" },

  { kind: "dot", x: "34%", y: "30%", size: 10, color: "rgba(124,58,237,0.65)",  blur: 8,  anim: "ph-float1", dur: "7s",  delay: "-1s" },
  { kind: "dot", x: "64%", y: "12%", size: 7,  color: "rgba(6,182,212,0.70)",   blur: 5,  anim: "ph-float5", dur: "6s",  delay: "-4s" },
  { kind: "dot", x: "20%", y: "62%", size: 12, color: "rgba(16,185,129,0.60)",  blur: 9,  anim: "ph-float2", dur: "9s",  delay: "-6s" },
  { kind: "dot", x: "79%", y: "38%", size: 8,  color: "rgba(217,70,239,0.70)",  blur: 6,  anim: "ph-float6", dur: "5s",  delay: "-2s" },
  { kind: "dot", x: "56%", y: "68%", size: 14, color: "rgba(245,158,11,0.55)",  blur: 10, anim: "ph-float4", dur: "10s", delay: "-8s" },
  { kind: "dot", x: "92%", y: "45%", size: 9,  color: "rgba(79,70,229,0.65)",   blur: 7,  anim: "ph-float3", dur: "8s",  delay: "-3s" },
];

function renderParticle(p: Particle, i: number) {
  const base: React.CSSProperties = {
    position: "absolute",
    left: p.x,
    top: p.y,
    animationName: p.anim,
    animationDuration: p.dur,
    animationDelay: p.delay,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    willChange: "transform",
  };

  if (p.kind === "orb") {
    return (
      <div key={i} style={{
        ...base,
        width: p.size,
        height: p.size,
        borderRadius: "50%",
        background: p.color,
        filter: `blur(${p.blur}px)`,
      }} />
    );
  }

  if (p.kind === "ring") {
    const ringBase: React.CSSProperties = {
      ...base,
      width: p.size,
      height: p.size,
      borderRadius: "50%",
      background: p.bg,
      border: `1.5px solid ${p.border}`,
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      boxShadow: `0 0 20px ${p.border}, inset 0 0 20px ${p.border.replace(/[\d.]+\)$/, "0.05)")}`,
    };
    // spinning rings get a second animation layered via wrapper
    if (p.spin) {
      return (
        <div key={i} style={{ ...base, width: p.size, height: p.size, animationName: "ph-float7" }}>
          <div style={{
            width: "100%", height: "100%",
            borderRadius: "50%",
            background: p.bg,
            border: `1.5px solid ${p.border}`,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            boxShadow: `0 0 20px ${p.border}`,
            animationName: "ph-spin-slow",
            animationDuration: "12s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }} />
        </div>
      );
    }
    return <div key={i} style={ringBase} />;
  }

  if (p.kind === "diamond") {
    return (
      <div key={i} style={{
        ...base,
        width: p.size,
        height: p.size,
        background: p.bg,
        border: `1.5px solid ${p.border}`,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        transform: "rotate(45deg)",
        boxShadow: `0 0 14px ${p.border}`,
        animationName: p.anim,
      }} />
    );
  }

  // dot
  if (p.kind === "dot") {
    return (
      <div key={i} style={{
        ...base,
        width: p.size,
        height: p.size,
        borderRadius: "50%",
        background: p.color,
        filter: `blur(${p.blur}px)`,
        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
        animationName: "ph-pulse",
        animationDuration: p.dur,
        animationDelay: p.delay,
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
      }}>
        {/* inner bright core */}
        <div style={{
          position: "absolute", inset: "25%",
          borderRadius: "50%",
          background: p.color,
          filter: "blur(2px)",
        }} />
      </div>
    );
  }

  return null;
}

export default function FloatingParticles() {
  const { colorMode } = useTheme();
  const particles = colorMode === "dark" ? PARTICLES_DARK : PARTICLES_LIGHT;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {particles.map((p, i) => renderParticle(p, i))}
      </div>
    </>
  );
}
