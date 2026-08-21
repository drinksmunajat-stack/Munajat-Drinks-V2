import React, { useState, useEffect } from "react";
import { CARD, BORDER } from "../theme";
import {
  Shield, Bell, CreditCard, User, Mail, Smartphone, FileText,
  Palette, Monitor, Zap, CheckCircle2, AlertCircle, KeyRound,
  Lock, RefreshCw, Plus, Download, Trash2, Eye, ExternalLink,
  Building2, Phone, Sparkles, Check, Clock, Laptop, ShieldCheck,
  ChevronRight, X, Loader2
} from "lucide-react";
import { useBreakpoint } from "../hooks/use-breakpoint";
import { useTheme } from "../context/ThemeContext";
import { settingsApi, invoicesApi, AppSettingsData, UserProfileData, BillingInvoiceItem } from "../services/api";
import EmptyState from "../components/EmptyState";

function Toggle({ on, onToggle, disabled = false }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      style={{
        width: "44px",
        height: "26px",
        flexShrink: 0,
        background: on ? "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)" : "rgba(255,255,255,0.12)",
        borderRadius: "13px",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.3s ease",
        opacity: disabled ? 0.6 : 1,
        boxShadow: on ? "0 0 12px rgba(16,185,129,0.35)" : "none"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: on ? "21px" : "3px",
          width: "20px",
          height: "20px",
          background: "white",
          borderRadius: "50%",
          transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
        }}
      />
    </div>
  );
}

const fmt = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "appearance" | "security" | "billing">("profile");
  const { isMobile } = useBreakpoint();
  const { bgMode, setBgMode, transparency, setTransparency, colorMode, setColorMode } = useTheme();

  // Loading & Toast States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Settings & Profile DB Data
  const [settingsData, setSettingsData] = useState<AppSettingsData>({
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    bg_mode: "animated",
    transparency: true,
    color_mode: "dark",
    two_factor_enabled: false,
    session_timeout: 60,
    auth_security_level: "Enhanced (256-bit SSL)",
    plan_name: "Enterprise POS & Voice AI Pro",
    plan_billing_cycle: "Monthly",
    plan_price: 299000,
    plan_status: "Active",
    payment_gateway: "QRIS & Midtrans Automated",
    merchant_id: "MD-QRIS-2026-X88",
    billing_email: "finance@munajatdrinks.com",
  });

  const [profileData, setProfileData] = useState<UserProfileData>({
    name: "Alex Chen",
    first_name: "Alex",
    last_name: "Chen",
    email: "alex@munajatdrinks.com",
    phone: "+62 812-3456-7890",
    role: "Super Admin",
    branch: "Pusat (Semua Cabang)",
    avatar_color: "#10b981",
    avatar: "",
  });

  // Security Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Invoices DB Data
  const [invoices, setInvoices] = useState<BillingInvoiceItem[]>([]);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoiceItem | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: `INV-2026-08-${Math.floor(100 + Math.random() * 900)}`,
    plan_name: "Enterprise POS & Voice AI Pro (Monthly)",
    amount: 299000,
    payment_method: "QRIS",
    status: "paid" as const,
    billing_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Load Settings, Profile, and Invoices from Database
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [settingsRes, invoicesRes] = await Promise.all([
        settingsApi.get(),
        invoicesApi.getAll().catch(() => ({ success: true, data: [] }))
      ]);

      if (settingsRes.success && settingsRes.data) {
        const { settings, profile } = settingsRes.data;
        if (settings) {
          setSettingsData(settings);
          // Sync Theme Context with DB if needed
          if (settings.bg_mode) setBgMode(settings.bg_mode);
          if (typeof settings.transparency === "boolean") setTransparency(settings.transparency);
          if (settings.color_mode) setColorMode(settings.color_mode);
        }
        if (profile) {
          setProfileData(profile);
        }
      }

      if (invoicesRes.success && Array.isArray(invoicesRes.data)) {
        setInvoices(invoicesRes.data);
      }
    } catch (err: any) {
      console.error("Failed to load settings data:", err);
      showToast("Gagal memuat pengaturan: " + (err.message || "Error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 1. Save Profile Changes to DB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsApi.updateProfile({
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        branch: profileData.branch,
        avatar_color: profileData.avatar_color,
        avatar: profileData.avatar,
      });

      if (res.success) {
        showToast("Profil berhasil diperbarui dan disimpan ke database!");
      }
    } catch (err: any) {
      showToast("Gagal menyimpan profil: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // 2. Save Notification Preferences to DB
  const handleToggleNotification = async (key: keyof AppSettingsData, value: boolean) => {
    const updated = { ...settingsData, [key]: value };
    setSettingsData(updated);
    try {
      await settingsApi.update({ [key]: value });
      showToast(`Preferensi notifikasi disimpan.`);
    } catch (err: any) {
      showToast("Gagal menyimpan preferensi: " + err.message, "error");
    }
  };

  // 3. Save Appearance Preferences to DB
  const handleUpdateAppearance = async (key: string, value: any) => {
    if (key === "bg_mode") {
      setBgMode(value);
      setSettingsData(prev => ({ ...prev, bg_mode: value }));
    } else if (key === "transparency") {
      setTransparency(value);
      setSettingsData(prev => ({ ...prev, transparency: value }));
    } else if (key === "color_mode") {
      setColorMode(value);
      setSettingsData(prev => ({ ...prev, color_mode: value }));
    }

    try {
      await settingsApi.update({ [key]: value });
      showToast("Tema tampilan disimpan ke database.");
    } catch (err: any) {
      console.warn("Appearance update notice:", err);
    }
  };

  // 4. Save Security / Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Password baru dan konfirmasi password tidak cocok!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password baru minimal 6 karakter!", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await settingsApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (res.success) {
        showToast("Password akun berhasil diubah dan diperbarui di database!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      showToast("Gagal mengubah password: " + err.message, "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // 5. Toggle 2FA
  const handleToggle2FA = async () => {
    const nextVal = !settingsData.two_factor_enabled;
    setSettingsData(prev => ({ ...prev, two_factor_enabled: nextVal }));
    try {
      await settingsApi.update({ two_factor_enabled: nextVal });
      showToast(`Two-Factor Authentication ${nextVal ? "diaktifkan" : "dinonaktifkan"}.`);
    } catch (err: any) {
      showToast("Gagal memperbarui 2FA: " + err.message, "error");
    }
  };

  // 6. Update Session Timeout
  const handleChangeSessionTimeout = async (timeout: number) => {
    setSettingsData(prev => ({ ...prev, session_timeout: timeout }));
    try {
      await settingsApi.update({ session_timeout: timeout });
      showToast(`Session timeout diubah menjadi ${timeout} menit.`);
    } catch (err: any) {
      showToast("Gagal memperbarui session timeout: " + err.message, "error");
    }
  };

  // 7. Invoices CRUD
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await invoicesApi.create(invoiceForm);
      if (res.success && res.data) {
        setInvoices([res.data, ...invoices]);
        setInvoiceModalOpen(false);
        showToast("Faktur tagihan baru berhasil disimpan ke database!");
        setInvoiceForm({
          invoice_number: `INV-2026-08-${Math.floor(100 + Math.random() * 900)}`,
          plan_name: "Enterprise POS & Voice AI Pro (Monthly)",
          amount: 299000,
          payment_method: "QRIS",
          status: "paid",
          billing_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        });
      }
    } catch (err: any) {
      showToast("Gagal membuat invoice: " + err.message, "error");
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!window.confirm("Hapus catatan faktur ini dari database?")) return;
    try {
      await invoicesApi.delete(id);
      setInvoices(invoices.filter(i => i.id !== id));
      showToast("Faktur berhasil dihapus dari database.");
    } catch (err: any) {
      showToast("Gagal menghapus faktur: " + err.message, "error");
    }
  };

  const TABS = [
    { icon: User,       id: "profile",       label: "Profile" },
    { icon: Bell,       id: "notifications", label: "Notifications" },
    { icon: Palette,    id: "appearance",    label: "Appearance" },
    { icon: Shield,     id: "security",      label: "Security" },
    { icon: CreditCard, id: "billing",       label: "Billing & Plans" },
  ] as const;

  const initials = `${(profileData.first_name || "A")[0] || ""}${(profileData.last_name || "C")[0] || ""}`.toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "980px", margin: "0 auto" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 20px",
          borderRadius: "14px",
          backgroundColor: toastMessage.type === "success" ? "rgba(16, 185, 129, 0.95)" : "rgba(239, 68, 68, 0.95)",
          color: "#ffffff",
          fontSize: "13.5px",
          fontWeight: 600,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          backdropFilter: "blur(10px)",
          animation: "slideInRight 0.3s ease"
        }}>
          {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: isMobile ? "22px" : "28px", fontWeight: 800, letterSpacing: "-0.6px", color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
            Settings & Preferences
          </h1>
          <p style={{ margin: 0, color: "var(--ph-text-muted)", fontSize: "14px" }}>
            Kelola profil pengguna, notifikasi, tema tampilan, keamanan akun, dan billing tersimpan langsung di database.
          </p>
        </div>
        <button
          onClick={loadAllData}
          title="Reload from Database"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "10px",
            border: `1px solid ${BORDER}`,
            background: "rgba(255,255,255,0.04)",
            color: "var(--ph-text-muted)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Sync Database</span>
        </button>
      </div>

      <div style={{ display: "flex", gap: "24px", flexDirection: isMobile ? "column" : "row" }}>
        {/* Sidebar Nav */}
        <div style={{ width: isMobile ? "100%" : "220px", flexShrink: 0, display: "flex", flexDirection: isMobile ? "row" : "column", gap: "4px", overflowX: isMobile ? "auto" : "visible" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "none",
                background: activeTab === tab.id ? "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.1) 100%)" : "transparent",
                color: activeTab === tab.id ? "#10b981" : "var(--ph-text-muted)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: activeTab === tab.id ? 700 : 500,
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: activeTab === tab.id ? "inset 0 0 0 1px rgba(16,185,129,0.3)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <tab.icon size={17} color={activeTab === tab.id ? "#10b981" : "var(--ph-text-muted)"} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>

          {/* ══════════════════ 1. PROFILE TAB ══════════════════ */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>Profile Information</h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ph-text-muted)" }}>Update your account details and contact information</p>
                  </div>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "4px 12px", borderRadius: "100px", border: "1px solid rgba(16,185,129,0.25)" }}>
                    {profileData.role || "Super Admin"}
                  </span>
                </div>

                {/* Avatar & Color Picker */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", flexWrap: "wrap" }}>
                  <div style={{
                    width: "76px",
                    height: "76px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: profileData.avatar ? `url(${profileData.avatar}) center/cover no-repeat` : (profileData.avatar_color || "#10b981"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "white",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
                    border: "2px solid rgba(255,255,255,0.2)"
                  }}>
                    {!profileData.avatar && initials}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ph-text)", marginBottom: "6px" }}>Avatar Accent Color</div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                      {["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"].map(c => (
                        <div
                          key={c}
                          onClick={() => setProfileData({ ...profileData, avatar_color: c })}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: c,
                            cursor: "pointer",
                            border: profileData.avatar_color === c ? "2px solid #ffffff" : "2px solid transparent",
                            boxShadow: profileData.avatar_color === c ? "0 0 8px " + c : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {profileData.avatar_color === c && <Check size={12} color="white" />}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--ph-text-muted)" }}>Pilih warna avatar badge akun Anda di sistem</div>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 600 }}>First Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.first_name || ""}
                      onChange={e => setProfileData({ ...profileData, first_name: e.target.value })}
                      style={{ padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--ph-input-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 600 }}>Last Name</label>
                    <input
                      type="text"
                      value={profileData.last_name || ""}
                      onChange={e => setProfileData({ ...profileData, last_name: e.target.value })}
                      style={{ padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--ph-input-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 600 }}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileData.email || ""}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                      style={{ padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--ph-input-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 600 }}>Phone Number</label>
                    <input
                      type="text"
                      value={profileData.phone || ""}
                      onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                      style={{ padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--ph-input-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
                  <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 600 }}>Assigned Branch / Location</label>
                  <select
                    value={profileData.branch || "Pusat (Semua Cabang)"}
                    onChange={e => setProfileData({ ...profileData, branch: e.target.value })}
                    style={{ padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--ph-input-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                  >
                    <option value="Pusat (Semua Cabang)">Pusat (Semua Cabang)</option>
                    <option value="Grand Indonesia (Pusat)">Munajat Drinks - Grand Indonesia (Pusat)</option>
                    <option value="Sudirman Hub">Munajat Drinks - Sudirman Hub</option>
                    <option value="Tebet Eco Park">Munajat Drinks - Tebet Eco Park</option>
                    <option value="Dago Heritage Bandung">Munajat Drinks - Dago Heritage Bandung</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                    border: "none",
                    color: "white",
                    padding: "11px 28px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 6px 18px rgba(16,185,129,0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>{saving ? "Menyimpan ke Database..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════ 2. NOTIFICATIONS TAB ══════════════════ */}
          {activeTab === "notifications" && (
            <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>Notification Preferences</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ph-text-muted)" }}>Pilih saluran pemberitahuan transaksi, ringkasan mingguan, dan peringatan stok</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {[
                  {
                    icon: Mail,
                    key: "email_notifications" as const,
                    label: "Email Notifications",
                    desc: "Receive daily order summary and transaction receipts in your inbox.",
                    state: settingsData.email_notifications
                  },
                  {
                    icon: Smartphone,
                    key: "push_notifications" as const,
                    label: "Push Notifications",
                    desc: "Get alerted directly on device when voice cashier receives large orders.",
                    state: settingsData.push_notifications
                  },
                  {
                    icon: FileText,
                    key: "weekly_digest" as const,
                    label: "Weekly Digest & Stock Alert",
                    desc: "A comprehensive weekly report on gross revenue and low topping stock.",
                    state: settingsData.weekly_digest
                  },
                ].map((item, i, arr) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: i < arr.length - 1 ? "18px" : "0",
                      borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
                      gap: "14px"
                    }}
                  >
                    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                      <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", color: "#10b981", flexShrink: 0 }}>
                        <item.icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ph-text)", marginBottom: "3px" }}>{item.label}</div>
                        <div style={{ fontSize: "13px", color: "var(--ph-text-muted)", lineHeight: 1.4 }}>{item.desc}</div>
                      </div>
                    </div>
                    <Toggle on={item.state} onToggle={() => handleToggleNotification(item.key, !item.state)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════ 3. APPEARANCE TAB ══════════════════ */}
          {activeTab === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Background Mode */}
              <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <Zap size={18} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>Animated Background</h3>
                </div>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--ph-text-muted)", lineHeight: 1.5 }}>
                  Choose between a dynamic animated gradient or a clean static background.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                  {[
                    { id: "animated", label: "Animated", desc: "Colorful moving blobs, like Windows Fluent Design", icon: "✦" },
                    { id: "static",   label: "Static",   desc: "Clean solid background, zero distraction", icon: "◼" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleUpdateAppearance("bg_mode", opt.id)}
                      style={{
                        padding: "18px", borderRadius: "14px", cursor: "pointer",
                        border: bgMode === opt.id ? "2px solid #10b981" : `1px solid ${BORDER}`,
                        background: bgMode === opt.id ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                        textAlign: "left", transition: "all 0.2s",
                        boxShadow: bgMode === opt.id ? "0 0 0 3px rgba(16,185,129,0.15)" : "none",
                      }}
                    >
                      <div style={{ fontSize: "22px", marginBottom: "8px", color: "#10b981" }}>{opt.icon}</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: bgMode === opt.id ? "#10b981" : "var(--ph-text)", marginBottom: "4px" }}>{opt.label}</div>
                      <div style={{ fontSize: "12px", color: "var(--ph-text-muted)", lineHeight: 1.4 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transparency Effect */}
              <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <Monitor size={18} color="#06b6d4" />
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>Transparency Effect</h3>
                </div>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--ph-text-muted)", lineHeight: 1.5 }}>
                  Windows-style acrylic blur — sidebar, header, and cards become semi-transparent, letting the background breathe through.
                </p>

                <div style={{
                  height: "80px", borderRadius: "12px", marginBottom: "20px",
                  background: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: "10px", borderRadius: "8px",
                    background: transparency ? "rgba(7,13,31,0.45)" : "rgba(7,13,31,0.92)",
                    backdropFilter: transparency ? "blur(20px)" : "none",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.4s ease",
                  }}>
                    <span style={{ fontSize: "13px", color: "white", fontWeight: 700 }}>
                      {transparency ? "✦ Acrylic Glass Active" : "◼ Solid — no blur"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ph-text)", marginBottom: "4px" }}>
                      Acrylic / Glass Blur
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--ph-text-muted)" }}>
                      {transparency ? "On — background blurs through panels" : "Off — panels are solid"}
                    </div>
                  </div>
                  <Toggle on={transparency} onToggle={() => handleUpdateAppearance("transparency", !transparency)} />
                </div>
              </div>

              {/* Color Mode */}
              <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <Palette size={18} color="#8b5cf6" />
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>Color Mode</h3>
                </div>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--ph-text-muted)", lineHeight: 1.5 }}>
                  Switch between deep navy dark theme and crisp daylight theme.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                  {[
                    { id: "dark",  label: "Dark",  desc: "Deep navy — easy on the eyes", preview: "linear-gradient(135deg, #070d1f 0%, #0f172a 100%)" },
                    { id: "light", label: "Light", desc: "Crisp white — clean daytime view", preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleUpdateAppearance("color_mode", opt.id)}
                      style={{
                        padding: "0", borderRadius: "14px", cursor: "pointer", overflow: "hidden",
                        border: colorMode === opt.id ? "2px solid #10b981" : `1px solid ${BORDER}`,
                        background: "transparent", textAlign: "left", transition: "all 0.2s",
                        boxShadow: colorMode === opt.id ? "0 0 0 3px rgba(16,185,129,0.15)" : "none",
                      }}
                    >
                      <div style={{ height: "55px", background: opt.preview, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        {["◼", "◼", "◼"].map((_, i) => (
                          <div key={i} style={{ width: "28px", height: "18px", borderRadius: "4px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />
                        ))}
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: colorMode === opt.id ? "#10b981" : "var(--ph-text)", marginBottom: "3px" }}>{opt.label}</div>
                        <div style={{ fontSize: "12px", color: "var(--ph-text-muted)" }}>{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ 4. SECURITY TAB ══════════════════ */}
          {activeTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Change Password Form */}
              <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <KeyRound size={18} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>Change Password</h3>
                </div>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--ph-text-muted)" }}>
                  Update your master password used for admin portal login and authorization
                </p>

                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 600 }}>Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      style={{ padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--ph-input-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 600 }}>New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Min. 6 characters"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={{ padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--ph-input-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 600 }}>Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={{ padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--ph-input-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "6px" }}>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                        border: "none",
                        color: "white",
                        padding: "11px 24px",
                        borderRadius: "10px",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        cursor: passwordLoading ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
                      <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Two-Factor Authentication & Session Timeout */}
              <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "18px", borderBottom: `1px solid ${BORDER}` }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--ph-text)", marginBottom: "4px" }}>
                      Two-Factor Authentication (2FA)
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--ph-text-muted)" }}>
                      Tambahkan lapisan keamanan ekstra dengan kode OTP saat login kasir atau dashboard
                    </div>
                  </div>
                  <Toggle on={settingsData.two_factor_enabled} onToggle={handleToggle2FA} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "18px" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--ph-text)", marginBottom: "4px" }}>
                      Session Idle Timeout
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--ph-text-muted)" }}>
                      Kunci layar POS & Admin secara otomatis saat tidak ada aktivitas transaksi
                    </div>
                  </div>
                  <select
                    value={settingsData.session_timeout}
                    onChange={e => handleChangeSessionTimeout(Number(e.target.value))}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      backgroundColor: "var(--ph-input-bg)",
                      border: `1px solid ${BORDER}`,
                      color: "var(--ph-text)",
                      fontSize: "13px",
                      fontWeight: 600,
                      outline: "none"
                    }}
                  >
                    <option value={15}>15 Menit</option>
                    <option value={30}>30 Menit</option>
                    <option value={60}>1 Jam (Standar)</option>
                    <option value={120}>2 Jam</option>
                  </select>
                </div>
              </div>

              {/* Active Sessions */}
              <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 700, color: "var(--ph-text)" }}>Active Workstation Sessions</h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Laptop size={20} color="#10b981" />
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--ph-text)" }}>Windows 11 POS Terminal • Chrome Browser</div>
                      <div style={{ fontSize: "11.5px", color: "var(--ph-text-muted)" }}>IP: 192.168.1.102 • Active right now</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "3px 10px", borderRadius: "100px" }}>
                    Current Device
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ 5. BILLING & PLANS TAB ══════════════════ */}
          {activeTab === "billing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Active Plan Card */}
              <div style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.12) 100%)",
                borderRadius: "20px",
                padding: isMobile ? "20px" : "28px",
                border: "1.5px solid rgba(16,185,129,0.3)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#10b981", background: "rgba(16,185,129,0.15)", padding: "4px 12px", borderRadius: "100px", border: "1px solid rgba(16,185,129,0.3)" }}>
                      Active Subscription
                    </span>
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--ph-text)", margin: "10px 0 6px 0", fontFamily: "'Outfit', sans-serif" }}>
                      {settingsData.plan_name}
                    </h2>
                    <p style={{ fontSize: "13.5px", color: "var(--ph-text-muted)", margin: 0 }}>
                      Termasuk modul AI Voice Cashier Duolingo-style, Multi-outlet POS, Manajemen Bahan Baku, & QRIS Auto-Settlement.
                    </p>
                  </div>
                  <div style={{ textAlign: isMobile ? "left" : "right" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", fontFamily: "'Outfit', sans-serif" }}>
                      {fmt(settingsData.plan_price)}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--ph-text-muted)" }}>per bulan (Billed Monthly)</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px", marginTop: "20px", paddingTop: "18px", borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "12.5px", color: "var(--ph-text-muted)" }}>
                    <strong>Gateway:</strong> {settingsData.payment_gateway}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--ph-text-muted)" }}>
                    <strong>Merchant ID:</strong> {settingsData.merchant_id}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--ph-text-muted)" }}>
                    <strong>Status:</strong> <span style={{ color: "#10b981", fontWeight: 700 }}>● {settingsData.plan_status}</span>
                  </div>
                </div>
              </div>

              {/* Invoices & Billing History CRUD */}
              <div style={{ backgroundColor: CARD, borderRadius: "20px", padding: isMobile ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
                      Billing & Invoices History
                    </h3>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--ph-text-muted)" }}>
                      Riwayat tagihan langganan tersimpan di database Munajat Drinks
                    </p>
                  </div>
                  <button
                    onClick={() => setInvoiceModalOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                      color: "white",
                      border: "none",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={14} />
                    <span>Create Invoice</span>
                  </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}`, color: "var(--ph-text-muted)", fontSize: "11px", textTransform: "uppercase" }}>
                        <th style={{ padding: "12px 14px" }}>Invoice #</th>
                        <th style={{ padding: "12px 14px" }}>Plan Details</th>
                        <th style={{ padding: "12px 14px" }}>Date</th>
                        <th style={{ padding: "12px 14px" }}>Amount</th>
                        <th style={{ padding: "12px 14px" }}>Status</th>
                        <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 ? (
                        <EmptyState
                          variant="table-row"
                          colSpan={6}
                          icon={CreditCard}
                          title="Data masih kosong"
                          description="Belum ada riwayat faktur tagihan di database."
                          actionText="Buat Invoice Baru"
                          onAction={() => setInvoiceModalOpen(true)}
                        />
                      ) : (
                        invoices.map(inv => (
                          <tr key={inv.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <td style={{ padding: "14px", fontWeight: 700, color: "var(--ph-text)" }}>
                              {inv.invoice_number}
                            </td>
                            <td style={{ padding: "14px", color: "var(--ph-text)" }}>
                              <div>{inv.plan_name}</div>
                              <div style={{ fontSize: "11.5px", color: "var(--ph-text-muted)" }}>{inv.payment_method}</div>
                            </td>
                            <td style={{ padding: "14px", color: "var(--ph-text-muted)" }}>
                              {inv.billing_date}
                            </td>
                            <td style={{ padding: "14px", fontWeight: 700, color: "#10b981" }}>
                              {fmt(inv.amount)}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <span style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: "100px",
                                background: inv.status === "paid" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                                color: inv.status === "paid" ? "#10b981" : "#f59e0b",
                                border: `1px solid ${inv.status === "paid" ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`
                              }}>
                                {inv.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "8px" }}>
                                <button
                                  onClick={() => setSelectedInvoice(inv)}
                                  title="View Invoice Detail"
                                  style={{
                                    width: "30px", height: "30px", borderRadius: "8px", border: `1px solid ${BORDER}`,
                                    background: "transparent", color: "var(--ph-text-muted)", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                  }}
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteInvoice(inv.id)}
                                  title="Delete Invoice"
                                  style={{
                                    width: "30px", height: "30px", borderRadius: "8px", border: `1px solid ${BORDER}`,
                                    background: "transparent", color: "#f87171", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Invoice Modal ── */}
      {invoiceModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "460px", borderRadius: "24px", backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: "28px", color: "var(--ph-text)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>Create New Invoice</h2>
              <button onClick={() => setInvoiceModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--ph-text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Invoice Number</label>
                <input
                  type="text" required value={invoiceForm.invoice_number}
                  onChange={e => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Plan Details</label>
                <input
                  type="text" required value={invoiceForm.plan_name}
                  onChange={e => setInvoiceForm({ ...invoiceForm, plan_name: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Amount (Rp)</label>
                  <input
                    type="number" required value={invoiceForm.amount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Payment Method</label>
                  <select
                    value={invoiceForm.payment_method}
                    onChange={e => setInvoiceForm({ ...invoiceForm, payment_method: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", boxSizing: "border-box" }}
                  >
                    <option value="QRIS">QRIS Auto-Debit</option>
                    <option value="BCA Virtual Account">BCA Virtual Account</option>
                    <option value="Mandiri Virtual Account">Mandiri Virtual Account</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Billing Date</label>
                  <input
                    type="date" required value={invoiceForm.billing_date}
                    onChange={e => setInvoiceForm({ ...invoiceForm, billing_date: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Status</label>
                  <select
                    value={invoiceForm.status}
                    onChange={e => setInvoiceForm({ ...invoiceForm, status: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", boxSizing: "border-box" }}
                  >
                    <option value="paid">Paid (Lunas)</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button" onClick={() => setInvoiceModalOpen(false)}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: `1px solid ${BORDER}`, background: "transparent", color: "var(--ph-text-muted)", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", color: "white", cursor: "pointer", fontWeight: 700 }}
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Invoice Detail View Modal ── */}
      {selectedInvoice && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "440px", borderRadius: "24px", backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: "28px", color: "var(--ph-text)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#10b981", textTransform: "uppercase" }}>Official Receipt</span>
                <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "2px 0 0 0", fontFamily: "'Outfit', sans-serif" }}>
                  {selectedInvoice.invoice_number}
                </h2>
              </div>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: "transparent", border: "none", color: "var(--ph-text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--ph-text-muted)" }}>Plan:</span>
                <span style={{ fontWeight: 600, color: "var(--ph-text)" }}>{selectedInvoice.plan_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--ph-text-muted)" }}>Billing Date:</span>
                <span style={{ fontWeight: 600, color: "var(--ph-text)" }}>{selectedInvoice.billing_date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--ph-text-muted)" }}>Payment Method:</span>
                <span style={{ fontWeight: 600, color: "var(--ph-text)" }}>{selectedInvoice.payment_method}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--ph-text-muted)" }}>Status:</span>
                <span style={{ fontWeight: 700, color: selectedInvoice.status === "paid" ? "#10b981" : "#f59e0b" }}>{selectedInvoice.status.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", paddingTop: "8px", borderTop: `1px solid ${BORDER}` }}>
                <span style={{ fontWeight: 700, color: "var(--ph-text)" }}>Total Amount:</span>
                <span style={{ fontWeight: 800, color: "#10b981" }}>{fmt(selectedInvoice.amount)}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ padding: "10px 22px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", color: "white", cursor: "pointer", fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
