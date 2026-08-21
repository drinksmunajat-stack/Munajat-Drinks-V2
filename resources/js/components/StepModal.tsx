import React, { useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { BORDER } from "../theme";
import { useTheme } from "../context/ThemeContext";

export interface StepDef {
  label: string;
  icon: React.ReactNode;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  steps: StepDef[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  canProceed?: boolean;
  nextLabel?: string;
  finishLabel?: string;
  children: React.ReactNode;
}

export default function StepModal({
  open, onClose, title, subtitle, steps, currentStep,
  onNext, onBack, onFinish, canProceed = true,
  nextLabel = "Continue", finishLabel = "Finish", children,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { colorMode, transparency } = useTheme();
  const dark = colorMode === "dark";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isLast = currentStep === steps.length - 1;
  const prog = ((currentStep) / (steps.length - 1)) * 100;

  // ── Adaptive tokens ──────────────────────────────────────
  const overlayBg      = dark ? "rgba(0,0,0,0.65)"              : "rgba(15,23,42,0.30)";
  const modalBg        = dark
    ? transparency ? "rgba(7,13,31,0.72)"    : "rgba(7,13,31,0.96)"
    : transparency ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.97)";
  const modalBorder    = dark ? "rgba(255,255,255,0.09)"         : "rgba(0,0,0,0.10)";
  const modalShadow    = dark
    ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 32px 80px rgba(15,23,42,0.16), 0 0 0 1px rgba(99,102,241,0.10), inset 0 1px 0 rgba(255,255,255,0.80)";
  const headerGradient = dark ? "rgba(139,92,246,0.06)"          : "rgba(139,92,246,0.04)";
  const btnBg          = dark ? "rgba(255,255,255,0.04)"         : "rgba(0,0,0,0.04)";
  const btnBgHover     = dark ? "rgba(255,255,255,0.08)"         : "rgba(0,0,0,0.08)";
  const btnBorder      = dark ? "rgba(255,255,255,0.08)"         : "rgba(0,0,0,0.09)";
  const progressLineBg = dark ? "rgba(255,255,255,0.06)"         : "rgba(0,0,0,0.08)";
  const stepInactiveBg = dark ? "rgba(255,255,255,0.04)"         : "rgba(0,0,0,0.04)";
  const stepBorder     = dark ? "rgba(255,255,255,0.12)"         : "rgba(0,0,0,0.12)";
  const footerBg       = dark ? "rgba(0,0,0,0.12)"              : "rgba(0,0,0,0.025)";
  const backBtnBg      = dark ? "rgba(255,255,255,0.04)"         : "rgba(0,0,0,0.04)";
  const backBtnBgHov   = dark ? "rgba(255,255,255,0.08)"         : "rgba(0,0,0,0.08)";
  const backBtnBorder  = dark ? "rgba(255,255,255,0.10)"         : "rgba(0,0,0,0.10)";

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: overlayBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "20px",
        animation: "ph-fade-in 0.2s ease",
      }}
    >
      <style>{`
        @keyframes ph-fade-in { from { opacity:0 } to { opacity:1 } }
        @keyframes ph-slide-up { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:none } }
        @keyframes ph-step-in { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
      `}</style>

      <div style={{
        width: "100%", maxWidth: "680px", maxHeight: "90vh",
        background: modalBg,
        backdropFilter: transparency ? "blur(48px) saturate(1.8)" : "none",
        WebkitBackdropFilter: transparency ? "blur(48px) saturate(1.8)" : "none",
        border: `1px solid ${modalBorder}`,
        borderRadius: "28px",
        boxShadow: modalShadow,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        animation: "ph-slide-up 0.28s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* ── Top bar ─────────────────────── */}
        <div style={{
          padding: "28px 32px 24px",
          background: `linear-gradient(180deg, ${headerGradient} 0%, transparent 100%)`,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          {/* Title row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
            <div>
              <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px", color: "var(--ph-text)" }}>{title}</h2>
              {subtitle && <p style={{ margin: 0, fontSize: "14px", color: "var(--ph-text-muted)" }}>{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              style={{ width: "36px", height: "36px", borderRadius: "10px", border: `1px solid ${btnBorder}`, background: btnBg, color: "var(--ph-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = btnBgHover; e.currentTarget.style.color = "var(--ph-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = btnBg; e.currentTarget.style.color = "var(--ph-text-muted)"; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Step tracker */}
          <div style={{ position: "relative" }}>
            {/* Progress line bg */}
            <div style={{ position: "absolute", top: "18px", left: "18px", right: "18px", height: "2px", background: progressLineBg, borderRadius: "1px" }} />
            {/* Progress line fill */}
            <div style={{ position: "absolute", top: "18px", left: "18px", width: `calc(${prog}% * ${(steps.length - 1) / steps.length} * (100% / 100))`, height: "2px", background: "linear-gradient(90deg, #7c3aed, #06b6d4)", borderRadius: "1px", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 0 8px rgba(139,92,246,0.6)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {steps.map((step, i) => {
                const done   = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                      background: done
                        ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)"
                        : active
                        ? "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)"
                        : stepInactiveBg,
                      border: done || active ? "none" : `1.5px solid ${stepBorder}`,
                      boxShadow: active ? "0 0 0 4px rgba(139,92,246,0.18), 0 0 20px rgba(139,92,246,0.3)" : done ? "0 4px 12px rgba(124,58,237,0.3)" : "none",
                    }}>
                      {done
                        ? <Check size={16} color="white" strokeWidth={2.5} />
                        : <span style={{ color: active ? "white" : "var(--ph-text-dim)", fontSize: "13px", fontWeight: 700 }}>{i + 1}</span>
                      }
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: active ? 600 : 500, color: active ? "var(--ph-text)" : done ? "#8b5cf6" : "var(--ph-text-dim)", textAlign: "center", whiteSpace: "nowrap", letterSpacing: "0.3px", textTransform: "uppercase", transition: "color 0.3s" }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────── */}
        <div
          key={currentStep}
          style={{
            flex: 1, overflowY: "auto", padding: "32px",
            animation: "ph-step-in 0.25s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {children}
        </div>

        {/* ── Footer ──────────────────────── */}
        <div style={{
          padding: "20px 32px",
          borderTop: `1px solid ${BORDER}`,
          background: footerBg,
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px",
        }}>
          <div style={{ fontSize: "13px", color: "var(--ph-text-dim)" }}>
            Step {currentStep + 1} of {steps.length}
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {currentStep > 0 && (
              <button
                onClick={onBack}
                style={{ padding: "10px 22px", borderRadius: "10px", border: `1px solid ${backBtnBorder}`, background: backBtnBg, color: "var(--ph-text)", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = backBtnBgHov}
                onMouseLeave={e => e.currentTarget.style.background = backBtnBg}
              >
                Back
              </button>
            )}
            <button
              onClick={isLast ? onFinish : onNext}
              disabled={!canProceed}
              style={{
                padding: "10px 28px", borderRadius: "10px", border: "none",
                background: canProceed
                  ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)"
                  : dark ? "rgba(128,128,128,0.15)" : "rgba(0,0,0,0.08)",
                color: canProceed ? "white" : "var(--ph-text-dim)",
                fontSize: "14px", fontWeight: 600, cursor: canProceed ? "pointer" : "not-allowed",
                boxShadow: canProceed ? "0 4px 16px rgba(124,58,237,0.35)" : "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (canProceed) e.currentTarget.style.boxShadow = "0 6px 20px rgba(124,58,237,0.55)"; }}
              onMouseLeave={e => { if (canProceed) e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.35)"; }}
            >
              {isLast ? finishLabel : nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
