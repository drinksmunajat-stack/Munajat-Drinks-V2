import React from "react";
import { useTheme } from "../context/ThemeContext";

const BLOBS_DARK = [
  { color: "#7c3aed", x: "10%",  y: "15%", size: 520, delay: "0s",   dur: "18s" },
  { color: "#06b6d4", x: "75%",  y: "8%",  size: 440, delay: "-6s",  dur: "22s" },
  { color: "#4f46e5", x: "55%",  y: "60%", size: 580, delay: "-3s",  dur: "20s" },
  { color: "#d946ef", x: "5%",   y: "65%", size: 380, delay: "-9s",  dur: "25s" },
  { color: "#0ea5e9", x: "85%",  y: "72%", size: 340, delay: "-14s", dur: "16s" },
];

const BLOBS_LIGHT = [
  { color: "#c4b5fd", x: "10%",  y: "15%", size: 520, delay: "0s",   dur: "18s" },
  { color: "#a5f3fc", x: "75%",  y: "8%",  size: 440, delay: "-6s",  dur: "22s" },
  { color: "#a5b4fc", x: "55%",  y: "60%", size: 580, delay: "-3s",  dur: "20s" },
  { color: "#f5d0fe", x: "5%",   y: "65%", size: 380, delay: "-9s",  dur: "25s" },
  { color: "#bae6fd", x: "85%",  y: "72%", size: 340, delay: "-14s", dur: "16s" },
];

const KEYFRAMES = `
  @keyframes ph-blob1 {
    0%,100% { transform: translate(0px, 0px) scale(1); }
    25%  { transform: translate(60px, -80px) scale(1.12); }
    50%  { transform: translate(-40px, 60px) scale(0.88); }
    75%  { transform: translate(80px, 40px)  scale(1.05); }
  }
  @keyframes ph-blob2 {
    0%,100% { transform: translate(0px, 0px) scale(1); }
    30%  { transform: translate(-70px, 50px)  scale(1.1); }
    60%  { transform: translate(50px, -60px)  scale(0.9); }
    80%  { transform: translate(-30px, -20px) scale(1.08); }
  }
  @keyframes ph-blob3 {
    0%,100% { transform: translate(0px, 0px) scale(1); }
    20%  { transform: translate(40px, 70px)   scale(1.15); }
    55%  { transform: translate(-60px, -40px) scale(0.85); }
    80%  { transform: translate(30px, -50px)  scale(1.1); }
  }
  @keyframes ph-blob4 {
    0%,100% { transform: translate(0px, 0px) scale(1); }
    35%  { transform: translate(80px, -30px)  scale(1.08); }
    65%  { transform: translate(-50px, 70px)  scale(0.92); }
    85%  { transform: translate(20px, 20px)   scale(1.04); }
  }
  @keyframes ph-blob5 {
    0%,100% { transform: translate(0px, 0px) scale(1); }
    40%  { transform: translate(-80px, -60px) scale(1.14); }
    70%  { transform: translate(60px, 50px)   scale(0.86); }
    90%  { transform: translate(-20px, 30px)  scale(1.06); }
  }
`;

const ANIMS = ["ph-blob1", "ph-blob2", "ph-blob3", "ph-blob4", "ph-blob5"];

export default function AnimatedBackground() {
  const { bgMode, colorMode } = useTheme();
  const blobs = colorMode === "dark" ? BLOBS_DARK : BLOBS_LIGHT;
  const bgBase = colorMode === "dark" ? "#070d1f" : "#f1f5f9";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundColor: bgBase,
          overflow: "hidden", pointerEvents: "none",
        }}
      >
        {bgMode === "animated" && blobs.map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x, top: b.y,
              width: b.size, height: b.size,
              borderRadius: "50%",
              background: b.color,
              opacity: colorMode === "dark" ? 0.22 : 0.35,
              filter: "blur(80px)",
              animationName: ANIMS[i],
              animationDuration: b.dur,
              animationDelay: b.delay,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDirection: "alternate",
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </>
  );
}
