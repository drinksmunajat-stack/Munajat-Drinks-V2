import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Coffee, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight,
  Sparkles, Store, ShoppingCart, Clock, CheckCircle2, QrCode,
  Flame, ChevronRight, Zap, RefreshCw, Layers, Snowflake, Loader2
} from "lucide-react";
import { CARD, BORDER } from "../theme";
import { useBreakpoint } from "../hooks/use-breakpoint";
import { useTheme } from "../context/ThemeContext";
import { orderCodesApi, productsApi, cabangsApi } from "../services/api";
import EmptyState from "../components/EmptyState";
import ElegantPagination from "../components/ElegantPagination";

const fmt = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [cabangs, setCabangs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const { isMobile, isTablet } = useBreakpoint();
  const { colorMode } = useTheme();
  const dark = colorMode === "dark";

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [orderRes, prodRes, cabangRes] = await Promise.all([
        orderCodesApi.getAll(),
        productsApi.getAll(),
        cabangsApi.getAll(),
      ]);

      if (orderRes.success && Array.isArray(orderRes.data)) {
        setOrders(orderRes.data);
      }
      if (prodRes.success && Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
      }
      if (cabangRes.success && Array.isArray(cabangRes.data)) {
        setCabangs(cabangRes.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter orders by time
  const now = new Date();
  const filteredOrders = orders.filter(o => {
    if (timeFilter === "All Time") return true;
    if (!o.created_at) return true;
    const oDate = new Date(o.created_at);
    if (timeFilter === "Today") {
      return oDate.toDateString() === now.toDateString();
    }
    if (timeFilter === "7 Days") {
      const diffDays = (now.getTime() - oDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }
    if (timeFilter === "This Month") {
      return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Compute Live Metrics from real DB
  const totalOmset = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalCups = filteredOrders.reduce((sum, o) => {
    if (Array.isArray(o.items_data)) {
      return sum + o.items_data.reduce((iSum: number, item: any) => iSum + (Number(item.qty) || 1), 0);
    }
    return sum + 1;
  }, 0);
  const totalOrdersCount = filteredOrders.length;
  const avgBasket = totalOrdersCount > 0 ? Math.round(totalOmset / totalOrdersCount) : 0;
  const voiceOrdersCount = filteredOrders.filter(o => (o.customer_name && o.customer_name !== 'Walk-In') || o.order_code?.includes('MNJ')).length;

  const STATS = [
    {
      title: "Total Revenue",
      value: fmt(totalOmset),
      change: `+${totalOrdersCount} Orders`,
      subtext: "Live synced from MySQL database",
      up: true,
      icon: DollarSign,
      bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      glow: "0 8px 28px rgba(16,185,129,0.35)",
      color: "#10b981",
    },
    {
      title: "Drink Cups Sold",
      value: `${totalCups} Cups`,
      change: `${products.length} Items`,
      subtext: `Active catalog of ${products.length} drinks`,
      up: true,
      icon: Coffee,
      bg: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      glow: "0 8px 28px rgba(6,182,212,0.35)",
      color: "#06b6d4",
    },
    {
      title: "Voice AI Cashier Orders",
      value: `${voiceOrdersCount} Orders`,
      change: `${totalOrdersCount > 0 ? Math.round((voiceOrdersCount / totalOrdersCount) * 100) : 100}%`,
      subtext: "Processed via Voice Assistant",
      up: true,
      icon: Sparkles,
      bg: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
      glow: "0 8px 28px rgba(139,92,246,0.35)",
      color: "#8b5cf6",
    },
    {
      title: "Average Order Value",
      value: fmt(avgBasket),
      change: "Normal",
      subtext: "Average basket size per order",
      up: true,
      icon: ShoppingCart,
      bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      glow: "0 8px 28px rgba(245,158,11,0.35)",
      color: "#f59e0b",
    },
  ];

  // Aggregate Real Outlets Performance from Database
  const outletColors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"];
  const dynamicOutlets = cabangs.map((c, i) => {
    const branchOrders = filteredOrders.filter(o => o.cabang_id === c.id || o.cabang?.name === c.name);
    const branchRev = branchOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const branchCups = branchOrders.reduce((sum, o) => {
      if (Array.isArray(o.items_data)) {
        return sum + o.items_data.reduce((iSum: number, item: any) => iSum + (Number(item.qty) || 1), 0);
      }
      return sum + 1;
    }, 0);
    const target = Number(c.daily_target || 5000000);
    const targetPct = target > 0 ? Math.min(100, Math.round((branchRev / target) * 100)) : 0;

    return {
      name: c.name,
      city: c.city || "Indonesia",
      rev: branchRev,
      cups: branchCups,
      targetPct,
      status: c.is_active ? "Open" : "Closed",
      color: outletColors[i % outletColors.length],
    };
  });

  // Calculate Real Top Selling Drinks from Orders
  const productSalesMap: Record<string, { name: string; category: string; sold: number; rev: number; emoji: string }> = {};
  
  // Seed with products catalog
  products.forEach(p => {
    const emoji = p.category === "Kopi" ? "☕" : p.category === "Non-Kopi" ? "🍵" : p.category === "Frappe" ? "🥥" : "🍹";
    productSalesMap[p.name] = {
      name: p.name,
      category: p.category || "Coffee",
      sold: 0,
      rev: 0,
      emoji
    };
  });

  // Aggregate from orders items_data
  filteredOrders.forEach(o => {
    if (Array.isArray(o.items_data)) {
      o.items_data.forEach((it: any) => {
        const itemName = typeof it === "string" ? it : it.name;
        const itemQty = Number(it.qty) || 1;
        const itemPrice = Number(it.price) || 25000;
        if (itemName) {
          if (!productSalesMap[itemName]) {
            productSalesMap[itemName] = {
              name: itemName,
              category: "Beverage",
              sold: 0,
              rev: 0,
              emoji: "🍹"
            };
          }
          productSalesMap[itemName].sold += itemQty;
          productSalesMap[itemName].rev += itemPrice * itemQty;
        }
      });
    }
  });

  const topDrinks = Object.values(productSalesMap)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 6)
    .map((p, idx) => ({
      rank: idx + 1,
      emoji: p.emoji,
      name: p.name,
      category: p.category,
      sold: p.sold,
      rev: p.rev,
      badge: idx === 0 ? "Best Seller" : idx === 1 ? "Favorite" : "Popular",
    }));

  const [recentOrdersPage, setRecentOrdersPage] = useState(1);
  const RECENT_PER_PAGE = 5;

  // Recent Orders Feed from Orders DB
  const allRecentOrders = orders.map(o => {
    const itemNames = Array.isArray(o.items_data) && o.items_data.length > 0
      ? o.items_data.map((i: any) => `${i.qty || 1}x ${i.name || 'Drink'}`).join(", ")
      : "1x Munajat Drink";
    const statusMap: Record<string, { label: string; color: string }> = {
      completed: { label: "Completed", color: "#10b981" },
      preparing: { label: "Brewing", color: "#f97316" },
      ready: { label: "Ready", color: "#06b6d4" },
      in_queue: { label: "In Queue", color: "#8b5cf6" },
      cancelled: { label: "Cancelled", color: "#ef4444" },
    };
    const s = statusMap[o.order_status] || { label: "Completed", color: "#10b981" };
    return {
      code: o.order_code || `#ORD-${o.id}`,
      customer: o.customer_name || "Customer",
      branch: o.cabang?.name || "Main Branch",
      items: itemNames,
      total: Number(o.total_amount || 0),
      method: o.payment_method || "QRIS",
      status: s.label,
      statusColor: s.color,
      time: o.created_at ? new Date(o.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "Today",
    };
  });

  const paginatedRecentOrders = allRecentOrders.slice(
    (recentOrdersPage - 1) * RECENT_PER_PAGE,
    recentOrdersPage * RECENT_PER_PAGE
  );

  // Dynamic Hourly Sales Graph computed from Orders
  const hourBuckets: Record<string, { cups: number; rev: number }> = {};
  for (let h = 7; h <= 21; h++) {
    const hStr = (h < 10 ? "0" + h : "" + h) + ":00";
    hourBuckets[hStr] = { cups: 0, rev: 0 };
  }

  filteredOrders.forEach(o => {
    if (o.created_at) {
      const d = new Date(o.created_at);
      const h = d.getHours();
      const hStr = (h < 10 ? "0" + h : "" + h) + ":00";
      if (hourBuckets[hStr]) {
        const orderTotal = Number(o.total_amount || 0);
        const orderCups = Array.isArray(o.items_data) ? o.items_data.reduce((c: number, it: any) => c + (Number(it.qty) || 1), 0) : 1;
        hourBuckets[hStr].cups += orderCups;
        hourBuckets[hStr].rev += orderTotal;
      }
    }
  });

  const HOURLY_SALES = Object.keys(hourBuckets).map(h => ({
    hour: h,
    cups: hourBuckets[h].cups,
    rev: hourBuckets[h].rev,
  }));

  // SVG Chart Calculation
  const chartW = 680;
  const chartH = 180;
  const chartPad = 24;
  const maxCups = Math.max(5, ...HOURLY_SALES.map((d) => d.cups));
  const points = HOURLY_SALES.map((d, i) => ({
    x: chartPad + (i / (HOURLY_SALES.length - 1)) * (chartW - chartPad * 2),
    y: chartPad + (1 - d.cups / maxCups) * (chartH - chartPad * 2),
    ...d,
  }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaD = `M${points[0].x},${chartH} ` + points.map((p) => `L${p.x},${p.y}`).join(" ") + ` L${points[points.length - 1].x},${chartH} Z`;

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "3px 10px", borderRadius: "100px", marginBottom: "8px" }}>
            <Zap size={13} />
            LIVE POS & AI CASHIER DASHBOARD
          </div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: isMobile ? "22px" : "28px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
            Munajat Drinks Business Overview
          </h1>
          <p style={{ margin: 0, color: "var(--ph-text-muted)", fontSize: "13.5px" }}>
            Monitor real-time cashier transactions, branch outlet performance, Voice AI orders, and inventory movement.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: CARD,
            padding: "3px",
            borderRadius: "12px",
            border: `1px solid ${BORDER}`,
            height: "42px",
            boxSizing: "border-box"
          }}>
            {["All Time", "Today", "7 Days", "This Month"].map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                style={{
                  background: timeFilter === f ? "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)" : "transparent",
                  border: "none",
                  color: timeFilter === f ? "#ffffff" : "var(--ph-text-muted)",
                  padding: "0 14px",
                  height: "34px",
                  borderRadius: "9px",
                  fontSize: "12.5px",
                  fontWeight: timeFilter === f ? 700 : 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <Link href="/kasir-voice" style={{ textDecoration: "none", flexShrink: 0 }}>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 18px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "13px",
                whiteSpace: "nowrap",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(139,92,246,0.35)",
                transition: "all 0.2s ease"
              }}
            >
              <Sparkles size={15} />
              <span>Launch Voice Cashier</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "16px" }}>
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              style={{
                backgroundColor: CARD,
                borderRadius: "20px",
                padding: isMobile ? "16px" : "20px",
                border: `1px solid ${BORDER}`,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: stat.bg, boxShadow: stat.glow }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                  <Icon size={19} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: stat.up ? "#34d399" : "#f87171",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: stat.up ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                    padding: "3px 8px",
                    borderRadius: "100px",
                  }}
                >
                  {stat.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {stat.change}
                </div>
              </div>

              <div>
                <div style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
                  {stat.value}
                </div>
                <div style={{ color: "var(--ph-text-muted)", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
                  {stat.title}
                </div>
                <div style={{ color: "var(--ph-text-dim)", fontSize: "11px", marginTop: "4px" }}>
                  {stat.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Live Feed Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "2fr 1fr", gap: "20px" }}>

        {/* Real Hourly Sales Wave Chart */}
        <div style={{ backgroundColor: CARD, borderRadius: "24px", padding: "24px", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
                📈 Real-Time Sales Trends (Hourly)
              </h2>
              <span style={{ fontSize: "12px", color: "var(--ph-text-muted)" }}>Cup transaction volume aggregated from MySQL database</span>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#10b981" }}>
              Total: {totalCups} Cups
            </div>
          </div>

          {/* SVG Chart */}
          <div style={{ width: "100%", height: "200px", position: "relative" }}>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill="url(#chartGradient)" />
              <polyline fill="none" stroke="#10b981" strokeWidth="3" points={polyline} />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={p.cups > 0 ? 4 : 2} fill={p.cups > 0 ? "#10b981" : "#64748b"} stroke="#fff" strokeWidth="1.5" />
              ))}
            </svg>
          </div>

          {/* Timeline hours */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--ph-text-dim)", borderTop: `1px solid ${BORDER}`, paddingTop: "10px" }}>
            {HOURLY_SALES.filter((_, i) => i % 2 === 0).map((h, i) => (
              <span key={i}>{h.hour}</span>
            ))}
          </div>
        </div>

        {/* Real Branch Outlet Summary */}
        <div style={{ backgroundColor: CARD, borderRadius: "24px", padding: "24px", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
              🏪 Branch Outlet Performance
            </h2>
            <Link href="/admin/database/cabang" style={{ textDecoration: "none", fontSize: "12px", color: "#10b981", fontWeight: 700 }}>
              Manage Branches →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "240px", overflowY: "auto" }}>
            {dynamicOutlets.length === 0 ? (
              <EmptyState
                variant="compact"
                icon={Store}
                title="No branches available"
                description="No branch outlet records registered yet."
              />
            ) : (
              dynamicOutlets.map((outlet, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: "13.5px", color: "var(--ph-text)" }}>{outlet.name}</div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: outlet.status === "Open" ? "#34d399" : "#f87171" }}>
                      {outlet.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--ph-text-muted)" }}>
                    <span>{outlet.city} · {outlet.cups} Cups</span>
                    <span style={{ fontWeight: 800, color: "#10b981" }}>{fmt(outlet.rev)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Tables Grid: Top Drinks & Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "1.2fr 1.8fr", gap: "20px" }}>

        {/* Top Drinks Table */}
        <div style={{ backgroundColor: CARD, borderRadius: "24px", padding: "24px", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
              🏆 Top Selling Drinks
            </h2>
            <span style={{ fontSize: "12px", color: "var(--ph-text-muted)" }}>Ranked by actual orders</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {topDrinks.length === 0 ? (
              <EmptyState
                variant="compact"
                icon={Coffee}
                title="No beverage sales data"
                description="No beverage items ordered yet."
              />
            ) : (
              topDrinks.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                      {d.rank}
                    </div>
                    <span style={{ fontSize: "20px" }}>{d.emoji}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--ph-text)" }}>{d.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--ph-text-muted)" }}>{d.category} · {d.sold} Cups Sold</div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#10b981" }}>{fmt(d.rev)}</div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#0284c7" }}>{d.badge}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Live Table */}
        <div style={{ backgroundColor: CARD, borderRadius: "24px", padding: "24px", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
              🧾 Recent Transactions (Live)
            </h2>
            <Link href="/admin/database/order-codes" style={{ textDecoration: "none", fontSize: "12px", color: "#10b981", fontWeight: 700 }}>
              All Orders ({orders.length}) →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {allRecentOrders.length === 0 ? (
              <EmptyState
                variant="compact"
                icon={QrCode}
                title="No recent transactions"
                description="No order transactions recorded yet."
              />
            ) : (
              paginatedRecentOrders.map((ord, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <QrCode size={18} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--ph-text)" }}>{ord.customer}</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>({ord.code})</span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--ph-text-muted)" }}>{ord.branch} · {ord.items}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#10b981" }}>{fmt(ord.total)}</div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: ord.statusColor }}>{ord.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Elegant Pagination for Recent Orders */}
          <ElegantPagination
            currentPage={recentOrdersPage}
            totalItems={allRecentOrders.length}
            itemsPerPage={RECENT_PER_PAGE}
            onPageChange={setRecentOrdersPage}
            itemName="orders"
          />
        </div>

      </div>

    </div>
  );
}
