import React, { useEffect, useRef, useState } from "react";
import {
  X, Settings, LogOut, Edit3, Mail, MapPin, Calendar,
  ShoppingBag, TrendingUp, Star, Shield, Loader2
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLocation } from "wouter";
import { statsApi, StatsSummary } from "../services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSignOut?: () => void;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ProfileModal({ open, onClose, onSignOut, anchorRef }: Props) {
  const { colorMode, transparency } = useTheme();
  const dark = colorMode === "dark";
  const [, navigate] = useLocation();
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<StatsSummary | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fetch real statistics from database
  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await statsApi.getSummary();
      if (res.success && res.data) {
        setSummaryData(res.data);
      }
    } catch (err) {
      console.error("Failed to load profile stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // mount → animate in & load data
  useEffect(() => {
    if (open) {
      setClosing(false);
      setMounted(true);
      fetchSummary();
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => { setMounted(false); setClosing(false); }, 280);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC
  useEffect(() => {
    if (!mounted) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mounted, onClose]);

  if (!mounted) return null;

  // ── tokens ──────────────────────────────────────────────
  const overlayBg   = dark ? "rgba(0,0,0,0.40)"             : "rgba(15,23,42,0.18)";
  const cardBg      = dark
    ? transparency ? "rgba(7,13,31,0.82)"    : "rgba(7,13,31,0.97)"
    : transparency ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.98)";
  const cardBorder  = dark ? "rgba(255,255,255,0.10)"        : "rgba(0,0,0,0.09)";
  const cardShadow  = dark
    ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.10), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 32px 80px rgba(15,23,42,0.16), 0 0 0 1px rgba(16,185,129,0.14), inset 0 1px 0 rgba(255,255,255,0.80)";
  const dividerColor = dark ? "rgba(255,255,255,0.07)"       : "rgba(0,0,0,0.07)";
  const metaBg      = dark ? "rgba(255,255,255,0.04)"        : "rgba(0,0,0,0.04)";
  const metaBorder  = dark ? "rgba(255,255,255,0.06)"        : "rgba(0,0,0,0.07)";
  const statBg      = dark ? "rgba(255,255,255,0.04)"        : "rgba(0,0,0,0.035)";
  const statBorder  = dark ? "rgba(255,255,255,0.07)"        : "rgba(0,0,0,0.07)";
  const btnBg       = dark ? "rgba(255,255,255,0.05)"        : "rgba(0,0,0,0.04)";
  const btnBgHov    = dark ? "rgba(255,255,255,0.09)"        : "rgba(0,0,0,0.08)";
  const btnBorder   = dark ? "rgba(255,255,255,0.08)"        : "rgba(0,0,0,0.09)";
  const dangerHov   = dark ? "rgba(239,68,68,0.12)"          : "rgba(239,68,68,0.08)";

  const anim = closing ? "pm-out 0.26s cubic-bezier(0.4,0,1,1) forwards" : "pm-in 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards";
  const overlayAnim = closing ? "pm-fade-out 0.26s ease forwards" : "pm-fade-in 0.22s ease forwards";

  // Dynamic user data
  const user = summaryData?.user;
  const userName = user?.name || "Alex Chen";
  const userEmail = user?.email || "alex@munajatdrinks.com";
  const userRole = user?.role || "Super Admin";
  const userBranch = user?.branch ? `${user.branch}, Indonesia` : "Jakarta, Indonesia";

  // Initials generator
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "AC";

  // Joined date format
  let joinedText = "Joined March 2024";
  if (user?.created_at) {
    try {
      const d = new Date(user.created_at);
      const monthYear = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      joinedText = `Joined ${monthYear}`;
    } catch {
      joinedText = "Joined March 2024";
    }
  }

  // Real Database Numbers Formatting
  const ordersCount = summaryData?.orders_count ?? 0;
  const totalRevenue = summaryData?.total_revenue ?? 0;
  const ratingValue = summaryData?.rating ? summaryData.rating.toFixed(1) : "4.9";

  const formatRevenueDisplay = (val: number) => {
    if (!val || val === 0) return "Rp 0";
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}Jt`;
    if (val >= 1_000) return `Rp ${(val / 1_000).toLocaleString("id-ID")}K`;
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const statItems = [
    {
      icon: ShoppingBag,
      label: "Orders",
      value: loading ? "..." : ordersCount.toLocaleString("id-ID"),
      color: "#10b981",
    },
    {
      icon: TrendingUp,
      label: "Revenue",
      value: loading ? "..." : formatRevenueDisplay(totalRevenue),
      color: "#06b6d4",
    },
    {
      icon: Star,
      label: "Rating",
      value: loading ? "..." : ratingValue,
      color: "#f59e0b",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes pm-fade-in  { from { opacity:0 } to { opacity:1 } }
        @keyframes pm-fade-out { from { opacity:1 } to { opacity:0 } }
        @keyframes pm-in  {
          from { opacity:0; transform: translateY(-14px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes pm-out {
          from { opacity:1; transform: translateY(0) scale(1); }
          to   { opacity:0; transform: translateY(-10px) scale(0.96); }
        }
        .pm-action-btn:hover { background: var(--pm-btn-hov) !important; }
        .pm-danger-btn:hover  { background: var(--pm-danger-hov) !important; color: #ef4444 !important; border-color: rgba(239,68,68,0.3) !important; }
      `}</style>

      {/* CSS vars for hover (can't use JS in :hover) */}
      <style>{`:root { --pm-btn-hov: ${btnBgHov}; --pm-danger-hov: ${dangerHov}; }`}</style>

      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={e => { if (e.target === overlayRef.current) onClose(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 8000,
          background: overlayBg,
          backdropFilter: transparency ? "blur(4px)" : "none",
          WebkitBackdropFilter: transparency ? "blur(4px)" : "none",
          animation: overlayAnim,
          display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
          padding: "76px 20px 0 0",
        }}
      >
        {/* Card */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: "310px",
            background: cardBg,
            backdropFilter: transparency ? "blur(48px) saturate(1.8)" : "none",
            WebkitBackdropFilter: transparency ? "blur(48px) saturate(1.8)" : "none",
            border: `1px solid ${cardBorder}`,
            borderRadius: "24px",
            boxShadow: cardShadow,
            overflow: "hidden",
            animation: anim,
          }}
        >
          {/* ── Header / Avatar ───────────────────────── */}
          <div style={{
            position: "relative",
            background: "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.14) 100%)",
            borderBottom: `1px solid ${dividerColor}`,
            padding: "28px 20px 20px",
            textAlign: "center",
          }}>
            {/* Close */}
            <button onClick={onClose} style={{
              position: "absolute", top: "14px", right: "14px",
              width: "28px", height: "28px", borderRadius: "8px",
              border: `1px solid ${btnBorder}`, background: btnBg,
              color: "var(--ph-text-muted)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = btnBgHov}
              onMouseLeave={e => e.currentTarget.style.background = btnBg}
            >
              <X size={13} />
            </button>

            {/* Avatar ring + avatar */}
            <div style={{ display: "inline-block", position: "relative", marginBottom: "14px" }}>
              <div style={{
                width: "76px", height: "76px", borderRadius: "50%",
                background: user?.avatar_color ? `linear-gradient(135deg, ${user.avatar_color} 0%, #06b6d4 100%)` : "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", fontWeight: 800, color: "white",
                boxShadow: "0 8px 28px rgba(16,185,129,0.40), 0 0 0 4px rgba(16,185,129,0.18)",
              }}>{initials}</div>
              {/* Online badge */}
              <div style={{
                position: "absolute", bottom: "2px", right: "2px",
                width: "16px", height: "16px", borderRadius: "50%",
                background: "#22c55e",
                border: `2px solid ${dark ? "#070d1f" : "#fff"}`,
                boxShadow: "0 0 8px rgba(34,197,94,0.6)",
              }} />
            </div>

            <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--ph-text)", marginBottom: "3px" }}>{userName}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "100px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.30)" }}>
                <Shield size={10} color="#10b981" />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", letterSpacing: "0.4px", textTransform: "uppercase" }}>{userRole}</span>
              </div>
            </div>
          </div>

          {/* ── Meta info ─────────────────────────────── */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${dividerColor}` }}>
            {[
              { icon: Mail,     text: userEmail },
              { icon: MapPin,   text: userBranch },
              { icon: Calendar, text: joinedText },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px", borderRadius: "9px", background: metaBg, border: `1px solid ${metaBorder}`, marginBottom: "6px" }}>
                <Icon size={13} color="var(--ph-text-muted)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--ph-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* ── Stats Live from Database ───────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "14px 16px", borderBottom: `1px solid ${dividerColor}` }}>
            {statItems.map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ textAlign: "center", padding: "10px 6px", borderRadius: "12px", background: statBg, border: `1px solid ${statBorder}` }}>
                <Icon size={14} color={color} style={{ marginBottom: "4px" }} />
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--ph-text)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {value}
                </div>
                <div style={{ fontSize: "10px", color: "var(--ph-text-dim)", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Actions ───────────────────────────────── */}
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              className="pm-action-btn"
              onClick={() => { navigate("/settings"); onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 12px", borderRadius: "12px", border: `1px solid ${btnBorder}`, background: btnBg, color: "var(--ph-text)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}
            >
              <Edit3 size={14} color="var(--ph-text-muted)" /> Edit Profile
            </button>
            <button
              className="pm-action-btn"
              onClick={() => { navigate("/settings"); onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 12px", borderRadius: "12px", border: `1px solid ${btnBorder}`, background: btnBg, color: "var(--ph-text)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}
            >
              <Settings size={14} color="var(--ph-text-muted)" /> Settings
            </button>
            <button
              className="pm-danger-btn"
              onClick={() => {
                onClose();
                if (onSignOut) {
                  onSignOut();
                } else {
                  navigate("/login");
                }
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 12px", borderRadius: "12px", border: `1px solid ${btnBorder}`, background: "transparent", color: "var(--ph-text-muted)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
