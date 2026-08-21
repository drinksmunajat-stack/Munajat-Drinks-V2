import React, { useEffect, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null;
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export default function ContextMenu({ open, onClose, anchorRect, onEdit, onDelete, editLabel = "Edit", deleteLabel = "Delete" }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    setTimeout(() => {
      document.addEventListener("mousedown", handler);
      document.addEventListener("keydown", keyHandler);
    }, 10);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const MENU_W = 176;
  const MENU_H = 100;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Position below the button, flip if out of viewport
  let top = anchorRect.bottom + 8;
  let left = anchorRect.right - MENU_W;
  if (top + MENU_H > vh) top = anchorRect.top - MENU_H - 8;
  if (left < 8) left = 8;
  if (left + MENU_W > vw - 8) left = vw - MENU_W - 8;

  return (
    <>
      <style>{`
        @keyframes ctx-pop-in {
          from { opacity:0; transform:scale(0.92) translateY(-6px) }
          to   { opacity:1; transform:scale(1) translateY(0) }
        }
        .ctx-item:hover { background: rgba(255,255,255,0.06) !important; }
        .ctx-item-delete:hover { background: rgba(239,68,68,0.10) !important; color: #f87171 !important; }
        .ctx-item-delete:hover svg { color: #f87171 !important; }
      `}</style>
      <div
        ref={menuRef}
        style={{
          position: "fixed", top, left, width: MENU_W, zIndex: 9999,
          background: "rgba(7,13,31,0.75)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "14px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.07), inset 0 1px 0 rgba(255,255,255,0.06)",
          overflow: "hidden",
          animation: "ctx-pop-in 0.18s cubic-bezier(0.34,1.56,0.64,1)",
          transformOrigin: "top right",
          padding: "6px",
        }}
      >
        <button
          className="ctx-item"
          onClick={() => { onEdit(); onClose(); }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            width: "100%", padding: "10px 14px",
            borderRadius: "9px", border: "none",
            background: "transparent", color: "var(--ph-text)",
            cursor: "pointer", fontSize: "14px", fontWeight: 500,
            textAlign: "left", transition: "background 0.15s",
          }}
        >
          <Pencil size={15} color="#8b5cf6" />
          {editLabel}
        </button>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "2px 8px" }} />

        <button
          className="ctx-item ctx-item-delete"
          onClick={() => { onDelete(); onClose(); }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            width: "100%", padding: "10px 14px",
            borderRadius: "9px", border: "none",
            background: "transparent", color: "var(--ph-text-muted)",
            cursor: "pointer", fontSize: "14px", fontWeight: 500,
            textAlign: "left", transition: "all 0.15s",
          }}
        >
          <Trash2 size={15} color="#f87171" />
          {deleteLabel}
        </button>
      </div>
    </>
  );
}
