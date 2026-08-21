import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, BarChart3, Database, Users, Sparkles,
  Layers, Snowflake, QrCode, Store, Coffee, FileText,
  Settings, Bell, Menu, X, Sun, Moon, Search, LogOut,
  ChevronDown, ChevronRight, UserCheck, Shield
} from "lucide-react";
import { BG, CARD, BORDER, SIDEBAR_BG } from "../theme";
import { useBreakpoint } from "../hooks/use-breakpoint";
import { useTheme } from "../context/ThemeContext";
import AnimatedBackground from "./AnimatedBackground";
import FloatingParticles from "./FloatingParticles";
import SearchModal from "./SearchModal";
import ProfileModal from "./ProfileModal";
import PageTransition from "./PageTransition";
import NewOrderToast from "./NewOrderToast";
import { statsApi, StatsSummary } from "../services/api";

interface SubNavItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [databaseOpen, setDatabaseOpen] = useState(true);
  const [summaryData, setSummaryData] = useState<StatsSummary | null>(null);

  const { isMobile, isTablet } = useBreakpoint();
  const { colorMode, setColorMode, transparency } = useTheme();

  useEffect(() => {
    statsApi.getSummary().then(res => {
      if (res.success && res.data) {
        setSummaryData(res.data);
      }
    }).catch(() => {});
  }, []);

  const dark = colorMode === "dark";
  const sidebarWidth = isMobile ? 260 : isTablet ? 72 : 260;
  const showLabels = !isTablet || isMobile;

  const activeUser = summaryData?.user;
  const currentUserName = activeUser?.name || "Alex Chen";
  const currentUserRole = activeUser?.role || "Super Admin";
  const currentUserInitials = currentUserName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "AC";

  // Auto expand Database dropdown if current route is inside /admin/database or related
  useEffect(() => {
    if (location.includes("/database") || location.includes("/users")) {
      setDatabaseOpen(true);
    }
  }, [location]);

  // Dynamic Page Title and Document Title sync
  const getPageInfo = (path: string): { title: string; subtitle?: string; breadcrumbs: string[] } => {
    if (path === "/" || path.includes("/voice") || path.includes("/kasir-voice")) {
      return { title: "AI Voice Cashier", subtitle: "Voice Ordering Assistant", breadcrumbs: ["Munajat Drinks", "Voice Cashier"] };
    }
    if (path === "/login") {
      return { title: "Sign In", subtitle: "Access Admin Workspace", breadcrumbs: ["Munajat Drinks", "Login"] };
    }
    if (path === "/register") {
      return { title: "Create Account", subtitle: "Join Munajat Drinks", breadcrumbs: ["Munajat Drinks", "Register"] };
    }
    if (path === "/admin" || path === "/admin/dashboard") {
      return { title: "Dashboard", subtitle: "Real-time Sales & Operations Overview", breadcrumbs: ["Admin", "Dashboard"] };
    }
    if (path.includes("/analytics")) {
      return { title: "Analytics & Performance", subtitle: "Financial Charts & Growth Metrics", breadcrumbs: ["Admin", "Analytics"] };
    }
    if (path.includes("/products")) {
      return { title: "Product Catalog", subtitle: "Beverage Menus & Stock Management", breadcrumbs: ["Admin", "Products"] };
    }
    if (path.includes("/users")) {
      return { title: "Staff & Users Management", subtitle: "Manage Cashier & Administrator Roles", breadcrumbs: ["Admin", "Database", "Users"] };
    }
    if (path.includes("/toppings")) {
      return { title: "Toppings Management", subtitle: "Ingredients & Add-ons Inventory", breadcrumbs: ["Admin", "Database", "Toppings"] };
    }
    if (path.includes("/ice-levels")) {
      return { title: "Ice Level Presets", subtitle: "Chilled Ratios & Sweetness Presets", breadcrumbs: ["Admin", "Database", "Ice Levels"] };
    }
    if (path.includes("/order-codes")) {
      return { title: "Order Codes & POS", subtitle: "Brewing Pipeline & Live Receipts", breadcrumbs: ["Admin", "Database", "Order Codes"] };
    }
    if (path.includes("/cabang")) {
      return { title: "Branch Outlets", subtitle: "Physical Outlets & WhatsApp Channels", breadcrumbs: ["Admin", "Database", "Branches"] };
    }
    if (path.includes("/ai-api-settings") || path.includes("/ai-api")) {
      return { title: "AI API Settings", subtitle: "Gemini, OpenAI & Claude Voice Models", breadcrumbs: ["Admin", "AI API Settings"] };
    }
    if (path.includes("/reports")) {
      return { title: "Financial & Sales Reports", subtitle: "Audited Sales Summaries & COGS", breadcrumbs: ["Admin", "Reports"] };
    }
    if (path.includes("/settings")) {
      return { title: "System Settings", subtitle: "Brand Identity, Tax & Preferences", breadcrumbs: ["Admin", "Settings"] };
    }
    if (path.includes("/history")) {
      return { title: "Order History", subtitle: "Complete Transaction Archive", breadcrumbs: ["Admin", "History"] };
    }

    return { title: "Admin Workspace", subtitle: "Munajat Drinks Management", breadcrumbs: ["Admin"] };
  };

  const currentPageInfo = getPageInfo(location);

  // Sync document.title to current active page
  useEffect(() => {
    document.title = `${currentPageInfo.title} | Munajat Drinks`;
  }, [location, currentPageInfo.title]);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  const handleSignOut = () => {
    setSignOutModalOpen(true);
  };

  const databaseSubNav: SubNavItem[] = [
    { name: "Users", icon: Users, path: "/admin/database/users" },
    { name: "Toppings", icon: Layers, path: "/admin/database/toppings" },
    { name: "Ice Levels", icon: Snowflake, path: "/admin/database/ice-levels" },
    { name: "Order Codes", icon: QrCode, path: "/admin/database/order-codes" },
    { name: "Branches", icon: Store, path: "/admin/database/cabang" },
  ];

  const glassClass = transparency ? "ph-glass" : undefined;

  const isRouteActive = (path: string) => {
    if (path === "/admin") return location === "/admin" || location === "/admin/";
    return location === path || location.startsWith(path);
  };

  const isDatabaseActive = databaseSubNav.some((sub) => isRouteActive(sub.path));

  const SidebarContent = () => (
    <>
      {/* Logo Branding */}
      <div
        style={{
          padding: isTablet && !isMobile ? "24px 0" : "22px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: isTablet && !isMobile ? "center" : "flex-start",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/Logo Munajat Mocha.png"
            alt="Munajat Drinks Logo"
            style={{
              width: "38px",
              height: "38px",
              flexShrink: 0,
              borderRadius: "10px",
              objectFit: "contain",
              background: "rgba(255, 255, 255, 0.05)",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            }}
          />
          {showLabels && (
            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  whiteSpace: "nowrap",
                  color: "var(--ph-text)",
                  display: "block",
                  lineHeight: 1.1,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Munajat Drinks
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#10b981",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Admin Workspace
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav List */}
      <div
        style={{
          padding: isTablet && !isMobile ? "12px 6px" : "12px 10px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          overflowY: "auto",
        }}
      >
        {/* 1. Dashboard */}
        <Link href="/admin" style={{ textDecoration: "none" }} onClick={() => isMobile && setSidebarOpen(false)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isTablet && !isMobile ? "11px" : "10px 14px",
              justifyContent: isTablet && !isMobile ? "center" : "flex-start",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              background: isRouteActive("/admin")
                ? "linear-gradient(90deg, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.06) 100%)"
                : "transparent",
              color: isRouteActive("/admin") ? "var(--ph-text)" : "var(--ph-text-muted)",
              borderLeft: showLabels ? (isRouteActive("/admin") ? "3px solid #10b981" : "3px solid transparent") : "none",
            }}
          >
            <LayoutDashboard size={18} color={isRouteActive("/admin") ? "#10b981" : "var(--ph-text-muted)"} />
            {showLabels && <span style={{ fontWeight: isRouteActive("/admin") ? 700 : 500, fontSize: "13.5px" }}>Dashboard</span>}
          </div>
        </Link>

        {/* 2. Analytics */}
        <Link href="/admin/analytics" style={{ textDecoration: "none" }} onClick={() => isMobile && setSidebarOpen(false)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isTablet && !isMobile ? "11px" : "10px 14px",
              justifyContent: isTablet && !isMobile ? "center" : "flex-start",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              background: isRouteActive("/admin/analytics")
                ? "linear-gradient(90deg, rgba(16,185,129,0.18) 0%, transparent 100%)"
                : "transparent",
              color: isRouteActive("/admin/analytics") ? "var(--ph-text)" : "var(--ph-text-muted)",
              borderLeft: showLabels ? (isRouteActive("/admin/analytics") ? "3px solid #10b981" : "3px solid transparent") : "none",
            }}
          >
            <BarChart3 size={18} color={isRouteActive("/admin/analytics") ? "#10b981" : "var(--ph-text-muted)"} />
            {showLabels && <span style={{ fontWeight: isRouteActive("/admin/analytics") ? 700 : 500, fontSize: "13.5px" }}>Analytics</span>}
          </div>
        </Link>

        {/* 3. Menu Product */}
        <Link href="/admin/products" style={{ textDecoration: "none" }} onClick={() => isMobile && setSidebarOpen(false)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isTablet && !isMobile ? "11px" : "10px 14px",
              justifyContent: isTablet && !isMobile ? "center" : "flex-start",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              background: isRouteActive("/admin/products")
                ? "linear-gradient(90deg, rgba(16,185,129,0.18) 0%, transparent 100%)"
                : "transparent",
              color: isRouteActive("/admin/products") ? "var(--ph-text)" : "var(--ph-text-muted)",
              borderLeft: showLabels ? (isRouteActive("/admin/products") ? "3px solid #10b981" : "3px solid transparent") : "none",
            }}
          >
            <Coffee size={18} color={isRouteActive("/admin/products") ? "#10b981" : "var(--ph-text-muted)"} />
            {showLabels && <span style={{ fontWeight: isRouteActive("/admin/products") ? 700 : 500, fontSize: "13.5px" }}>Product</span>}
          </div>
        </Link>

        {/* 4. Menu Database Dropdown */}
        <div>
          <div
            onClick={() => setDatabaseOpen(!databaseOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isTablet && !isMobile ? "11px" : "10px 14px",
              justifyContent: isTablet && !isMobile ? "center" : "space-between",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: isDatabaseActive ? "rgba(255,255,255,0.03)" : "transparent",
              color: isDatabaseActive ? "var(--ph-text)" : "var(--ph-text-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Database size={18} color={isDatabaseActive ? "#06b6d4" : "var(--ph-text-muted)"} />
              {showLabels && <span style={{ fontWeight: 600, fontSize: "13.5px" }}>Database</span>}
            </div>
            {showLabels && (
              <div style={{ color: "var(--ph-text-dim)" }}>
                {databaseOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </div>
            )}
          </div>

          {/* Sub-items */}
          {databaseOpen && showLabels && (
            <div
              style={{
                marginLeft: "18px",
                paddingLeft: "12px",
                borderLeft: `1px solid ${BORDER}`,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                marginTop: "2px",
                marginBottom: "4px",
              }}
            >
              {databaseSubNav.map((sub) => {
                const isSubActive = isRouteActive(sub.path);
                const SubIcon = sub.icon;
                return (
                  <Link key={sub.name} href={sub.path} style={{ textDecoration: "none" }} onClick={() => isMobile && setSidebarOpen(false)}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.18s",
                        background: isSubActive ? "rgba(6,182,212,0.15)" : "transparent",
                        color: isSubActive ? "#38bdf8" : "var(--ph-text-muted)",
                        fontWeight: isSubActive ? 700 : 500,
                        fontSize: "12.5px",
                      }}
                    >
                      <SubIcon size={14} color={isSubActive ? "#38bdf8" : "var(--ph-text-muted)"} />
                      <span>{sub.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. AI API Settings */}
        <Link href="/admin/ai-api" style={{ textDecoration: "none" }} onClick={() => isMobile && setSidebarOpen(false)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isTablet && !isMobile ? "11px" : "10px 14px",
              justifyContent: isTablet && !isMobile ? "center" : "flex-start",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              background: isRouteActive("/admin/ai-api")
                ? "linear-gradient(90deg, rgba(6,182,212,0.18) 0%, rgba(139,92,246,0.08) 100%)"
                : "transparent",
              color: isRouteActive("/admin/ai-api") ? "var(--ph-text)" : "var(--ph-text-muted)",
              borderLeft: showLabels ? (isRouteActive("/admin/ai-api") ? "3px solid #06b6d4" : "3px solid transparent") : "none",
            }}
          >
            <Sparkles size={18} color={isRouteActive("/admin/ai-api") ? "#06b6d4" : "var(--ph-text-muted)"} />
            {showLabels && <span style={{ fontWeight: isRouteActive("/admin/ai-api") ? 700 : 500, fontSize: "13.5px" }}>AI API Settings</span>}
            {showLabels && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "100px",
                  background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                  color: "#fff",
                }}
              >
                AI
              </span>
            )}
          </div>
        </Link>

        {/* 6. Reports */}
        <Link href="/admin/reports" style={{ textDecoration: "none" }} onClick={() => isMobile && setSidebarOpen(false)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isTablet && !isMobile ? "11px" : "10px 14px",
              justifyContent: isTablet && !isMobile ? "center" : "flex-start",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: isRouteActive("/admin/reports")
                ? "linear-gradient(90deg, rgba(16,185,129,0.18) 0%, transparent 100%)"
                : "transparent",
              color: isRouteActive("/admin/reports") ? "var(--ph-text)" : "var(--ph-text-muted)",
              borderLeft: showLabels ? (isRouteActive("/admin/reports") ? "3px solid #10b981" : "3px solid transparent") : "none",
            }}
          >
            <FileText size={18} color={isRouteActive("/admin/reports") ? "#10b981" : "var(--ph-text-muted)"} />
            {showLabels && <span style={{ fontWeight: isRouteActive("/admin/reports") ? 700 : 500, fontSize: "13.5px" }}>Reports</span>}
          </div>
        </Link>

        {/* 7. Settings */}
        <Link href="/admin/settings" style={{ textDecoration: "none" }} onClick={() => isMobile && setSidebarOpen(false)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isTablet && !isMobile ? "11px" : "10px 14px",
              justifyContent: isTablet && !isMobile ? "center" : "flex-start",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: isRouteActive("/admin/settings")
                ? "linear-gradient(90deg, rgba(16,185,129,0.18) 0%, transparent 100%)"
                : "transparent",
              color: isRouteActive("/admin/settings") ? "var(--ph-text)" : "var(--ph-text-muted)",
              borderLeft: showLabels ? (isRouteActive("/admin/settings") ? "3px solid #10b981" : "3px solid transparent") : "none",
            }}
          >
            <Settings size={18} color={isRouteActive("/admin/settings") ? "#10b981" : "var(--ph-text-muted)"} />
            {showLabels && <span style={{ fontWeight: isRouteActive("/admin/settings") ? 700 : 500, fontSize: "13.5px" }}>Settings</span>}
          </div>
        </Link>
      </div>

      {/* Profile Akun & Sign Out Button (Replacing Pro Plan Card) */}
      {showLabels && (
        <div style={{ padding: "14px", borderTop: `1px solid ${BORDER}` }}>
          <div
            style={{
              padding: "14px",
              borderRadius: "16px",
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow accent */}
            <div
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                width: "50px",
                height: "50px",
                background: "#10b981",
                filter: "blur(35px)",
                opacity: 0.3,
              }}
            />

            {/* Profile Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: activeUser?.avatar_color ? `linear-gradient(135deg, ${activeUser.avatar_color} 0%, #06b6d4 100%)` : "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#ffffff",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
                }}
              >
                {currentUserInitials}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "var(--ph-text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUserName}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#10b981",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Shield size={11} />
                  <span>{currentUserRole}</span>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                background: "rgba(239, 68, 68, 0.08)",
                color: "#f87171",
                fontWeight: 700,
                fontSize: "12.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        color: "var(--ph-text)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AnimatedBackground />
      <FloatingParticles />

      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>
        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 40,
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* Sidebar */}
        {isMobile ? (
          <div
            className={glassClass}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              width: "260px",
              backgroundColor: SIDEBAR_BG,
              borderRight: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
              zIndex: 50,
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                color: "var(--ph-text-muted)",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        ) : (
          <div
            className={glassClass}
            style={{
              width: `${sidebarWidth}px`,
              flexShrink: 0,
              backgroundColor: SIDEBAR_BG,
              borderRight: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SidebarContent />
          </div>
        )}

        {/* Main Header & Page Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Header */}
          <div
            className={glassClass}
            style={{
              height: "68px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              backgroundColor: BG,
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--ph-text-muted)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Menu size={22} />
                </button>
              )}
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "0" : "10px",
                  padding: isMobile ? "10px" : "8px 16px",
                  borderRadius: "100px",
                  backgroundColor: CARD,
                  border: `1px solid ${BORDER}`,
                  color: "var(--ph-text-muted)",
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "all 0.2s ease",
                  width: isMobile ? "40px" : isTablet ? "220px" : "300px",
                  maxWidth: "100%",
                  justifyContent: isMobile ? "center" : "flex-start",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <Search size={16} style={{ flexShrink: 0 }} />
                {!isMobile && (
                  <span style={{
                    flex: 1,
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "12.5px"
                  }}>
                    Search menu, orders, outlets…
                  </span>
                )}
                {!isMobile && (
                  <kbd
                    style={{
                      padding: "2px 6px",
                      borderRadius: "5px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: `1px solid ${BORDER}`,
                      color: "var(--ph-text-dim)",
                      flexShrink: 0
                    }}
                  >
                    ⌘K
                  </kbd>
                )}
              </button>

              {/* Active Page Indicator */}
              {!isMobile && !isTablet && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--ph-text-muted)", paddingLeft: "8px", borderLeft: `1px solid ${BORDER}` }}>
                  {currentPageInfo.breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb}>
                      <span style={{ fontWeight: idx === currentPageInfo.breadcrumbs.length - 1 ? 700 : 500, color: idx === currentPageInfo.breadcrumbs.length - 1 ? "var(--ph-text)" : "var(--ph-text-dim)" }}>
                        {crumb}
                      </span>
                      {idx < currentPageInfo.breadcrumbs.length - 1 && <span style={{ opacity: 0.35 }}>/</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "16px" }}>
              {/* Dark / Light switch */}
              <button
                onClick={() => setColorMode(dark ? "light" : "dark")}
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--ph-text-muted)",
                }}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Notification */}
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Bell size={20} color="var(--ph-text-muted)" />
                <div
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#10b981",
                    borderRadius: "50%",
                    border: `2px solid ${BG}`,
                  }}
                />
              </div>

              {/* Top Right User Profile pill */}
              <div
                onClick={() => setProfileOpen((v) => !v)}
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              >
                {!isMobile && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--ph-text)" }}>{currentUserName}</div>
                    <div style={{ fontSize: "11.5px", color: "#10b981", fontWeight: 600 }}>{currentUserRole}</div>
                  </div>
                )}
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    background: activeUser?.avatar_color ? `linear-gradient(135deg, ${activeUser.avatar_color} 0%, #06b6d4 100%)` : "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "white",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
                  }}
                >
                  {currentUserInitials}
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "28px 32px 32px 32px", position: "relative" }}>
            <PageTransition locationKey={location}>{children}</PageTransition>
          </div>
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSignOut={() => setSignOutModalOpen(true)}
      />
      <NewOrderToast />

      {/* Sign Out Confirmation Modal Popup */}
      {signOutModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "24px",
            backgroundColor: "var(--ph-card)",
            border: `1.5px solid ${BORDER}`,
            padding: "28px 24px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "14px"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444"
            }}>
              <LogOut size={26} />
            </div>

            <div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 800, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
                Sign Out Confirmation
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ph-text-muted)", lineHeight: 1.5 }}>
                Are you sure you want to sign out of the Munajat Drinks Admin Workspace? You will need to log in again to access the admin portal.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "8px" }}>
              <button
                onClick={() => setSignOutModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "12px",
                  border: `1px solid ${BORDER}`,
                  backgroundColor: "transparent",
                  color: "var(--ph-text)",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSignOutModalOpen(false);
                  setLocation("/login");
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)"
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
