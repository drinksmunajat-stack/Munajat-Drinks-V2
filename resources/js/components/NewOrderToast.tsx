import React, { useEffect, useState, useCallback, useRef } from "react";
import { X, ChevronRight, ShoppingBag, Bell, Coffee, Store, User, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "../context/ThemeContext";
import { orderCodesApi } from "../services/api";

export interface RealOrderToastData {
  id: number;
  code: string;
  customer: string;
  items: string[];
  total: string;
  cabang: string;
  payment: string;
  time: string;
}

// Notification sound synthesizer using Web Audio API
function playOrderDing() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First chime note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Second higher harmonic note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Ignore audio context error
  }
}

export default function NewOrderToast() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [order, setOrder] = useState<RealOrderToastData | null>(null);
  const [progress, setProgress] = useState(100);
  const [, navigate] = useLocation();
  const { colorMode, transparency } = useTheme();
  const dark = colorMode === "dark";

  const knownOrderIdsRef = useRef<Set<number>>(new Set());
  const initialLoadDoneRef = useRef<boolean>(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      setLeaving(false);
    }, 350);
  }, []);

  const triggerNewOrderPopup = useCallback((newOrder: any) => {
    const itemsList: string[] = [];
    if (Array.isArray(newOrder.items_data)) {
      newOrder.items_data.forEach((it: any) => {
        if (typeof it === "string") {
          itemsList.push(it);
        } else if (it && it.name) {
          itemsList.push(`${it.name}${it.qty && it.qty > 1 ? ` (${it.qty}x)` : ""}`);
        }
      });
    }

    const toastData: RealOrderToastData = {
      id: newOrder.id,
      code: newOrder.order_code || `#ORD-${newOrder.id}`,
      customer: newOrder.customer_name || "Customer",
      items: itemsList.length > 0 ? itemsList : ["Munajat Drinks Beverage"],
      total: "Rp " + Number(newOrder.total_amount || 0).toLocaleString("id-ID"),
      cabang: newOrder.cabang?.name || "Main Branch",
      payment: newOrder.payment_method || "QRIS",
      time: new Date(newOrder.created_at || Date.now()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };

    setOrder(toastData);
    setProgress(100);
    setLeaving(false);
    setVisible(true);
    playOrderDing();
  }, []);

  // Poll database for new orders
  useEffect(() => {
    let isMounted = true;

    const checkDatabaseOrders = async () => {
      try {
        const res = await orderCodesApi.getAll();
        if (!isMounted) return;

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Sort by latest id descending
          const sorted = [...res.data].sort((a, b) => b.id - a.id);

          if (!initialLoadDoneRef.current) {
            // First time loading - record all existing IDs without popping toast
            sorted.forEach(o => knownOrderIdsRef.current.add(o.id));
            initialLoadDoneRef.current = true;
          } else {
            // Find newly inserted orders not in known set
            const newOrders = sorted.filter(o => !knownOrderIdsRef.current.has(o.id));
            if (newOrders.length > 0) {
              const latestNew = newOrders[0];
              knownOrderIdsRef.current.add(latestNew.id);
              triggerNewOrderPopup(latestNew);
            }
          }
        }
      } catch (err) {
        // Silently fail polling
      }
    };

    // Initial check
    checkDatabaseOrders();

    // Poll every 3 seconds
    const interval = setInterval(checkDatabaseOrders, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [triggerNewOrderPopup]);

  // Listen to in-window event (e.g. from Voice Kasir instant creation)
  useEffect(() => {
    const handleOrderCreatedEvent = (e: CustomEvent) => {
      if (e.detail) {
        knownOrderIdsRef.current.add(e.detail.id);
        triggerNewOrderPopup(e.detail);
      }
    };

    window.addEventListener("munajat:order_created" as any, handleOrderCreatedEvent);
    return () => window.removeEventListener("munajat:order_created" as any, handleOrderCreatedEvent);
  }, [triggerNewOrderPopup]);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!visible || leaving) return;

    const duration = 7000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p <= step) {
          clearInterval(timer);
          dismiss();
          return 0;
        }
        return p - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [visible, leaving, dismiss]);

  if (!visible || !order) return null;

  const initials = order.customer.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const toastBg = dark
    ? (transparency ? "rgba(10, 18, 38, 0.95)" : "#0b1329")
    : (transparency ? "rgba(255, 255, 255, 0.96)" : "#ffffff");
  
  const toastBorder = dark ? "rgba(16, 185, 129, 0.35)" : "rgba(16, 185, 129, 0.25)";
  const toastShadow = dark ? "0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(16,185,129,0.15)" : "0 20px 50px rgba(15,23,42,0.12), 0 0 30px rgba(16,185,129,0.1)";
  const cardBg = dark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const cardBorder = dark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const labelColor = dark ? "#34d399" : "#059669";
  const btnBgHover = dark ? "rgba(255,255,255,0.08)" : "#f1f5f9";

  return (
    <>
      <style>{`
        @keyframes toast-in {
          0% { transform: translateY(100px) scale(0.92); opacity: 0; }
          60% { transform: translateY(-8px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes toast-out {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(80px) scale(0.92); opacity: 0; }
        }
        @keyframes toast-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>

      <div style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        width: "360px",
        background: toastBg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1.5px solid ${toastBorder}`,
        borderRadius: "24px",
        boxShadow: toastShadow,
        overflow: "hidden",
        animation: leaving
          ? "toast-out 0.35s cubic-bezier(0.4,0,1,1) forwards"
          : "toast-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>
        {/* Top Gradient Bar */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)"
        }} />

        <div style={{ padding: "18px 20px 16px" }}>
          
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Bell size={16} color="#10b981" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: labelColor, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    New Order Received!
                  </span>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", animation: "toast-pulse 1.8s infinite" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
                  {order.code} · {order.time}
                </div>
              </div>
            </div>

            <button
              onClick={dismiss}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "transparent",
                color: "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                flexShrink: 0
              }}
              onMouseEnter={e => (e.currentTarget.style.background = btnBgHover)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <X size={14} />
            </button>
          </div>

          {/* Order Details Card */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: "16px",
            padding: "12px 14px",
            marginBottom: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  flexShrink: 0,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 900,
                  color: "white",
                  boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)"
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--ph-text)" }}>
                    {order.customer}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
                    <Store size={11} color="#059669" />
                    <span>{order.cabang}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#10b981" }}>
                  {order.total}
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#0284c7", backgroundColor: "rgba(6, 182, 212, 0.1)", padding: "1px 6px", borderRadius: "4px" }}>
                  {order.payment}
                </span>
              </div>
            </div>

            {/* Items Ordered List */}
            <div style={{
              fontSize: "12px",
              color: "var(--ph-text-muted)",
              borderTop: `1px solid ${cardBorder}`,
              paddingTop: "6px",
              lineHeight: 1.4
            }}>
              ☕ {order.items.join(" · ")}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={dismiss}
              style={{
                flex: 1,
                padding: "9px",
                borderRadius: "12px",
                border: "1.5px solid #e2e8f0",
                background: "transparent",
                color: "#64748b",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => (e.currentTarget.style.background = btnBgHover)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                navigate("/admin/database/order-codes");
                dismiss();
              }}
              style={{
                flex: 2,
                padding: "9px 14px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                fontSize: "12.5px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
              }}
            >
              <span>View Order</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: "3px", background: "rgba(0,0,0,0.05)" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #10b981, #06b6d4)",
            transition: "width 0.05s linear"
          }} />
        </div>
      </div>
    </>
  );
}
