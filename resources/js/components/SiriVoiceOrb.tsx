import React, { useEffect, useState } from "react";

interface SiriVoiceOrbProps {
  size?: number;
  callState: "idle" | "connecting" | "active" | "ai-speaking" | "user-speaking" | "ended";
  volume?: number; // 0 to 1
  onClick?: () => void;
}

export default function SiriVoiceOrb({
  size = 180,
  callState,
  volume = 0,
  onClick,
}: SiriVoiceOrbProps) {
  const isListening = callState === "active" || callState === "user-speaking";
  const isSpeaking = callState === "ai-speaking";
  const isConnecting = callState === "connecting";
  const isActive = isListening || isSpeaking || isConnecting;

  // Multi-frequency wave heights for Siri iOS-style audio visualizer
  const [waveHeights, setWaveHeights] = useState<number[]>([4, 6, 8, 12, 18, 12, 8, 6, 4]);

  useEffect(() => {
    if (!isActive) {
      setWaveHeights([4, 6, 8, 10, 12, 10, 8, 6, 4]);
      return;
    }

    const interval = setInterval(() => {
      const volMultiplier = isSpeaking ? 1.5 : (volume > 0 ? 0.8 + volume * 2.5 : 0.6);
      const newHeights = Array.from({ length: 9 }, (_, i) => {
        const centerDistance = Math.abs(i - 4);
        const maxH = Math.max(8, (48 - centerDistance * 8) * volMultiplier);
        return Math.floor(6 + Math.random() * maxH);
      });
      setWaveHeights(newHeights);
    }, 90);

    return () => clearInterval(interval);
  }, [isActive, isSpeaking, volume]);

  return (
    <div
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes siri-rotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes siri-pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes siri-pulse-fast {
          0%, 100% { transform: scale(0.96); opacity: 0.9; }
          50% { transform: scale(1.22); opacity: 1; }
        }
        @keyframes siri-glow-ambient {
          0%, 100% { filter: blur(28px); opacity: 0.5; }
          50% { filter: blur(36px); opacity: 0.85; }
        }
        @keyframes siri-wave-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.8)); }
        }
      `}</style>

      {/* ── 1. AMBIENT BACKDROP GLOW LAYER ── */}
      <div
        style={{
          position: "absolute",
          width: `${size * 0.95}px`,
          height: `${size * 0.95}px`,
          borderRadius: "50%",
          background: isSpeaking
            ? "radial-gradient(circle, #06b6d4 0%, #3b82f6 40%, #a855f7 70%, transparent 100%)"
            : isListening
            ? "radial-gradient(circle, #10b981 0%, #06b6d4 45%, #6366f1 75%, transparent 100%)"
            : "radial-gradient(circle, #0284c7 0%, #10b981 50%, transparent 80%)",
          filter: "blur(30px)",
          opacity: isActive ? 0.85 : 0.35,
          transition: "all 0.5s ease",
          animation: isActive ? "siri-glow-ambient 3s ease-in-out infinite" : "none",
          pointerEvents: "none",
        }}
      />

      {/* ── 2. OUTER ROTATING FLUID SIRI ORB ── */}
      <div
        style={{
          position: "absolute",
          width: `${size * 0.82}px`,
          height: `${size * 0.82}px`,
          borderRadius: "50%",
          background: isSpeaking
            ? "conic-gradient(from 0deg, #ec4899, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ec4899)"
            : isListening
            ? "conic-gradient(from 0deg, #10b981, #06b6d4, #3b82f6, #8b5cf6, #10b981)"
            : "conic-gradient(from 0deg, #0ea5e9, #10b981, #6366f1, #0ea5e9)",
          filter: "blur(14px)",
          opacity: isActive ? 0.95 : 0.5,
          animation: isActive
            ? `siri-rotate ${isSpeaking ? "2.2s" : "3.5s"} linear infinite`
            : "siri-rotate 8s linear infinite",
          transition: "opacity 0.4s ease",
          boxShadow: isActive ? "0 0 35px rgba(6, 182, 212, 0.6)" : "none",
        }}
      />

      {/* ── 3. MIDDLE CORE FLUID PULSE ORB ── */}
      <div
        style={{
          position: "absolute",
          width: `${size * 0.68}px`,
          height: `${size * 0.68}px`,
          borderRadius: "50%",
          background: isSpeaking
            ? "radial-gradient(circle at 35% 35%, #ffffff 0%, #38bdf8 30%, #6366f1 70%, #0f172a 100%)"
            : isListening
            ? "radial-gradient(circle at 35% 35%, #ffffff 0%, #34d399 35%, #0ea5e9 75%, #070d1f 100%)"
            : "radial-gradient(circle at 35% 35%, #ffffff 0%, #38bdf8 40%, #0369a1 80%, #021a36 100%)",
          boxShadow: "inset 0 0 20px rgba(255,255,255,0.6), 0 10px 30px rgba(0,0,0,0.35)",
          animation: isSpeaking
            ? "siri-pulse-fast 1.4s ease-in-out infinite"
            : isListening
            ? "siri-pulse-slow 2s ease-in-out infinite"
            : "none",
          transition: "all 0.4s ease",
        }}
      />

      {/* ── 4. CENTER SIRI WAVEFORM AUDIO VISUALIZER ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          height: "56px",
        }}
      >
        {waveHeights.map((h, idx) => {
          const isCenter = idx === 4;
          const isMid = idx >= 2 && idx <= 6;
          return (
            <div
              key={idx}
              style={{
                width: "4.5px",
                height: `${h}px`,
                borderRadius: "100px",
                background: isSpeaking
                  ? "linear-gradient(180deg, #ffffff 0%, #38bdf8 60%, #ec4899 100%)"
                  : isListening
                  ? "linear-gradient(180deg, #ffffff 0%, #34d399 50%, #06b6d4 100%)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(56,189,248,0.7) 100%)",
                boxShadow: isActive ? "0 0 10px rgba(255,255,255,0.8)" : "none",
                transition: "height 0.09s ease-in-out",
                opacity: isCenter ? 1 : isMid ? 0.9 : 0.65,
              }}
            />
          );
        })}
      </div>

      {/* ── 5. INNER GLASS HIGHLIGHT RING ── */}
      <div
        style={{
          position: "absolute",
          width: `${size * 0.76}px`,
          height: `${size * 0.76}px`,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.35)",
          boxShadow: "inset 0 2px 6px rgba(255,255,255,0.5)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
