import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Sparkles, CheckCircle, XCircle, Edit2, Trash2,
  Snowflake, Percent, Coffee, Thermometer, ShieldCheck, Zap, Eye, AlertTriangle, Loader2
} from 'lucide-react';
import { CARD, BORDER } from '../theme';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { iceLevelsApi } from '../services/api';
import EmptyState from '../components/EmptyState';
import ElegantPagination from '../components/ElegantPagination';

export interface IceLevelItem {
  id: number;
  name: string;
  percentage: number;
  description: string;
  sweetnessImpact?: string;
  isActive: boolean;
  orderShare?: number;
  recommendedFor?: string;
}

const DEFAULT_ICE_LEVELS: IceLevelItem[] = [
  { id: 1, name: "Normal Ice (70%)", percentage: 70, description: "Standard chilled ratio, most popular and balanced", sweetnessImpact: "80% Sweetness (Standard)", isActive: true, orderShare: 44, recommendedFor: "Matcha Latte, All Menus" },
  { id: 2, name: "Less Ice (30%)", percentage: 30, description: "Light ice cubes for a bolder coffee flavor profile", sweetnessImpact: "90% Sweetness (Balanced)", isActive: true, orderShare: 36, recommendedFor: "Brown Sugar Latte" },
  { id: 3, name: "No Ice (0%)", percentage: 0, description: "Unchilled room temperature, perfect for takeaway", sweetnessImpact: "100% Bold Sweetness", isActive: true, orderShare: 12, recommendedFor: "Espresso Tonic, Takeaway" },
  { id: 4, name: "Extra Ice (100%)", percentage: 100, description: "Maximum chill for extra refreshment on hot days", sweetnessImpact: "70% Sweetness (Fresh)", isActive: true, orderShare: 8, recommendedFor: "Frappe Blended, Sparkling Tea" },
];

export default function DatabaseIceLevels() {
  const [iceLevels, setIceLevels] = useState<IceLevelItem[]>(DEFAULT_ICE_LEVELS);
  const [loading, setLoading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<IceLevelItem>(DEFAULT_ICE_LEVELS[0]);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetIce, setTargetIce] = useState<IceLevelItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    percentage: 70,
    description: '',
    sweetnessImpact: '80% Sweetness',
    isActive: true,
    recommendedFor: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const loadIceLevels = async () => {
    setLoading(true);
    try {
      const res = await iceLevelsApi.getAll();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: IceLevelItem[] = res.data.map((item, idx) => ({
          id: item.id || idx + 1,
          name: item.name || `Ice Level ${item.percentage}%`,
          percentage: Number(item.percentage ?? 50),
          description: item.description || 'Munajat Drinks standard ice preset',
          sweetnessImpact: Number(item.percentage) === 0 ? '100% Bold Sweetness' : (Number(item.percentage) <= 30 ? '90% Sweetness (Balanced)' : (Number(item.percentage) <= 70 ? '80% Sweetness (Standard)' : '70% Sweetness (Fresh)')),
          isActive: Boolean(item.is_active ?? true),
          orderShare: Number(item.percentage) === 70 ? 44 : (Number(item.percentage) === 30 ? 36 : (Number(item.percentage) === 0 ? 12 : 8)),
          recommendedFor: Number(item.percentage) === 0 ? 'Espresso Tonic, Takeaway' : (Number(item.percentage) === 30 ? 'Brown Sugar Latte' : (Number(item.percentage) === 70 ? 'Matcha Latte, All Menus' : 'Frappe Blended')),
        }));
        setIceLevels(mapped);
        setSelectedPreview(mapped[0]);
      }
    } catch (err: any) {
      console.warn('Failed to load ice levels from DB, using presets:', err);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadIceLevels();
  }, []);

  const paginatedIceLevels = iceLevels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Open Create Modal
  const handleOpenCreate = () => {
    setTargetIce(null);
    setFormData({
      name: '',
      percentage: 50,
      description: '',
      sweetnessImpact: '85% Sweetness',
      isActive: true,
      recommendedFor: '',
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: IceLevelItem) => {
    setTargetIce(item);
    setFormData({
      name: item.name,
      percentage: item.percentage,
      description: item.description,
      sweetnessImpact: item.sweetnessImpact || '80% Sweetness',
      isActive: item.isActive,
      recommendedFor: item.recommendedFor || '',
    });
    setFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (item: IceLevelItem) => {
    setTargetIce(item);
    setDetailModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (item: IceLevelItem) => {
    setTargetIce(item);
    setDeleteModalOpen(true);
  };

  // Save Ice Level
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (targetIce) {
        await iceLevelsApi.update(targetIce.id, {
          name: formData.name,
          percentage: formData.percentage,
          description: formData.description,
          is_active: formData.isActive,
        });
        showToast(`Ice preset ${formData.name} updated successfully!`);
      } else {
        await iceLevelsApi.create({
          name: formData.name,
          percentage: formData.percentage,
          description: formData.description,
          is_active: formData.isActive,
        });
        showToast(`Ice preset ${formData.name} created successfully!`);
      }
      setFormModalOpen(false);
      loadIceLevels();
    } catch (err: any) {
      showToast('Failed to save ice preset: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!targetIce) return;
    setIsSubmitting(true);
    try {
      await iceLevelsApi.delete(targetIce.id);
      showToast(`Ice preset ${targetIce.name} deleted.`);
      setDeleteModalOpen(false);
      setTargetIce(null);
      loadIceLevels();
    } catch (err: any) {
      showToast('Failed to delete ice preset: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewItem = selectedPreview || iceLevels[0] || DEFAULT_ICE_LEVELS[0];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 120,
          padding: '14px 22px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          color: '#fff', fontWeight: 700, fontSize: '13px',
          boxShadow: '0 10px 30px rgba(6,182,212,0.4)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#06b6d4', background: 'rgba(6,182,212,0.12)', padding: '3px 10px', borderRadius: '100px', marginBottom: '8px' }}>
            <Snowflake size={13} />
            DATABASE / ICE LEVEL PRESETS
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px', color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif" }}>
            Ice Levels & Dilution Presets
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--ph-text-muted)', margin: 0 }}>
            Configure ice ratio standards, sweetness dilution impact, and cup visualizer parameters.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', boxShadow: '0 6px 18px rgba(6, 182, 212, 0.35)'
          }}
        >
          <Plus size={16} />
          <span>Add New Ice Preset</span>
        </button>
      </div>

      {/* Interactive Cup Visualizer & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 2fr', gap: '20px' }}>

        {/* Cup Simulator Card */}
        <div style={{ padding: '24px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', position: 'relative' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} />
            Cup Ratio Simulator (16oz)
          </div>

          {/* Graphical Cup */}
          <div style={{ position: 'relative', width: '140px', height: '190px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Cup Lid */}
            <div style={{ width: '130px', height: '14px', borderRadius: '8px 8px 0 0', background: 'rgba(255,255,255,0.2)', border: `1px solid ${BORDER}` }} />
            {/* Cup Body */}
            <div style={{
              width: '120px', height: '170px',
              borderLeft: '4px solid rgba(255,255,255,0.2)',
              borderRight: '4px solid rgba(255,255,255,0.2)',
              borderBottom: '4px solid rgba(255,255,255,0.2)',
              borderRadius: '0 0 16px 16px',
              position: 'relative', overflow: 'hidden',
              background: 'rgba(255,255,255,0.03)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
            }}>
              {/* Drink Liquid */}
              <div style={{ width: '100%', height: '85%', background: 'linear-gradient(180deg, #78350f 0%, #451a03 100%)', position: 'relative', opacity: 0.9 }}>
                {/* Ice Cubes inside */}
                {previewItem.percentage > 0 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%',
                    height: `${previewItem.percentage}%`,
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(2px)',
                    display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '6px',
                    justifyContent: 'center', alignItems: 'center'
                  }}>
                    {Array.from({ length: Math.ceil(previewItem.percentage / 18) }).map((_, i) => (
                      <div key={i} style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ph-text)' }}>{previewItem.name}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>{previewItem.percentage}% Ice Ratio</div>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>{previewItem.sweetnessImpact}</div>
          </div>
        </div>

        {/* Ice Presets Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {iceLevels.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', width: '100%' }}>
              <EmptyState
                icon={Snowflake}
                title="No ice presets found"
                description="There are no ice level presets currently stored in the database."
                actionText="Add New Ice Preset"
                onAction={handleOpenCreate}
              />
            </div>
          ) : (
            paginatedIceLevels.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedPreview(item)}
              style={{
                padding: '20px', borderRadius: '20px', backgroundColor: CARD,
                border: previewItem.id === item.id ? '2px solid #06b6d4' : `1px solid ${BORDER}`,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px',
                position: 'relative', transition: 'all 0.2s',
                boxShadow: previewItem.id === item.id ? '0 0 24px rgba(6,182,212,0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: item.percentage === 0 ? 'rgba(249,115,22,0.15)' : 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.percentage === 0 ? '#f97316' : '#06b6d4' }}>
                    <Snowflake size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--ph-text)' }}>
                      {item.name}
                    </h3>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', backgroundColor: 'rgba(6,182,212,0.15)', color: '#38bdf8' }}>
                      {item.percentage}% Ice Ratio
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 700, color: item.isActive ? '#34d399' : '#f87171' }}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--ph-text-muted)', lineHeight: 1.5, margin: 0 }}>
                {item.description}
              </p>

              <div style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 600 }}>
                🍯 {item.sweetnessImpact}
              </div>

              {/* Gauge */}
              <div>
                <div style={{ width: '100%', height: '6px', borderRadius: '100px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percentage}%`, height: '100%', background: item.percentage === 0 ? '#f97316' : 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)', borderRadius: '100px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: '10px', marginTop: '2px' }}>
                <span style={{ fontSize: '11px', color: 'var(--ph-text-dim)' }}>Share: {item.orderShare}% orders</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenDetail(item); }}
                    title="View Details"
                    style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${BORDER}`, background: 'transparent', color: '#38bdf8', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Details
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                    title="Edit Preset"
                    style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${BORDER}`, background: 'transparent', color: 'var(--ph-text-muted)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenDelete(item); }}
                    title="Delete Preset"
                    style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${BORDER}`, background: 'transparent', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )))}
        </div>

        {/* Elegant Pagination for Ice Levels */}
        <div style={{ gridColumn: '1 / -1', borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          <ElegantPagination
            currentPage={currentPage}
            totalItems={iceLevels.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName="ice presets"
          />
        </div>

      </div>

      {/* Form Modal (Create / Edit) */}
      {formModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '460px', backgroundColor: CARD, borderRadius: '24px', border: `1px solid ${BORDER}`, padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '17px', color: 'var(--ph-text)' }}>
                <Snowflake size={20} color="#06b6d4" />
                <span>{targetIce ? 'Edit Ice Level Preset' : 'Add New Ice Level Preset'}</span>
              </div>
              <button onClick={() => setFormModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ph-text-muted)', cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ph-text-muted)', display: 'block', marginBottom: '6px' }}>Preset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Normal Ice (70%)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ph-text-muted)' }}>Ice Ratio Percentage</label>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>{formData.percentage}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={formData.percentage}
                  onChange={e => {
                    const p = Number(e.target.value);
                    const sweetness = p === 0 ? '100% Bold Sweetness' : (p <= 30 ? '90% Sweetness (Balanced)' : (p <= 70 ? '80% Sweetness (Standard)' : '70% Sweetness (Fresh)'));
                    setFormData({ ...formData, percentage: p, sweetnessImpact: sweetness });
                  }}
                  style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ph-text-muted)', display: 'block', marginBottom: '6px' }}>Flavor Impact Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explanation of dilution effect on drink flavor..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '13px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ accentColor: '#06b6d4', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isActiveCheck" style={{ fontSize: '13px', color: 'var(--ph-text)', cursor: 'pointer', fontWeight: 600 }}>Active in Cashier Menu</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setFormModalOpen(false)} style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: 'transparent', color: 'var(--ph-text)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
                  <span>{targetIce ? 'Save Changes' : 'Create Preset'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && targetIce && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: CARD, borderRadius: '24px', border: `1px solid ${BORDER}`, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ph-text)' }}>Ice Preset Details</h3>
              <button onClick={() => setDetailModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ph-text-muted)', cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--ph-text-muted)' }}>
              <div><strong style={{ color: 'var(--ph-text)' }}>Name:</strong> {targetIce.name}</div>
              <div><strong style={{ color: 'var(--ph-text)' }}>Ratio:</strong> {targetIce.percentage}%</div>
              <div><strong style={{ color: 'var(--ph-text)' }}>Description:</strong> {targetIce.description}</div>
              <div><strong style={{ color: 'var(--ph-text)' }}>Flavor Impact:</strong> {targetIce.sweetnessImpact}</div>
              <div><strong style={{ color: 'var(--ph-text)' }}>Recommended For:</strong> {targetIce.recommendedFor || 'All Beverage Menus'}</div>
              <div><strong style={{ color: 'var(--ph-text)' }}>Status:</strong> <span style={{ color: targetIce.isActive ? '#34d399' : '#f87171', fontWeight: 700 }}>{targetIce.isActive ? 'Active' : 'Inactive'}</span></div>
            </div>
            <button onClick={() => setDetailModalOpen(false)} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && targetIce && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '380px', backgroundColor: CARD, borderRadius: '24px', border: `1px solid ${BORDER}`, padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--ph-text)' }}>Delete Ice Preset?</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ph-text-muted)' }}>
              Are you sure you want to delete preset <strong>{targetIce.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button onClick={() => setDeleteModalOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1px solid ${BORDER}`, background: 'transparent', color: 'var(--ph-text)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmDelete} disabled={isSubmitting} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
