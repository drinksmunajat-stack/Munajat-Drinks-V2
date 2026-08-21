import React, { useState, useEffect } from 'react';
import {
  Store, Plus, Search, CheckCircle, XCircle, Edit2,
  Trash2, MapPin, Phone, User, Clock, TrendingUp, DollarSign,
  Coffee, ShieldCheck, Zap, Activity, Users, Eye, AlertTriangle, Loader2
} from 'lucide-react';
import { CARD, BORDER } from '../theme';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { cabangsApi } from '../services/api';
import EmptyState from '../components/EmptyState';
import ElegantPagination from '../components/ElegantPagination';

export interface CabangItem {
  id: number;
  code: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  managerName: string;
  openingHours: string;
  isActive: boolean;
  dailyRevenue: number;
  dailyTarget: number;
  activeStaff: number;
  posTerminalStatus: 'Online' | 'Standby' | 'Offline';
}

const fmt = (n: number) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function DatabaseCabang() {
  const [cabangs, setCabangs] = useState<CabangItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetCabang, setTargetCabang] = useState<CabangItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    city: 'South Jakarta',
    phone: '+62 8',
    managerName: '',
    openingHours: '08:00 - 22:00',
    dailyTarget: 5000000,
    activeStaff: 4,
    isActive: true,
    posTerminalStatus: 'Online' as CabangItem['posTerminalStatus'],
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const loadCabangs = async () => {
    setLoading(true);
    try {
      const res = await cabangsApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: CabangItem[] = res.data.map((c, index) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          address: c.address,
          city: c.city,
          phone: c.phone || '+62 8',
          managerName: c.manager_name || 'Manager',
          openingHours: c.opening_hours || '08:00 - 22:00',
          isActive: Boolean(c.is_active ?? true),
          dailyRevenue: (index + 1) * 1750000 + 1500000,
          dailyTarget: 5000000,
          activeStaff: 4 + (index % 3),
          posTerminalStatus: c.is_active ? 'Online' : 'Offline',
        }));
        setCabangs(mapped);
      }
    } catch (err: any) {
      showToast('Failed to load branches: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadCabangs();
  }, []);

  const filtered = cabangs.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.managerName.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === 'All' || c.city.toLowerCase().includes(cityFilter.toLowerCase());
    return matchSearch && matchCity;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, cityFilter]);

  const paginatedCabangs = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Open Create Modal
  const handleOpenCreate = () => {
    setTargetCabang(null);
    setFormData({
      code: `CBG-00${cabangs.length + 1}`,
      name: '',
      address: '',
      city: 'South Jakarta',
      phone: '+62 8',
      managerName: '',
      openingHours: '08:00 - 22:00',
      dailyTarget: 5000000,
      activeStaff: 4,
      isActive: true,
      posTerminalStatus: 'Online',
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: CabangItem) => {
    setTargetCabang(c);
    setFormData({
      code: c.code,
      name: c.name,
      address: c.address,
      city: c.city,
      phone: c.phone,
      managerName: c.managerName,
      openingHours: c.openingHours,
      dailyTarget: c.dailyTarget,
      activeStaff: c.activeStaff,
      isActive: c.isActive,
      posTerminalStatus: c.posTerminalStatus,
    });
    setFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (c: CabangItem) => {
    setTargetCabang(c);
    setDetailModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (c: CabangItem) => {
    setTargetCabang(c);
    setDeleteModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (targetCabang) {
        await cabangsApi.update(targetCabang.id, {
          code: formData.code,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          manager_name: formData.managerName,
          opening_hours: formData.openingHours,
          is_active: formData.isActive,
        });
        showToast(`Branch ${formData.name} updated successfully!`);
      } else {
        await cabangsApi.create({
          code: formData.code,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          manager_name: formData.managerName,
          opening_hours: formData.openingHours,
          is_active: formData.isActive,
        });
        showToast(`Branch ${formData.name} added successfully!`);
      }
      setFormModalOpen(false);
      loadCabangs();
    } catch (err: any) {
      showToast('Failed to save branch: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!targetCabang) return;
    setIsSubmitting(true);
    try {
      await cabangsApi.delete(targetCabang.id);
      showToast(`Branch ${targetCabang.name} deleted successfully.`);
      setDeleteModalOpen(false);
      setTargetCabang(null);
      loadCabangs();
    } catch (err: any) {
      showToast('Failed to delete branch: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (id: number) => {
    const target = cabangs.find(c => c.id === id);
    if (!target) return;
    const nextState = !target.isActive;
    try {
      await cabangsApi.update(id, { is_active: nextState });
      setCabangs(cabangs.map(c => (c.id === id ? { ...c, isActive: nextState } : c)));
      showToast(`Operational status for ${target.name}: ${nextState ? 'Open' : 'Closed'}`);
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
          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
          color: '#fff', fontWeight: 700, fontSize: '13px',
          boxShadow: '0 10px 30px rgba(139,92,246,0.4)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '3px 10px', borderRadius: '100px', marginBottom: '8px' }}>
            <Store size={13} />
            DATABASE / OUTLETS & STORES
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px', color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif" }}>
            Branch Outlets & Store Managers
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--ph-text-muted)', margin: 0 }}>
            Manage store operational details, daily sales targets, POS connection status, and branch supervisors.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
            color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', boxShadow: '0 6px 18px rgba(139, 92, 246, 0.35)'
          }}
        >
          <Plus size={16} />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ padding: '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Total Store Outlets</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{cabangs.length} Branches</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>{cabangs.filter(c => c.isActive).length} active open stores</div>
        </div>
        <div style={{ padding: '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Total Network Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{fmt(cabangs.reduce((acc, c) => acc + c.dailyRevenue, 0))}</div>
          <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>Target: {fmt(cabangs.reduce((acc, c) => acc + c.dailyTarget, 0))}</div>
        </div>
        <div style={{ padding: '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Active On-Duty Staff</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#06b6d4', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{cabangs.reduce((acc, c) => acc + c.activeStaff, 0)} Baristas & Cashiers</div>
          <div style={{ fontSize: '11px', color: 'var(--ph-text-dim)' }}>Active shifts</div>
        </div>
        <div style={{ padding: '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>City Coverage</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>Jakarta & Bandung</div>
          <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 600 }}>Expansion Q4 2026</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ padding: '16px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ position: 'relative', width: isMobile ? '100%' : '360px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--ph-text-muted)' }} />
          <input
            type="text"
            placeholder="Search branch name, city, address, manager..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Central Jakarta', 'South Jakarta', 'Bandung'].map(city => (
            <button
              key={city}
              onClick={() => setCityFilter(city === 'All' ? 'All' : city)}
              style={{
                padding: '6px 12px', borderRadius: '100px', border: 'none',
                fontSize: '12px', fontWeight: cityFilter === city || (city === 'All' && cityFilter === 'All') ? 700 : 500,
                cursor: 'pointer',
                background: cityFilter === city || (city === 'All' && cityFilter === 'All') ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' : 'rgba(255,255,255,0.05)',
                color: cityFilter === city || (city === 'All' && cityFilter === 'All') ? '#fff' : 'var(--ph-text-muted)',
              }}
            >
              {city === 'All' ? 'All Regions' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Cabang Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
        {filtered.length === 0 ? (
          <EmptyState
            variant="card"
            icon={Store}
            title="No branches found"
            description="There are no store branches matching your current search or city filter."
            actionText="Add New Branch"
            onAction={handleOpenCreate}
          />
        ) : (
          paginatedCabangs.map(c => {
            return (
              <div
                key={c.id}
                style={{
                  padding: '24px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`,
                  display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden'
                }}
              >
                {/* Header inside card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                      <Store size={26} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 800, color: '#38bdf8' }}>{c.code}</span>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif" }}>
                        {c.name}
                      </h3>
                    </div>
                  </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '100px',
                    background: c.posTerminalStatus === 'Online' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: c.posTerminalStatus === 'Online' ? '#34d399' : '#f59e0b'
                  }}>
                    <Activity size={12} />
                    POS {c.posTerminalStatus}
                  </span>

                  <button
                    onClick={() => toggleActive(c.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '100px', border: 'none',
                      background: c.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: c.isActive ? '#34d399' : '#f87171',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {c.isActive ? 'Open' : 'Closed'}
                  </button>
                </div>
              </div>

              {/* Address & Info Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--ph-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={16} style={{ color: '#ec4899', flexShrink: 0, marginTop: '2px' }} />
                  <span>{c.address}, <strong>{c.city}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} style={{ color: '#06b6d4', flexShrink: 0 }} />
                  <span>Store Manager: <strong style={{ color: 'var(--ph-text)' }}>{c.managerName}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span>Operating Hours: {c.openingHours}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: `1px solid ${BORDER}`, paddingTop: '14px', marginTop: '4px' }}>
                <button
                  onClick={() => handleOpenDetail(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px', border: `1px solid ${BORDER}`,
                    backgroundColor: 'transparent', color: 'var(--ph-text)',
                    fontSize: '12.5px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Eye size={14} />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.3)',
                    backgroundColor: 'rgba(6,182,212,0.1)', color: '#06b6d4',
                    fontSize: '12.5px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleOpenDelete(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
                    backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    fontSize: '12.5px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Elegant Pagination for Cabang Cards */}
      <div style={{ borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <ElegantPagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="branches"
        />
      </div>

      {/* Create / Edit Modal */}
      {formModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '520px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: '28px', color: 'var(--ph-text)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0', fontFamily: "'Outfit', sans-serif" }}>
              {targetCabang ? 'Edit Branch Data' : 'Add New Branch'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Code</label>
                  <input
                    type="text" required value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Branch Name</label>
                  <input
                    type="text" required value={formData.name} placeholder="e.g. Munajat Drinks - Senopati"
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Address</label>
                <textarea
                  required value={formData.address} rows={2} placeholder="Complete street address..."
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>City Location</label>
                  <input
                    type="text" required value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Manager Name</label>
                  <input
                    type="text" required value={formData.managerName} placeholder="Supervisor in charge"
                    onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none' }}
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
                  style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && targetCabang && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: '28px', color: 'var(--ph-text)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800 }}>Delete Branch Confirmation</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ph-text-muted)' }}>
                Are you sure you want to delete <strong>{targetCabang.name}</strong> from the database?
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
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && targetCabang && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '440px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: '28px', color: 'var(--ph-text)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: 800 }}>Branch Outlet Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div><strong>Code:</strong> {targetCabang.code}</div>
              <div><strong>Name:</strong> {targetCabang.name}</div>
              <div><strong>Address:</strong> {targetCabang.address}, {targetCabang.city}</div>
              <div><strong>Manager:</strong> {targetCabang.managerName}</div>
              <div><strong>Operating Hours:</strong> {targetCabang.openingHours}</div>
              <div><strong>Status:</strong> {targetCabang.isActive ? 'Open' : 'Closed'}</div>
            </div>
            <button
              onClick={() => setDetailModalOpen(false)}
              style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
