import React, { useState, useEffect } from "react";
import {
  Users, Plus, Search, Filter, Shield, User, CheckCircle,
  XCircle, Edit2, Trash2, Phone, Mail, Store, Key,
  Sparkles, Coffee, Eye, Lock, RefreshCw, Download, AlertTriangle, Loader2
} from "lucide-react";
import { CARD, BORDER } from "../theme";
import { useBreakpoint } from "../hooks/use-breakpoint";
import { useTheme } from "../context/ThemeContext";
import { usersApi } from "../services/api";
import EmptyState from "../components/EmptyState";
import ElegantPagination from "../components/ElegantPagination";

export interface UserItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "Super Admin" | "Store Manager" | "Cashier" | "Barista" | "Customer";
  branch: string;
  status: "Active" | "On Leave" | "Inactive";
  joinedDate: string;
  avatarColor: string;
}

const ROLES_INFO = [
  { role: "Super Admin", color: "#10b981", badge: "Full Access", desc: "Full access to system configs, APIs, & outlets" },
  { role: "Store Manager", color: "#06b6d4", badge: "Manager", desc: "Branch operations, inventory, & sales reports" },
  { role: "Cashier", color: "#ec4899", badge: "Operations", desc: "Access to POS cashier terminal & payments" },
  { role: "Barista", color: "#8b5cf6", badge: "Operations", desc: "Access to brewing queue & order fulfillment" },
  { role: "Customer", color: "#3b82f6", badge: "Member", desc: "Loyalty member account & order history" },
];

const AVATAR_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#3b82f6", "#14b8a6", "#6366f1"];

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");

  // Modals & Drawers
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Create & Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+62 8",
    role: "Cashier" as UserItem["role"],
    branch: "Main Branch",
    status: "Active" as UserItem["status"],
    avatarColor: AVATAR_COLORS[0],
    password: "",
  });

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isMobile } = useBreakpoint();
  const { colorMode } = useTheme();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: UserItem[] = res.data.map((u, i) => {
          let roleName: UserItem["role"] = "Customer";
          if (u.role === "Super Admin" || u.role === "admin") roleName = "Super Admin";
          else if (u.role === "Store Manager" || u.role === "manager") roleName = "Store Manager";
          else if (u.role === "Kasir" || u.role === "Cashier") roleName = "Cashier";
          else if (u.role === "Barista") roleName = "Barista";

          let statusName: UserItem["status"] = "Active";
          if (u.status === "Cuti" || u.status === "On Leave") statusName = "On Leave";
          else if (u.status === "Nonaktif" || u.status === "Inactive") statusName = "Inactive";

          return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || "+62 8",
            role: roleName,
            branch: u.branch || "Main Branch",
            status: statusName,
            joinedDate: u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : "2026-01-15",
            avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
          };
        });
        setUsers(mapped);
      }
    } catch (err: any) {
      showToast("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.branch.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase());
    const matchRole = selectedRole === "All" || u.role === selectedRole;
    const matchBranch = selectedBranch === "All" || u.branch.toLowerCase().includes(selectedBranch.toLowerCase());
    return matchSearch && matchRole && matchBranch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole, selectedBranch]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Open Create Modal
  const handleOpenCreate = () => {
    setTargetUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "+62 8",
      role: "Cashier",
      branch: "Main Branch",
      status: "Active",
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      password: "",
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setTargetUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branch: user.branch,
      status: user.status,
      avatarColor: user.avatarColor,
      password: "",
    });
    setFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (user: UserItem) => {
    setTargetUser(user);
    setDetailModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (user: UserItem) => {
    setTargetUser(user);
    setDeleteModalOpen(true);
  };

  // Handle Form Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (targetUser) {
        await usersApi.update(targetUser.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          branch: formData.branch,
          status: formData.status,
        });
        showToast(`User ${formData.name} updated successfully!`);
      } else {
        await usersApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password || "password123",
          phone: formData.phone,
          role: formData.role,
          branch: formData.branch,
          status: formData.status,
        });
        showToast(`New user ${formData.name} created successfully!`);
      }
      setFormModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showToast("Failed to save user: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!targetUser) return;
    setIsSubmitting(true);
    try {
      await usersApi.delete(targetUser.id);
      showToast(`User account ${targetUser.name} deleted.`);
      setDeleteModalOpen(false);
      setTargetUser(null);
      loadUsers();
    } catch (err: any) {
      showToast("Failed to delete user: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (id: number) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    const nextStatus: UserItem["status"] = target.status === "Active" ? "On Leave" : target.status === "On Leave" ? "Inactive" : "Active";
    try {
      await usersApi.update(id, {
        name: target.name,
        email: target.email,
        role: target.role,
        branch: target.branch,
        status: nextStatus,
      });
      setUsers(users.map(u => (u.id === id ? { ...u, status: nextStatus } : u)));
      showToast(`Status for ${target.name} changed to: ${nextStatus}`);
    } catch (err: any) {
      showToast("Failed to update status: " + err.message);
    }
  };

  const getRoleBadge = (role: UserItem["role"]) => {
    switch (role) {
      case "Super Admin": return { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)" };
      case "Store Manager": return { bg: "rgba(6,182,212,0.15)", color: "#38bdf8", border: "rgba(6,182,212,0.3)" };
      case "Cashier": return { bg: "rgba(236,72,153,0.15)", color: "#f472b6", border: "rgba(236,72,153,0.3)" };
      case "Barista": return { bg: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "rgba(139,92,246,0.3)" };
      default: return { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" };
    }
  };

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 120,
          padding: "14px 22px", borderRadius: "14px",
          background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
          color: "#fff", fontWeight: 700, fontSize: "13px",
          boxShadow: "0 10px 30px rgba(16,185,129,0.4)",
          display: "flex", alignItems: "center", gap: "10px"
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: "14px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "3px 10px", borderRadius: "100px", marginBottom: "6px" }}>
            <Users size={13} />
            DATABASE / USERS & ACCESS PERMISSIONS
          </div>
          <h1 style={{ margin: "0 0 4px 0", fontSize: isMobile ? "20px" : "28px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--ph-text)", fontFamily: "'Outfit', sans-serif" }}>
            Users, Staff & Member Accounts
          </h1>
          <p style={{ margin: 0, color: "var(--ph-text-muted)", fontSize: isMobile ? "12px" : "13.5px" }}>
            Centralized management of store personnel, Super Admins, Branch Managers, and customer accounts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(16, 185, 129, 0.35)",
            width: isMobile ? "100%" : "auto"
          }}
        >
          <Plus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Role Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: isMobile ? "10px" : "14px" }}>
        {ROLES_INFO.map((r, i) => (
          <div
            key={i}
            onClick={() => setSelectedRole(selectedRole === r.role ? "All" : r.role)}
            style={{
              padding: isMobile ? "12px" : "16px", borderRadius: "18px", backgroundColor: CARD,
              border: selectedRole === r.role ? `2px solid ${r.color}` : `1px solid ${BORDER}`,
              cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px",
              transition: "all 0.2s",
              boxShadow: selectedRole === r.role ? `0 0 20px ${r.color}25` : "none"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "10.5px", color: "var(--ph-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{r.role}</span>
              <span style={{ fontSize: "9.5px", fontWeight: 800, padding: "2px 5px", borderRadius: "4px", background: `${r.color}18`, color: r.color }}>{r.badge}</span>
            </div>
            <div style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: 800, color: r.color, fontFamily: "'Outfit', sans-serif" }}>
              {users.filter((u) => u.role === r.role).length} Users
            </div>
            {!isMobile && <div style={{ fontSize: "11px", color: "var(--ph-text-dim)", lineHeight: 1.3 }}>{r.desc}</div>}
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ padding: "14px 16px", borderRadius: "18px", backgroundColor: CARD, border: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ position: "relative", width: isMobile ? "100%" : "340px", display: "flex", alignItems: "center" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", color: "var(--ph-text-muted)" }} />
          <input
            type="text"
            placeholder="Search name, email, phone, branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", fontSize: "13px", outline: "none" }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", maxWidth: "100%" }}>
          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{
              padding: "8px 12px", borderRadius: "10px",
              backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`,
              color: "var(--ph-text)", fontSize: "12px", fontWeight: 600, outline: "none"
            }}
          >
            <option value="All">All Branches</option>
            <option value="Tebet">Tebet</option>
            <option value="Senopati">Senopati</option>
            <option value="BSD">BSD Serpong</option>
            <option value="Dago">Dago Bandung</option>
          </select>

          {/* Role Filter Pills */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", maxWidth: isMobile ? "100%" : "none", paddingBottom: isMobile ? "2px" : "0" }}>
            {["All", "Super Admin", "Store Manager", "Cashier", "Barista", "Customer"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  padding: "6px 12px", borderRadius: "100px", border: "none",
                  fontSize: "12px", fontWeight: selectedRole === role ? 700 : 500,
                  cursor: "pointer", whiteSpace: "nowrap",
                  background: selectedRole === role ? "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)" : "rgba(255,255,255,0.05)",
                  color: selectedRole === role ? "#fff" : "var(--ph-text-muted)",
                }}
              >
                {role === "All" ? "All Roles" : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div style={{ borderRadius: "20px", backgroundColor: CARD, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "860px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "rgba(255,255,255,0.03)", color: "var(--ph-text-muted)", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th style={{ padding: "16px 20px" }}>User Profile</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>Role Access</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>Assigned Branch</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>Account Status</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>Joined Date</th>
                <th style={{ padding: "16px 20px", textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <EmptyState
                  variant="table-row"
                  colSpan={6}
                  icon={Users}
                  title="No users found"
                  description="There are no user accounts matching your current search criteria."
                  actionText="Add New User"
                  onAction={handleOpenCreate}
                />
              ) : (
                paginatedUsers.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const initials = u.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
                  return (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${BORDER}`, transition: "background 0.15s" }}>
                      <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "40px", height: "40px", borderRadius: "12px",
                            background: u.avatarColor, display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: "13px", color: "#fff", flexShrink: 0,
                            boxShadow: `0 4px 12px ${u.avatarColor}40`
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--ph-text)", fontSize: "13.5px" }}>{u.name}</div>
                            <div style={{ fontSize: "11.5px", color: "var(--ph-text-muted)", marginTop: "2px" }}>{u.email} · {u.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "5px 12px",
                          borderRadius: "100px",
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          fontSize: "11.5px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          lineHeight: 1.2
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "var(--ph-text-secondary)", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: "rgba(6,182,212,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Store size={14} color="#06b6d4" />
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.branch}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          title="Click to toggle status (Active / On Leave / Inactive)"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "5px 12px", borderRadius: "100px", border: "none",
                            background: u.status === "Active" ? "rgba(16,185,129,0.15)" : u.status === "On Leave" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                            color: u.status === "Active" ? "#34d399" : u.status === "On Leave" ? "#f59e0b" : "#f87171",
                            fontSize: "11.5px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
                          }}
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", boxShadow: "0 0 6px currentColor" }} />
                          {u.status}
                        </button>
                      </td>
                      <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "var(--ph-text-muted)", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {u.joinedDate}
                      </td>
                      <td style={{ padding: "16px 20px", verticalAlign: "middle", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            onClick={() => handleOpenDetail(u)}
                            title="View Profile"
                            style={{
                              width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${BORDER}`,
                              background: "transparent", color: "#38bdf8", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User"
                            style={{
                              width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${BORDER}`,
                              background: "transparent", color: "var(--ph-text-muted)", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(u)}
                            title="Delete User"
                            style={{
                              width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${BORDER}`,
                              background: "transparent", color: "#f87171", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
          totalItems={filteredUsers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="users"
        />
      </div>

      {/* Modal Add / Edit User */}
      {formModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "12px" : "20px" }}>
          <div style={{ width: "100%", maxWidth: "480px", borderRadius: "24px", backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: isMobile ? "20px 16px" : "28px", color: "var(--ph-text)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 16px 0", fontFamily: "'Outfit', sans-serif" }}>
              {targetUser ? "Edit User Account" : "Add New User"}
            </h2>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Full Name</label>
                <input
                  type="text" required value={formData.name} placeholder="e.g. Alex Chen"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Email Address</label>
                <input
                  type="email" required value={formData.email} placeholder="alex@munajatdrinks.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Role Access</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", fontSize: "14px" }}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Barista">Barista</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Assigned Branch</label>
                  <input
                    type="text" value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", backgroundColor: "var(--ph-bg)", border: `1px solid ${BORDER}`, color: "var(--ph-text)", outline: "none", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button" onClick={() => setFormModalOpen(false)}
                  style={{ padding: "10px 16px", borderRadius: "10px", border: `1px solid ${BORDER}`, backgroundColor: "transparent", color: "var(--ph-text)", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                >
                  {isSubmitting ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && targetUser && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "400px", borderRadius: "24px", backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: "28px", color: "var(--ph-text)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 800 }}>Delete User Account?</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ph-text-muted)" }}>
                Are you sure you want to delete user <strong>{targetUser.name}</strong> from the database?
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "8px" }}>
              <button
                type="button" onClick={() => setDeleteModalOpen(false)}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: `1px solid ${BORDER}`, backgroundColor: "transparent", color: "var(--ph-text)", cursor: "pointer", fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="button" onClick={handleConfirmDelete} disabled={isSubmitting}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", backgroundColor: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 800 }}
              >
                {isSubmitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && targetUser && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "440px", borderRadius: "24px", backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: "28px", color: "var(--ph-text)" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "18px", fontWeight: 800 }}>User Profile Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div><strong>Name:</strong> {targetUser.name}</div>
              <div><strong>Email:</strong> {targetUser.email}</div>
              <div><strong>Phone:</strong> {targetUser.phone}</div>
              <div><strong>Role:</strong> {targetUser.role}</div>
              <div><strong>Branch:</strong> {targetUser.branch}</div>
              <div><strong>Status:</strong> {targetUser.status}</div>
              <div><strong>Joined:</strong> {targetUser.joinedDate}</div>
            </div>
            <button
              onClick={() => setDetailModalOpen(false)}
              style={{ width: "100%", marginTop: "20px", padding: "10px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
