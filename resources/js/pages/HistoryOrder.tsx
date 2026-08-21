import React, { useState, useEffect } from "react";
import { CARD, BORDER } from "../theme";
import { Search, Filter, ChevronDown, Coffee, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { useBreakpoint } from "../hooks/use-breakpoint";
import { orderCodesApi } from "../services/api";
import EmptyState from "../components/EmptyState";
import ElegantPagination from "../components/ElegantPagination";

const statusStyle = (s: string) =>
  s === "Completed" ? { bg: "rgba(34,197,94,0.12)",  color: "#4ade80", border: "rgba(34,197,94,0.3)",  icon: CheckCircle2 }
: s === "Pending"   ? { bg: "rgba(234,179,8,0.12)",  color: "#facc15", border: "rgba(234,179,8,0.3)",  icon: Clock }
:                     { bg: "rgba(239,68,68,0.12)",   color: "#f87171", border: "rgba(239,68,68,0.3)",  icon: XCircle };

const initials = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0, 2);

const USER_COLORS = ["#8b5cf6", "#06b6d4", "#f97316", "#eab308", "#10b981", "#ec4899", "#6366f1", "#14b8a6", "#3b82f6"];

export default function HistoryOrder() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Completed" | "Pending" | "Cancelled">("All");
  const [search, setSearch] = useState("");
  const { isMobile } = useBreakpoint();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderCodesApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((o, idx) => {
          let statusLabel = "Completed";
          if (o.order_status === "cancelled") statusLabel = "Cancelled";
          else if (o.order_status === "in_queue" || o.order_status === "preparing") statusLabel = "Pending";
          else statusLabel = "Completed";

          const itemsList = Array.isArray(o.items_data) && o.items_data.length > 0
            ? o.items_data.map((i: any) => `${i.name} ×${i.qty || 1}`)
            : ["Es Kopi Susu Aren ×1"];

          return {
            id: o.order_code,
            customer: o.customer_name || "Customer",
            items: itemsList,
            total: "Rp " + Number(o.total_amount || 0).toLocaleString("id-ID"),
            rawTotal: Number(o.total_amount || 0),
            status: statusLabel,
            time: o.created_at ? new Date(o.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "12:00",
            date: o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "Today",
            color: USER_COLORS[idx % USER_COLORS.length],
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to load history orders", err);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const paginatedHistoryOrders = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalRevenue = orders.filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + (o.rawTotal || 0), 0);

  const SUMMARY = [
    { label: "Total Orders", value: orders.length.toString(), color: "#8b5cf6", icon: Coffee },
    { label: "Completed", value: orders.filter(o => o.status === "Completed").length.toString(), color: "#22c55e", icon: CheckCircle2 },
    { label: "Pending", value: orders.filter(o => o.status === "Pending").length.toString(), color: "#eab308", icon: Clock },
    { label: "Cancelled", value: orders.filter(o => o.status === "Cancelled").length.toString(), color: "#ef4444", icon: XCircle },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: isMobile ? "22px" : "28px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--ph-text)" }}>Order History</h1>
          <p style={{ margin: 0, color: "var(--ph-text-muted)", fontSize: "14px" }}>All recorded transactions in Munajat Drinks database</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "8px 14px" }}>
            <ChevronDown size={14} color="var(--ph-text-muted)" />
            <span style={{ fontSize: "13px", color: "var(--ph-text-muted)" }}>Today</span>
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", padding: "8px 14px", borderRadius: "10px" }}>
            Rp {totalRevenue.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? "10px" : "20px" }}>
        {SUMMARY.map((s, i) => (
          <div
            key={i}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: "16px",
              padding: isMobile ? "14px" : "20px",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "10px" : "16px",
            }}
          >
            <div
              style={{
                width: isMobile ? "38px" : "48px",
                height: isMobile ? "38px" : "48px",
                borderRadius: "12px",
                background: `${s.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <s.icon size={isMobile ? 18 : 22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: isMobile ? "11px" : "13px", color: "var(--ph-text-muted)" }}>{s.label}</div>
              <div style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: 700, color: "var(--ph-text)", marginTop: "2px" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {(["All", "Completed", "Pending", "Cancelled"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: `1px solid ${filter === f ? "#10b981" : BORDER}`,
                background: filter === f ? "rgba(16,185,129,0.15)" : CARD,
                color: filter === f ? "#34d399" : "var(--ph-text-muted)",
                fontSize: "13px",
                fontWeight: filter === f ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: isMobile ? "100%" : "260px" }}>
          <Search size={15} color="var(--ph-text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search order code or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 12px 8px 36px",
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: "10px",
              color: "var(--ph-text)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}`, color: "var(--ph-text-muted)", fontSize: "12px", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 20px" }}>Order ID</th>
                <th style={{ padding: "14px 20px" }}>Customer</th>
                <th style={{ padding: "14px 20px" }}>Menu Items</th>
                <th style={{ padding: "14px 20px" }}>Total</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState
                  variant="table-row"
                  colSpan={6}
                  icon={Coffee}
                  title="No order history found"
                  description="There are no transaction records matching your current filter criteria."
                />
              ) : (
                paginatedHistoryOrders.map((o) => {
                  const s = statusStyle(o.status);
                  const Icon = s.icon;
                  return (
                    <tr key={o.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "14px 20px", fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>
                        {o.id}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              background: o.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            {initials(o.customer)}
                          </div>
                          <span style={{ fontWeight: 600, color: "var(--ph-text)" }}>{o.customer}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", color: "var(--ph-text-muted)" }}>
                        {o.items.join(", ")}
                      </td>
                      <td style={{ padding: "14px 20px", fontWeight: 700, color: "#4ade80" }}>
                        {o.total}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 9px",
                            borderRadius: "100px",
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          <Icon size={12} />
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", color: "var(--ph-text-dim)", fontSize: "12px" }}>
                        {o.time} · {o.date}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Elegant Pagination */}
        <ElegantPagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="orders"
        />
      </div>
    </div>
  );
}
