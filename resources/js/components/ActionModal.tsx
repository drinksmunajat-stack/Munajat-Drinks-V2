import React, { useEffect, useRef, useState } from "react";
import { X, Pencil, Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import { BORDER } from "../theme";
import { useTheme } from "../context/ThemeContext";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  iconBg?: string;
  iconColor?: string;
  iconLetter?: string;
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export default function ActionModal({
  open, onClose, title, subtitle,
  iconBg = "#8b5cf6", iconColor = "#8b5cf6", iconLetter,
  onEdit, onDelete,
  editLabel = "Edit", deleteLabel = "Delete",
}: Props) {
  const [mode, setMode] = useState<"choose" | "confirm">("choose");
  const overlayRef = useRef<HTMLDivElement>(null);
  const { colorMode, transparency } = useTheme();
  const dark = colorMode === "dark";

  useEffect(() => {
    if (open) setMode("choose");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  // ── Adaptive tokens ──────────────────────────────────────
  const overlayBg      = dark ? "rgba(0,0,0,0.60)"              : "rgba(15,23,42,0.28)";
  const modalBg        = dark
    ? transparency ? "rgba(7,13,31,0.76)"    : "rgba(7,13,31,0.97)"
    : transparency ? "rgba(255,255,255,0.84)" : "rgba(255,255,255,0.98)";
  const modalBorder    = dark ? "rgba(255,255,255,0.09)"         : "rgba(0,0,0,0.10)";
  const modalShadow    = dark
    ? "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.07), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 32px 80px rgba(15,23,42,0.14), 0 0 0 1px rgba(99,102,241,0.10), inset 0 1px 0 rgba(255,255,255,0.80)";
  const headerGradient = dark ? "rgba(139,92,246,0.06)"          : "rgba(139,92,246,0.04)";
  const btnBg          = dark ? "rgba(255,255,255,0.04)"         : "rgba(0,0,0,0.04)";
  const btnBgHover     = dark ? "rgba(255,255,255,0.08)"         : "rgba(0,0,0,0.08)";
  const btnBorder      = dark ? "rgba(255,255,255,0.08)"         : "rgba(0,0,0,0.09)";
  const editCardBg     = dark ? "rgba(139,92,246,0.07)"          : "rgba(139,92,246,0.06)";
  const editCardBorder = dark ? "rgba(139,92,246,0.20)"          : "rgba(139,92,246,0.22)";
  const delCardBg      = dark ? "rgba(239,68,68,0.05)"           : "rgba(239,68,68,0.05)";
  const delCardBorder  = dark ? "rgba(239,68,68,0.18)"           : "rgba(239,68,68,0.18)";
  const cancelBorder   = dark ? "rgba(255,255,255,0.07)"         : "rgba(0,0,0,0.08)";
  const cancelHover    = dark ? "rgba(255,255,255,0.04)"         : "rgba(0,0,0,0.04)";
  const keepBg         = dark ? "rgba(255,255,255,0.04)"         : "rgba(0,0,0,0.04)";
  const keepBgHover    = dark ? "rgba(255,255,255,0.08)"         : "rgba(0,0,0,0.08)";
  const keepBorder     = dark ? "rgba(255,255,255,0.08)"         : "rgba(0,0,0,0.09)";

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
        animation: "am-fade-in 0.18s ease",
      }}
    >
      <style>{`
        @keyframes am-fade-in  { from { opacity:0 } to { opacity:1 } }
        @keyframes am-slide-up { from { opacity:0; transform:translateY(20px) scale(0.97) } to { opacity:1; transform:none } }
        @keyframes am-slide-switch { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:none } }
        .am-edit-card:hover  { background: rgba(139,92,246,0.14) !important; border-color: rgba(139,92,246,0.55) !important; transform: translateY(-2px); }
        .am-delete-card:hover { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.45) !important; transform: translateY(-2px); }
      `}</style>

      <div style={{
        width: "100%", maxWidth: "480px",
        background: modalBg,
        backdropFilter: transparency ? "blur(48px) saturate(1.8)" : "none",
        WebkitBackdropFilter: transparency ? "blur(48px) saturate(1.8)" : "none",
        border: `1px solid ${modalBorder}`,
        borderRadius: "28px",
        boxShadow: modalShadow,
        overflow: "hidden",
        animation: "am-slide-up 0.28s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* Header */}
        <div style={{
          padding: "24px 28px 20px",
          background: `linear-gradient(180deg, ${headerGradient} 0%, transparent 100%)`,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Back arrow when in confirm mode */}
              {mode === "confirm" && (
                <button onClick={() => setMode("choose")}
                  style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${btnBorder}`, background: btnBg, color: "var(--ph-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowLeft size={14} />
                </button>
              )}
              {/* Icon */}
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `linear-gradient(135deg, ${iconBg}30 0%, transparent 100%)`, border: `1.5px solid ${iconBg}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: iconColor, flexShrink: 0 }}>
                {iconLetter ?? "•"}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--ph-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h3>
                {subtitle && <p style={{ margin: 0, fontSize: "13px", color: "var(--ph-text-muted)", marginTop: "2px" }}>{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose}
              style={{ width: "34px", height: "34px", borderRadius: "9px", border: `1px solid ${btnBorder}`, background: btnBg, color: "var(--ph-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = btnBgHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = btnBg; }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body — animated switch between choose / confirm */}
        <div key={mode} style={{ padding: "28px", animation: "am-slide-switch 0.22s cubic-bezier(0.4,0,0.2,1)" }}>

          {mode === "choose" && (
            <>
              <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "var(--ph-text-muted)", textAlign: "center" }}>
                Choose an action for this item
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                {/* Edit card */}
                <button
                  className="am-edit-card"
                  onClick={() => { onEdit(); onClose(); }}
                  style={{
                    padding: "22px 16px", borderRadius: "18px", cursor: "pointer",
                    border: `1.5px solid ${editCardBorder}`,
                    background: editCardBg,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                    transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(124,58,237,0.35)" }}>
                    <Pencil size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--ph-text)", marginBottom: "4px" }}>{editLabel}</div>
                    <div style={{ fontSize: "12px", color: "var(--ph-text-muted)", lineHeight: 1.4 }}>Make changes to this item</div>
                  </div>
                </button>

                {/* Delete card */}
                <button
                  className="am-delete-card"
                  onClick={() => setMode("confirm")}
                  style={{
                    padding: "22px 16px", borderRadius: "18px", cursor: "pointer",
                    border: `1.5px solid ${delCardBorder}`,
                    background: delCardBg,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                    transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(239,68,68,0.35)" }}>
                    <Trash2 size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--ph-text)", marginBottom: "4px" }}>{deleteLabel}</div>
                    <div style={{ fontSize: "12px", color: "var(--ph-text-muted)", lineHeight: 1.4 }}>Remove this item permanently</div>
                  </div>
                </button>
              </div>

              <button onClick={onClose}
                style={{ width: "100%", marginTop: "16px", padding: "11px", borderRadius: "12px", border: `1px solid ${cancelBorder}`, background: "transparent", color: "var(--ph-text-muted)", fontSize: "14px", fontWeight: 500, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = cancelHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Cancel
              </button>
            </>
          )}

          {mode === "confirm" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center", marginBottom: "28px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(239,68,68,0.2)" }}>
                  <AlertTriangle size={28} color="#f87171" />
                </div>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: "var(--ph-text)" }}>Confirm Deletion</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--ph-text-muted)", lineHeight: 1.6 }}>
                    You're about to permanently delete <strong style={{ color: "var(--ph-text)" }}>"{title}"</strong>. This cannot be undone.
                  </p>
                </div>
              </div>

              {/* Danger zone box */}
              <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "14px", padding: "14px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", flexShrink: 0, boxShadow: "0 0 8px #ef4444" }} />
                <span style={{ fontSize: "13px", color: dark ? "#f87171" : "#dc2626" }}>This action is irreversible. All associated data will be lost.</span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setMode("choose")}
                  style={{ flex: 1, padding: "11px", borderRadius: "12px", border: `1px solid ${keepBorder}`, background: keepBg, color: "var(--ph-text)", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = keepBgHover}
                  onMouseLeave={e => e.currentTarget.style.background = keepBg}>
                  Keep It
                </button>
                <button onClick={() => { onDelete(); onClose(); }}
                  style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(239,68,68,0.35)", transition: "box-shadow 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(239,68,68,0.55)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.35)"}>
                  Delete Forever
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
