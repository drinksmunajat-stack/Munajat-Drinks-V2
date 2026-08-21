import React, { useState, useEffect } from 'react';
import {
  Coffee, Plus, Search, Filter, Edit2, Trash2, CheckCircle,
  XCircle, ArrowUpDown, Sparkles, Package, DollarSign, Tag, Loader2, AlertTriangle
} from 'lucide-react';
import { CARD, BORDER } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { productsApi } from '../services/api';
import EmptyState from '../components/EmptyState';
import ElegantPagination from '../components/ElegantPagination';

export interface ProductItem {
  id: number;
  code: string;
  name: string;
  category: 'Coffee' | 'Non-Coffee' | 'Frappe' | 'Tea' | string;
  price: number;
  costPrice: number;
  stock: number;
  badge?: string;
  isAvailable: boolean;
  description: string;
  emoji: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Coffee': '☕',
  'Non-Coffee': '🍵',
  'Frappe': '🥥',
  'Tea': '🍋',
  'Kopi': '☕',
  'Non-Kopi': '🍵',
};

const fmt = (n: number) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function Products() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteProduct, setTargetDeleteProduct] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Coffee' as ProductItem['category'],
    price: 25000,
    costPrice: 10000,
    stock: 100,
    badge: '',
    isAvailable: true,
    description: '',
    emoji: '☕',
  });

  const { colorMode } = useTheme();
  const { isMobile } = useBreakpoint();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: ProductItem[] = res.data.map(p => ({
          id: p.id,
          code: p.code || `PRD-0${p.id}`,
          name: p.name,
          category: p.category === 'Kopi' ? 'Coffee' : p.category === 'Non-Kopi' ? 'Non-Coffee' : (p.category || 'Coffee'),
          price: Number(p.price),
          costPrice: Number(p.cost_price || Math.round(Number(p.price) * 0.45)),
          stock: Number(p.stock || 0),
          badge: p.badge || '',
          isAvailable: Boolean(p.is_available ?? true),
          description: p.description || '',
          emoji: CATEGORY_EMOJIS[p.category] || '🍹',
        }));
        setProducts(mapped);
      }
    } catch (err: any) {
      showToast('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  // Reset to page 1 whenever filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      code: `MNJ-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Coffee',
      price: 25000,
      costPrice: 10000,
      stock: 100,
      badge: 'Best Seller',
      isAvailable: true,
      description: '',
      emoji: '☕',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      name: p.name,
      category: p.category,
      price: p.price,
      costPrice: p.costPrice,
      stock: p.stock,
      badge: p.badge || '',
      isAvailable: p.isAvailable,
      description: p.description,
      emoji: p.emoji,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, {
          code: formData.code,
          name: formData.name,
          category: formData.category,
          price: formData.price,
          cost_price: formData.costPrice,
          stock: formData.stock,
          badge: formData.badge,
          is_available: formData.isAvailable,
          description: formData.description,
        });
        showToast(`Product ${formData.name} updated successfully!`);
      } else {
        await productsApi.create({
          code: formData.code,
          name: formData.name,
          category: formData.category,
          price: formData.price,
          cost_price: formData.costPrice,
          stock: formData.stock,
          badge: formData.badge,
          is_available: formData.isAvailable,
          description: formData.description,
        });
        showToast(`Product ${formData.name} added successfully!`);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err: any) {
      showToast('Failed to save product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteProduct) return;
    setIsSubmitting(true);
    try {
      await productsApi.delete(targetDeleteProduct.id);
      showToast(`Product ${targetDeleteProduct.name} deleted.`);
      setDeleteModalOpen(false);
      setTargetDeleteProduct(null);
      loadProducts();
    } catch (err: any) {
      showToast('Failed to delete product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (id: number) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const nextState = !target.isAvailable;
    try {
      await productsApi.update(id, { is_available: nextState });
      setProducts(products.map(p => (p.id === id ? { ...p, isAvailable: nextState } : p)));
      showToast(`Product status for ${target.name}: ${nextState ? 'Available' : 'Out of Stock'}`);
    } catch (err: any) {
      showToast('Failed to update status: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

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

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px', color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif" }}>
            Beverage Catalog & Products
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--ph-text-muted)', margin: 0 }}>
            Manage drink menus, retail pricing, stock levels, and availability status across all branches.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
            transition: 'transform 0.2s'
          }}
        >
          <Plus size={16} />
          <span>Add New Beverage</span>
        </button>
      </div>

      {/* Stats Quick Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Coffee size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ph-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Products</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ph-text)' }}>{products.length} Drinks</div>
          </div>
        </div>

        <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ph-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active in POS & AI</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ph-text)' }}>{products.filter(p => p.isAvailable).length} Drinks</div>
          </div>
        </div>

        <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ph-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Stock Cups</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ph-text)' }}>{products.reduce((acc, p) => acc + p.stock, 0)}</div>
          </div>
        </div>

        <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ph-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Price</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ph-text)' }}>{fmt(products.length > 0 ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length) : 0)}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        padding: '16px', borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: isMobile ? '100%' : '320px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--ph-text-muted)' }} />
          <input
            type="text"
            placeholder="Search code or drink name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px',
              backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`,
              color: 'var(--ph-text)', fontSize: '13px', outline: 'none'
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {['All', 'Coffee', 'Non-Coffee', 'Frappe', 'Tea'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px', borderRadius: '100px', border: 'none',
                background: selectedCategory === cat ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' : 'rgba(255,255,255,0.05)',
                color: selectedCategory === cat ? '#fff' : 'var(--ph-text-muted)',
                fontWeight: selectedCategory === cat ? 700 : 500, fontSize: '12px',
                cursor: 'pointer', transition: 'all 0.2s',
                outline: selectedCategory === cat ? 'none' : `1px solid ${BORDER}`
              }}
            >
              {cat === 'All' ? '🌟 All Drinks' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table Card */}
      <div style={{ borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--ph-text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px' }}>Beverage</th>
                <th style={{ padding: '16px' }}>Code</th>
                <th style={{ padding: '16px' }}>Category</th>
                <th style={{ padding: '16px' }}>Selling Price</th>
                <th style={{ padding: '16px' }}>Cost Price (COGS)</th>
                <th style={{ padding: '16px' }}>Stock</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <EmptyState
                  variant="table-row"
                  colSpan={8}
                  icon={Coffee}
                  title="No beverages found"
                  description="There are no beverage products matching your current search or category filter."
                  actionText="Add New Beverage"
                  onAction={handleOpenAdd}
                />
              ) : (
                paginatedProducts.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          {p.emoji}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--ph-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {p.name}
                            {p.badge && (
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--ph-text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                      {p.code}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--ph-text-secondary)', fontSize: '12px', fontWeight: 500 }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>
                      {fmt(p.price)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--ph-text-muted)' }}>
                      {fmt(p.costPrice)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: p.stock < 70 ? '#f87171' : '#34d399' }}>
                        {p.stock} cups
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => toggleAvailability(p.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '4px 10px', borderRadius: '100px', border: 'none',
                          background: p.isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: p.isAvailable ? '#34d399' : '#f87171',
                          fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {p.isAvailable ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {p.isAvailable ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${BORDER}`,
                            background: 'transparent', color: 'var(--ph-text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setTargetDeleteProduct(p);
                            setDeleteModalOpen(true);
                          }}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${BORDER}`,
                            background: 'transparent', color: '#f87171', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
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

        {/* Elegant Pagination */}
        <ElegantPagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="beverages"
        />
      </div>

      {/* Modal Add / Edit Product */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '520px', borderRadius: '20px',
            backgroundColor: 'var(--ph-card)', border: `1px solid ${BORDER}`,
            padding: '28px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            color: 'var(--ph-text)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0', fontFamily: "'Outfit', sans-serif" }}>
              {editingProduct ? 'Edit Beverage Product' : 'Add New Beverage Product'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Product Code</label>
                  <input
                    type="text" required value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
                  >
                    <option value="Coffee" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Coffee</option>
                    <option value="Non-Coffee" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Non-Coffee</option>
                    <option value="Frappe" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Frappe</option>
                    <option value="Tea" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Tea</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Beverage Name</label>
                <input
                  type="text" required value={formData.name} placeholder="e.g. Matcha Latte Signature"
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Selling Price (Rp)</label>
                  <input
                    type="number" required value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Stock Portion (Cups)</label>
                  <input
                    type="number" required value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={2} value={formData.description} placeholder="Notes, ingredients, flavor characteristics..."
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: 'var(--ph-text)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && targetDeleteProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: '28px', color: 'var(--ph-text)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800 }}>Delete Beverage Product?</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ph-text-muted)' }}>
                Are you sure you want to delete <strong>{targetDeleteProduct.name}</strong> from the catalog?
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

    </div>
  );
}
