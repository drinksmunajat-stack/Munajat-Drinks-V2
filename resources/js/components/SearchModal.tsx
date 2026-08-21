import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Search, X, ArrowRight, Coffee, Store, ShoppingCart,
  Layers, Sparkles, BarChart3, FileText, Settings, Users,
  CheckCircle2, Clock, MapPin, Zap, ChevronRight, Hash
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { productsApi, cabangsApi, orderCodesApi, toppingsApi } from "../services/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Menu" | "Branches" | "Orders" | "Toppings" | "Navigation";
  path: string;
  icon: any;
  iconBg: string;
  badge?: string;
}

const CATEGORY_TABS = ["All", "Menu", "Branches", "Orders", "Toppings", "Navigation"] as const;

export default function SearchModal({ open, onClose }: Props) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<typeof CATEGORY_TABS[number]>("All");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  // Dynamic entities from database
  const [products, setProducts] = useState<any[]>([]);
  const [cabangs, setCabangs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { colorMode, transparency } = useTheme();
  const dark = colorMode === "dark";

  // Load database items on mount
  useEffect(() => {
    Promise.all([
      productsApi.getAll(),
      cabangsApi.getAll(),
      orderCodesApi.getAll(),
      toppingsApi.getAll(),
    ]).then(([pRes, cRes, oRes, tRes]) => {
      if (pRes.success && Array.isArray(pRes.data)) setProducts(pRes.data);
      if (cRes.success && Array.isArray(cRes.data)) setCabangs(cRes.data);
      if (oRes.success && Array.isArray(oRes.data)) setOrders(oRes.data);
      if (tRes.success && Array.isArray(tRes.data)) setToppings(tRes.data);
    }).catch(err => {
      console.warn("Notice loading search index:", err);
    });
  }, []);

  // Open / Close animation handlers
  useEffect(() => {
    if (open) {
      setClosing(false);
      setMounted(true);
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 240);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Static System Navigations
  const systemNavigations: SearchResultItem[] = useMemo(() => [
    { id: "nav-dashboard", title: "Business Overview Dashboard", subtitle: "Real-time POS and business metrics", category: "Navigation", path: "/admin", icon: Zap, iconBg: "linear-gradient(135deg, #10b981, #06b6d4)", badge: "Overview" },
    { id: "nav-voice", title: "Launch AI Voice Cashier", subtitle: "Interactive live voice ordering terminal", category: "Navigation", path: "/kasir-voice", icon: Sparkles, iconBg: "linear-gradient(135deg, #8b5cf6, #06b6d4)", badge: "Voice POS" },
    { id: "nav-analytics", title: "Sales Intelligence & Analytics", subtitle: "Revenue charts, best sellers & AOV metrics", category: "Navigation", path: "/admin/analytics", icon: BarChart3, iconBg: "linear-gradient(135deg, #06b6d4, #3b82f6)", badge: "Analytics" },
    { id: "nav-reports", title: "Financial & Sales Reports", subtitle: "Exportable revenue statements and logs", category: "Navigation", path: "/admin/reports", icon: FileText, iconBg: "linear-gradient(135deg, #10b981, #059669)", badge: "Reports" },
    { id: "nav-ai-api", title: "AI API & LLM Configurations", subtitle: "OpenAI, Claude, and Gemini API keys", category: "Navigation", path: "/admin/ai-api", icon: Sparkles, iconBg: "linear-gradient(135deg, #8b5cf6, #ec4899)", badge: "AI Settings" },
    { id: "nav-users", title: "Staff & User Access Management", subtitle: "Super Admin, Store Managers & Baristas", category: "Navigation", path: "/admin/users", icon: Users, iconBg: "linear-gradient(135deg, #f59e0b, #d97706)", badge: "Staff" },
    { id: "nav-settings", title: "Workspace & Appearance Settings", subtitle: "Dark mode, themes & store preferences", category: "Navigation", path: "/admin/settings", icon: Settings, iconBg: "linear-gradient(135deg, #64748b, #475569)", badge: "System" },
  ], []);

  // Build unified search database index
  const allSearchItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. Products (Drinks)
    products.forEach(p => {
      items.push({
        id: `prod-${p.id}`,
        title: p.name,
        subtitle: `${p.category || 'Drink'} · Rp ${Number(p.price || 0).toLocaleString('id-ID')} · Stock: ${p.stock ?? 'Ready'}`,
        category: "Menu",
        path: "/admin/products",
        icon: Coffee,
        iconBg: "linear-gradient(135deg, #10b981, #059669)",
        badge: p.badge || "Menu"
      });
    });

    // 2. Branch Outlets
    cabangs.forEach(c => {
      items.push({
        id: `cab-${c.id}`,
        title: c.name,
        subtitle: `${c.city || 'Indonesia'} · ${c.address || 'Munajat Drinks Store'}`,
        category: "Branches",
        path: "/admin/cabangs",
        icon: Store,
        iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
        badge: c.is_active ? "Active" : "Closed"
      });
    });

    // 3. Orders & Queue
    orders.forEach(o => {
      const itemsDesc = Array.isArray(o.items_data) && o.items_data.length > 0
        ? o.items_data.map((i: any) => `${i.qty || 1}x ${i.name || 'Drink'}`).join(", ")
        : "Munajat Drink Order";
      items.push({
        id: `ord-${o.id}`,
        title: `${o.order_code || `#ORD-${o.id}`} - ${o.customer_name || 'Customer'}`,
        subtitle: `${itemsDesc} · Rp ${Number(o.total_amount || 0).toLocaleString('id-ID')}`,
        category: "Orders",
        path: "/admin/order-codes",
        icon: ShoppingCart,
        iconBg: "linear-gradient(135deg, #06b6d4, #3b82f6)",
        badge: o.order_status?.toUpperCase() || "ORDER"
      });
    });

    // 4. Toppings
    toppings.forEach(t => {
      items.push({
        id: `top-${t.id}`,
        title: t.name,
        subtitle: `Add-on Topping · +Rp ${Number(t.price || 0).toLocaleString('id-ID')} · ${t.category || 'Addon'}`,
        category: "Toppings",
        path: "/admin/toppings",
        icon: Layers,
        iconBg: "linear-gradient(135deg, #8b5cf6, #6366f1)",
        badge: "Topping"
      });
    });

    // 5. System Navigations
    systemNavigations.forEach(n => items.push(n));

    return items;
  }, [products, cabangs, orders, toppings, systemNavigations]);

  // Filter items based on activeTab and query
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allSearchItems.filter(item => {
      const matchesTab = activeTab === "All" || item.category === activeTab;
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    }).slice(0, 10);
  }, [allSearchItems, activeTab, query]);

  // Navigate to item
  const handleSelectItem = (item: SearchResultItem) => {
    onClose();
    setLocation(item.path);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1 < filteredResults.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelectItem(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, filteredResults, selectedIndex, onClose]);

  if (!mounted) return null;

  /* ── Design Tokens ── */
  const shellBg = dark
    ? transparency ? "rgba(13, 19, 44, 0.85)" : "#0d132c"
    : transparency ? "rgba(255, 255, 255, 0.92)" : "#ffffff";
  const inputBg = dark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";
  const textColor = dark ? "#ffffff" : "#0f172a";
  const mutedColor = dark ? "#94a3b8" : "#64748b";
  const borderColor = dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)";
  const blur = transparency ? "blur(32px) saturate(1.8)" : "none";

  const backdropAnim = closing
    ? "sm-backdrop-out 0.22s ease forwards"
    : "sm-backdrop-in  0.20s ease forwards";
  const cardAnim = closing
    ? "sm-card-out 0.20s cubic-bezier(0.4,0,1,1) forwards"
    : "sm-card-in  0.28s cubic-bezier(0.34,1.56,0.64,1) forwards";

  return (
    <>
      <style>{`
        @keyframes sm-backdrop-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sm-backdrop-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes sm-card-in  {
          from { opacity: 0; transform: translateY(-20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sm-card-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-12px) scale(0.97); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "10vh 16px 20px 16px",
          animation: backdropAnim,
        }}
      >
        {/* Modal Window */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "680px",
            background: shellBg,
            borderRadius: "24px",
            border: `1.5px solid ${borderColor}`,
            boxShadow: dark
              ? "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.15)"
              : "0 30px 80px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(16, 185, 129, 0.1)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            animation: cardAnim,
          }}
        >
          {/* Header Search Input */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "18px 22px",
            borderBottom: `1px solid ${borderColor}`,
            background: inputBg,
          }}>
            <Search size={22} color={focused ? "#10b981" : "#06b6d4"} style={{ flexShrink: 0, transition: "color 0.2s" }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search drinks, branch outlets, orders, toppings..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "16px",
                fontWeight: 600,
                color: textColor,
                letterSpacing: "-0.2px",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: mutedColor }}
              >
                <X size={18} />
              </button>
            )}
            <kbd
              onClick={onClose}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: `1px solid ${borderColor}`,
                color: mutedColor,
                cursor: "pointer"
              }}
            >
              ESC
            </kbd>
          </div>

          {/* Filter Category Pills */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            borderBottom: `1px solid ${borderColor}`,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}>
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIndex(0);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: "none",
                  background: activeTab === tab
                    ? "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
                    : dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
                  color: activeTab === tab ? "#ffffff" : mutedColor,
                  fontSize: "12.5px",
                  fontWeight: activeTab === tab ? 700 : 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                  boxShadow: activeTab === tab ? "0 4px 12px rgba(16, 185, 129, 0.25)" : "none"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Results List */}
          <div
            ref={listRef}
            style={{
              maxHeight: "380px",
              overflowY: "auto",
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {filteredResults.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: mutedColor }}>
                <Coffee size={36} style={{ opacity: 0.3, margin: "0 auto 10px auto" }} />
                <div style={{ fontWeight: 700, fontSize: "14px", color: textColor }}>No matching results found</div>
                <div style={{ fontSize: "12.5px", marginTop: "4px" }}>Try searching for a different drink, branch name, or order code.</div>
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const IconComponent = item.icon;
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 14px",
                      borderRadius: "14px",
                      backgroundColor: isSelected
                        ? dark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)"
                        : "transparent",
                      border: isSelected
                        ? "1px solid rgba(16, 185, 129, 0.3)"
                        : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)"
                    }}>
                      <IconComponent size={18} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, fontSize: "13.5px", color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span style={{
                            fontSize: "10.5px",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: "100px",
                            backgroundColor: "rgba(16, 185, 129, 0.12)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            flexShrink: 0
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: mutedColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "2px" }}>
                        {item.subtitle}
                      </div>
                    </div>

                    <ChevronRight size={16} color={isSelected ? "#10b981" : mutedColor} style={{ opacity: isSelected ? 1 : 0.4 }} />
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer Info */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            borderTop: `1px solid ${borderColor}`,
            fontSize: "11.5px",
            color: mutedColor,
            backgroundColor: inputBg,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span>Use <strong style={{ color: textColor }}>↑ ↓</strong> to navigate</span>
              <span><strong style={{ color: textColor }}>↵</strong> to select</span>
              <span><strong style={{ color: textColor }}>ESC</strong> to close</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10b981", fontWeight: 700 }}>
              <Zap size={13} />
              <span>Munajat Drinks System</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
