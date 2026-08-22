import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Sparkles, CheckCircle, XCircle, Edit2, Trash2,
  Layers, DollarSign, Package, AlertTriangle, TrendingUp, RefreshCw, Eye, Loader2
} from 'lucide-react';
import { CARD, BORDER } from '../theme';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { toppingsApi } from '../services/api';
import EmptyState from '../components/EmptyState';
import ElegantPagination from '../components/ElegantPagination';

export interface ToppingItem {
  id: number;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  isAvailable: boolean;
  emoji?: string;
  description?: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Boba: '🟤',
  Foam: '🧀',
  Pudding: '🍮',
  Jelly: '⬛',
  Crunch: '🍪',
  Coffee: '☕',
};

const fmt = (n: number) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function DatabaseToppings() {
  const [toppings, setToppings] = useState<ToppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetTopping, setTargetTopping] = useState<ToppingItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Boba',
    price: 5000,
    costPrice: 2000,
    stock: 100,
    isAvailable: true,
    emoji: '🟤',
    description: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const loadToppings = async () => {
    setLoading(true);
    try {
      const res = await toppingsApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category || 'Topping',
          price: Number(item.price),
          costPrice: item.cost_price ? Number(item.cost_price) : Math.round(Number(item.price) * 0.4),
          stock: Number(item.stock || 0),
          isAvailable: Boolean(item.is_available ?? true),
          emoji: CATEGORY_EMOJIS[item.category] || '✨',
          description: item.description || '',
        }));
        setToppings(mapped);
      }
    } catch (err: any) {
      showToast('Failed to load database records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadToppings();
  }, []);

  const filtered = toppings.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const paginatedToppings = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Quick Stock Adjustment
  const handleAdjustStock = async (id: number, delta: number) => {
    const target = toppings.find(t => t.id === id);
    if (!target) return;
    const newStock = Math.max(0, target.stock + delta);
    try {
      await toppingsApi.update(id, { stock: newStock });
      setToppings(toppings.map(t => (t.id === id ? { ...t, stock: newStock } : t)));
      showToast(`Stock ${target.name} updated: ${newStock} portions`);
    } catch (err: any) {
      showToast('Failed to update stock: ' + err.message);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setTargetTopping(null);
    setFormData({
      name: '',
      category: 'Boba',
      price: 5000,
      costPrice: 2000,
      stock: 100,
      isAvailable: true,
      emoji: '🟤',
      description: '',
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (t: ToppingItem) => {
    setTargetTopping(t);
    setFormData({
      name: t.name,
      category: t.category,
      price: t.price,
      costPrice: t.costPrice || 2000,
      stock: t.stock,
      isAvailable: t.isAvailable,
      emoji: t.emoji || '🟤',
      description: t.description || '',
    });
    setFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (t: ToppingItem) => {
    setTargetTopping(t);
    setDetailModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (t: ToppingItem) => {
    setTargetTopping(t);
    setDeleteModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (targetTopping) {
        await toppingsApi.update(targetTopping.id, {
          name: formData.name,
          category: formData.category,
          price: formData.price,
          cost_price: formData.costPrice,
          stock: formData.stock,
          is_available: formData.isActive ?? formData.isAvailable,
          description: formData.description,
        });
        showToast(`Topping ${formData.name} updated successfully!`);
      } else {
        await toppingsApi.create({
          name: formData.name,
          category: formData.category,
          price: formData.price,
          cost_price: formData.costPrice,
          stock: formData.stock,
          is_available: formData.isAvailable,
          description: formData.description,
        });
        showToast(`Topping ${formData.name} added successfully!`);
      }
      setFormModalOpen(false);
      loadToppings();
    } catch (err: any) {
      showToast('Failed to save topping: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!targetTopping) return;
    setIsSubmitting(true);
    try {
      await toppingsApi.delete(targetTopping.id);
      showToast(`Topping ${targetTopping.name} deleted.`);
      setDeleteModalOpen(false);
      setTargetTopping(null);
      loadToppings();
    } catch (err: any) {
      showToast('Failed to delete topping: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (id: number) => {
    const target = toppings.find(t => t.id === id);
    if (!target) return;
    const nextState = !target.isAvailable;
    try {
      await toppingsApi.update(id, { is_available: nextState });
      setToppings(toppings.map(t => (t.id === id ? { ...t, isAvailable: nextState } : t)));
      showToast(`Status for ${target.name}: ${nextState ? 'Available' : 'Out of Stock'}`);
    } catch (err: any) {
      showToast('Failed to update status: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 120,
          padding: '14px 22px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          color: '#fff', fontWeight: 700, fontSize: '13px',
          boxShadow: '0 10px 30px rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '3px 10px', borderRadius: '100px', marginBottom: '6px' }}>
            <Layers size={13} />
            DATABASE / TOPPINGS & ADD-ONS
          </div>
          <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.5px', color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif" }}>
            Toppings & Custom Add-ons Database
          </h1>
          <p style={{ fontSize: isMobile ? '12px' : '13.5px', color: 'var(--ph-text-muted)', margin: 0 }}>
            Manage add-on toppings, prices, estimated ingredient COGS, stock portion adjustments, and profit margins.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          <Plus size={16} />
          <span>Add New Topping</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '16px' }}>
        <div style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Total Toppings</div>
          <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{toppings.length} Types</div>
          <div style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 600 }}>{toppings.filter(t => t.isAvailable).length} active</div>
        </div>
        <div style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Total Portions</div>
          <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: '#06b6d4', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{toppings.reduce((acc, t) => acc + t.stock, 0)}</div>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-dim)' }}>Across all outlets</div>
        </div>
        <div style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Avg Profit Margin</div>
          <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: '#10b981', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>62.4%</div>
          <div style={{ fontSize: '10.5px', color: '#34d399', fontWeight: 600 }}>High margin</div>
        </div>
        <div style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Low Stock Alerts</div>
          <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: '#f59e0b', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{toppings.filter(t => t.stock < 30).length} Items</div>
          <div style={{ fontSize: '10.5px', color: '#f59e0b', fontWeight: 600 }}>Needs restock</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ padding: '14px 16px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: isMobile ? '100%' : '340px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--ph-text-muted)' }} />
          <input
            type="text"
            placeholder="Search toppings, boba, foam, jelly..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '2px' }}>
          {['All', 'Boba', 'Foam', 'Pudding', 'Jelly', 'Crunch', 'Coffee'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 12px', borderRadius: '100px', border: 'none',
                fontSize: '12px', fontWeight: categoryFilter === cat ? 700 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
                background: categoryFilter === cat ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' : 'rgba(255,255,255,0.05)',
                color: categoryFilter === cat ? '#fff' : 'var(--ph-text-muted)',
              }}
            >
              {cat === 'All' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Toppings Table */}
      <div style={{ borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--ph-text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px' }}>Topping</th>
                <th style={{ padding: '16px' }}>Category</th>
                <th style={{ padding: '16px' }}>Selling Price</th>
                <th style={{ padding: '16px' }}>Cost Price (COGS)</th>
                <th style={{ padding: '16px' }}>Profit Margin</th>
                <th style={{ padding: '16px' }}>Stock & Quick Adjust</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState
                  variant="table-row"
                  colSpan={8}
                  icon={Layers}
                  title="No toppings found"
                  description="There are no toppings matching your current search or filter criteria."
                  actionText="Add New Topping"
                  onAction={handleOpenCreate}
                />
              ) : (
                paginatedToppings.map(t => {
                const marginPct = Math.round(((t.price - (t.costPrice || 0)) / t.price) * 100);
                return (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          {t.emoji}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--ph-text)' }}>{t.name}</div>
                          {t.stock < 30 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', color: '#f59e0b', fontWeight: 700 }}>
                              <AlertTriangle size={11} /> Low Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--ph-text-secondary)', fontSize: '12px', fontWeight: 500 }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#10b981' }}>
                      +{fmt(t.price)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--ph-text-muted)' }}>
                      {fmt(t.costPrice || 0)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399' }}>
                        {marginPct}%
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, minWidth: '60px', color: t.stock < 30 ? '#f59e0b' : 'var(--ph-text)' }}>
                          {t.stock} portions
                        </span>
                        <button
                          onClick={() => handleAdjustStock(t.id, -10)}
                          title="Reduce 10 portions"
                          style={{ padding: '3px 8px', borderRadius: '6px', border: `1px solid ${BORDER}`, background: 'transparent', color: 'var(--ph-text-muted)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleAdjustStock(t.id, 25)}
                          title="Add 25 portions"
                          style={{ padding: '3px 8px', borderRadius: '6px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          +25
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => toggleAvailability(t.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '4px 10px', borderRadius: '100px', border: 'none',
                          background: t.isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: t.isAvailable ? '#34d399' : '#f87171',
                          fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {t.isAvailable ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {t.isAvailable ? 'Active' : 'Out of Stock'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenDetail(t)}
                          title="View Details"
                          style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: "transparent", color: "#38bdf8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          title="Edit Topping"
                          style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: "transparent", color: "var(--ph-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(t)}
                          title="Delete Topping"
                          style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: "transparent", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Elegant Pagination */}
        <ElegantPagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="toppings"
        />
      </div>

      {/* Form Modal */}
      {formModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '12px' : '20px' }}>
          <div style={{ width: '100%', maxWidth: '480px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: isMobile ? '20px 16px' : '28px', color: 'var(--ph-text)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0', fontFamily: "'Outfit', sans-serif" }}>
              {targetTopping ? 'Edit Topping' : 'Add New Topping'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Topping Name</label>
                <input
                  type="text" required value={formData.name} placeholder="e.g. Golden Boba Pearl"
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '14px' }}
                  >
                    {['Boba', 'Foam', 'Pudding', 'Jelly', 'Crunch', 'Coffee'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Selling Price (Rp)</label>
                  <input
                    type="number" required value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Cost Price / COGS (Rp)</label>
                  <input
                    type="number" value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Initial Stock</label>
                  <input
                    type="number" required value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button" onClick={() => setFormModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: '10px', border: `1px solid ${BORDER}`, backgroundColor: 'transparent', color: 'var(--ph-text)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Topping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && targetTopping && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: '28px', color: 'var(--ph-text)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800 }}>Delete Topping?</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ph-text-muted)' }}>
                Are you sure you want to delete <strong>{targetTopping.name}</strong> from the database?
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
              <button
                type="button" onClick={() => setDeleteModalOpen(false)}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: `1px solid ${BORDER}`, backgroundColor: 'transparent', color: 'var(--ph-text)', cursor: 'pointer', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="button" onClick={handleConfirmDelete} disabled={isSubmitting}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 800 }}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && targetTopping && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '440px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: '28px', color: 'var(--ph-text)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: 800 }}>Topping Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div><strong>Name:</strong> {targetTopping.name}</div>
              <div><strong>Category:</strong> {targetTopping.category}</div>
              <div><strong>Price:</strong> {fmt(targetTopping.price)}</div>
              <div><strong>Cost Price (COGS):</strong> {fmt(targetTopping.costPrice || 0)}</div>
              <div><strong>Stock Available:</strong> {targetTopping.stock} portions</div>
              <div><strong>Status:</strong> {targetTopping.isAvailable ? 'Available' : 'Out of Stock'}</div>
            </div>
            <button
              onClick={() => setDetailModalOpen(false)}
              style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
