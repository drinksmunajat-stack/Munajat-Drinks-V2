import React, { useState, useEffect } from "react";
import { CARD, BORDER } from "../theme";
import { FolderPlus, Clock, Users as UsersIcon, MoreHorizontal, Loader2, RefreshCw } from "lucide-react";
import { useBreakpoint } from "../hooks/use-breakpoint";
import StepModal, { StepDef } from "../components/StepModal";
import ActionModal from "../components/ActionModal";
import EmptyState from "../components/EmptyState";
import { projectsApi, ProjectItem } from "../services/api";

const PROJECT_COLORS = ["#10b981","#06b6d4","#8b5cf6","#3b82f6","#f97316","#ec4899","#ef4444","#eab308","#6366f1","#14b8a6"];

const STEPS: StepDef[] = [
  { label: "Details", icon: null },
  { label: "Team",    icon: null },
  { label: "Review",  icon: null },
];

const emptyForm = () => ({ name: "", description: "", color: PROJECT_COLORS[0], members: 2, daysLeft: 14 });

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen,  setAddOpen]  = useState(false);
  const [step,     setStep]     = useState(0);
  const [form,     setForm]     = useState(emptyForm());

  const [actionOpen, setActionOpen] = useState(false);
  const [actionIdx,  setActionIdx]  = useState<number | null>(null);
  const [editOpen,   setEditOpen]   = useState(false);
  const [editStep,   setEditStep]   = useState(0);
  const [editForm,   setEditForm]   = useState(emptyForm());

  const { isMobile, isTablet } = useBreakpoint();
  const cols = isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)";

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error("Failed to load projects from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openAction = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setActionIdx(idx);
    setActionOpen(true);
  };

  const handleDelete = async () => {
    if (actionIdx === null) return;
    const target = projects[actionIdx];
    try {
      if (target?.id) {
        await projectsApi.delete(target.id);
      }
      setProjects(p => p.filter((_, i) => i !== actionIdx));
      setActionOpen(false);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleEdit = () => {
    if (actionIdx === null) return;
    const p = projects[actionIdx];
    setEditForm({ name: p.name, description: p.description || "", color: p.color || PROJECT_COLORS[0], members: p.members || 2, daysLeft: p.days_left ?? 14 });
    setEditStep(0);
    setEditOpen(true);
  };

  const commitAdd = async () => {
    try {
      const res = await projectsApi.create({
        name: form.name || "New Project",
        description: form.description,
        color: form.color,
        members: form.members,
        days_left: form.daysLeft,
        progress: 0,
        status: "In Progress"
      });
      if (res.success && res.data) {
        setProjects(p => [res.data, ...p]);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
    setAddOpen(false);
    setStep(0);
    setForm(emptyForm());
  };

  const commitEdit = async () => {
    if (actionIdx === null) return;
    const target = projects[actionIdx];
    try {
      if (target?.id) {
        const res = await projectsApi.update(target.id, {
          name: editForm.name || target.name,
          description: editForm.description,
          color: editForm.color,
          members: editForm.members,
          days_left: editForm.daysLeft,
        });
        if (res.success && res.data) {
          setProjects(p => p.map((item, i) => i === actionIdx ? res.data : item));
        }
      }
    } catch (err) {
      console.error("Failed to update project:", err);
    }
    setEditOpen(false);
  };

  const canProceedAdd  = step === 0 ? form.name.trim().length > 0 : true;
  const canProceedEdit = editStep === 0 ? editForm.name.trim().length > 0 : true;

  const renderContent = (f: typeof form, setF: (x: typeof form) => void, s: number) => {
    if (s === 0) return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "68px", height: "68px", borderRadius: "20px", background: `${f.color}20`, border: `1.5px solid ${f.color}50`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
            <FolderPlus size={30} color={f.color} />
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {PROJECT_COLORS.map(c => (
              <button key={c} onClick={() => setF({ ...f, color: c })} style={{ width: "22px", height: "22px", borderRadius: "50%", background: c, border: f.color === c ? "2px solid white" : "2px solid transparent", cursor: "pointer", boxShadow: f.color === c ? `0 0 0 2px ${c}` : "none", transition: "all 0.2s", flexShrink: 0 }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 500 }}>Project Name</label>
          <input value={f.name} placeholder="e.g. Horizon Dashboard V2" onChange={e => setF({ ...f, name: e.target.value })}
            style={{ padding: "11px 14px", borderRadius: "10px", border: "1.5px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)", color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" as const }}
            onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 500 }}>Description</label>
          <textarea value={f.description} placeholder="What is this project about?" onChange={e => setF({ ...f, description: e.target.value })} rows={3}
            style={{ padding: "11px 14px", borderRadius: "10px", border: "1.5px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)", color: "var(--ph-text)", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" as const, resize: "none", fontFamily: "inherit", lineHeight: 1.5 }}
            onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
        </div>
      </div>
    );

    if (s === 1) return (
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 500 }}>Team Members</label>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--ph-text)" }}>{f.members}</span>
          </div>
          <input type="range" min={1} max={20} value={f.members} onChange={e => setF({ ...f, members: Number(e.target.value) })} style={{ width: "100%", accentColor: f.color, cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--ph-text-dim)", marginTop: "6px" }}><span>1</span><span>10</span><span>20</span></div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <label style={{ fontSize: "13px", color: "var(--ph-text-secondary)", fontWeight: 500 }}>Deadline</label>
            <span style={{ fontSize: "20px", fontWeight: 700, color: f.daysLeft <= 3 ? "#f87171" : "var(--ph-text)" }}>{f.daysLeft === 0 ? "Today" : `${f.daysLeft} days`}</span>
          </div>
          <input type="range" min={0} max={90} value={f.daysLeft} onChange={e => setF({ ...f, daysLeft: Number(e.target.value) })} style={{ width: "100%", accentColor: f.daysLeft <= 3 ? "#ef4444" : f.color, cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--ph-text-dim)", marginTop: "6px" }}><span>Today</span><span>45d</span><span>90d</span></div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "16px", display: "flex", gap: "24px", justifyContent: "center" }}>
          {[{ icon: UsersIcon, val: `${f.members} members`, color: f.color }, { icon: Clock, val: f.daysLeft === 0 ? "Due today" : `${f.daysLeft}d remaining`, color: f.daysLeft <= 3 ? "#f87171" : "var(--ph-text-muted)" }].map(({ icon: Icon, val, color }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color, fontSize: "14px", fontWeight: 600 }}><Icon size={16} /> {val}</div>
          ))}
        </div>
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ background: `${f.color}0d`, border: `1px solid ${f.color}25`, borderRadius: "18px", padding: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px", background: `${f.color}20`, border: `1.5px solid ${f.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderPlus size={24} color={f.color} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--ph-text)", marginBottom: "4px" }}>{f.name || "–"}</div>
            <div style={{ fontSize: "14px", color: "var(--ph-text-muted)" }}>{f.description || "No description"}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[["Team Members",`${f.members} people`],["Deadline",f.daysLeft===0?"Today":`${f.daysLeft} days`],["Initial Progress","0% — starts fresh"],["Status","In Progress"]].map(([label,val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "12px", color: "var(--ph-text-dim)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ph-text)" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const actionProject = actionIdx !== null ? projects[actionIdx] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: isMobile ? "22px" : "28px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--ph-text)" }}>Projects & Roadmap</h1>
          <p style={{ margin: 0, color: "var(--ph-text-muted)", fontSize: "14px" }}>Track strategic initiatives, AI development tasks, and outlet roadmap saved in database.</p>
        </div>
        <button onClick={() => { setForm(emptyForm()); setStep(0); setAddOpen(true); }}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", border: "none", color: "white", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.3)", width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
          <FolderPlus size={18} /> New Project
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: cols, gap: isMobile ? "12px" : "24px" }}>
        {projects.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", width: "100%" }}>
            <EmptyState
              icon={FolderPlus}
              title="Data masih kosong"
              description="Belum ada inisiatif project aktif di database."
              actionText="Tambah Project Baru"
              onAction={() => { setForm(emptyForm()); setStep(0); setAddOpen(true); }}
            />
          </div>
        ) : (
          projects.map((p, i) => (
          <div key={p.id || i}
            style={{ backgroundColor: CARD, borderRadius: "20px", padding: "24px", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: "20px", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 24px ${p.color || '#10b981'}18`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${p.color || '#10b981'}20`, border: `1px solid ${p.color || '#10b981'}40`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color || '#10b981', flexShrink: 0 }}>
                <FolderPlus size={24} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, background: p.progress === 100 ? "rgba(34,197,94,0.15)" : "rgba(16,185,129,0.1)", color: p.progress === 100 ? "#4ade80" : "#10b981", border: `1px solid ${p.progress === 100 ? "rgba(34,197,94,0.3)" : BORDER}`, whiteSpace: "nowrap" }}>
                  {p.progress === 100 ? "Completed" : "In Progress"}
                </span>
                <button onClick={e => openAction(e, i)}
                  style={{ background: "transparent", border: "none", color: "var(--ph-text-muted)", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 600, color: "var(--ph-text)" }}>{p.name}</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--ph-text-muted)", lineHeight: 1.5 }}>{p.description}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--ph-text-secondary)" }}>Progress</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ph-text)" }}>{p.progress}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(128,128,128,0.15)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${p.progress}%`, height: "100%", backgroundColor: p.color || '#10b981', borderRadius: "3px", boxShadow: `0 0 10px ${p.color || '#10b981'}80` }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--ph-text-muted)", fontSize: "13px" }}><UsersIcon size={14} /> {p.members} members</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: (p.days_left ?? 0) === 0 ? "var(--ph-text-muted)" : (p.days_left ?? 0) <= 3 ? "#f87171" : "var(--ph-text-muted)" }}><Clock size={14} /> {(p.days_left ?? 0) === 0 ? "Done" : `${p.days_left}d left`}</div>
            </div>
          </div>
        ))}
      </div>

      <StepModal open={addOpen} onClose={() => setAddOpen(false)} title="New Project" subtitle="Set up a new initiative saved to database" steps={STEPS} currentStep={step} onNext={() => setStep(s => s + 1)} onBack={() => setStep(s => s - 1)} onFinish={commitAdd} canProceed={canProceedAdd} finishLabel="Create Project">
        {renderContent(form, setForm, step)}
      </StepModal>

      <StepModal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Project" subtitle="Update this project's details in database" steps={STEPS} currentStep={editStep} onNext={() => setEditStep(s => s + 1)} onBack={() => setEditStep(s => s - 1)} onFinish={commitEdit} canProceed={canProceedEdit} finishLabel="Save Changes">
        {renderContent(editForm, setEditForm, editStep)}
      </StepModal>

      <ActionModal
        open={actionOpen} onClose={() => setActionOpen(false)}
        title={actionProject?.name ?? ""}
        subtitle={actionProject?.description}
        iconBg={actionProject?.color ?? "#10b981"}
        iconColor={actionProject?.color ?? "#10b981"}
        iconLetter="📁"
        onEdit={handleEdit}
        onDelete={handleDelete}
        editLabel="Edit Project"
        deleteLabel="Delete Project"
      />
    </div>
  );
}
