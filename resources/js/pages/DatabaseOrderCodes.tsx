import React, { useState, useEffect } from 'react';
import {
  QrCode, Search, Filter, CheckCircle, Clock, XCircle,
  Plus, Eye, Download, FileText, ArrowUpRight, DollarSign,
  Store, Printer, Sparkles, RefreshCw, Edit2, Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import { CARD, BORDER } from '../theme';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { orderCodesApi, cabangsApi } from '../services/api';
import EmptyState from '../components/EmptyState';
import ElegantPagination from '../components/ElegantPagination';

export interface OrderItemEntry {
  name: string;
  qty: number;
  price: number;
  ice: string;
  topping?: string;
  toppingPrice?: number;
}

export interface OrderCodeItem {
  id: number;
  orderCode: string;
  cabangId?: number;
  cabangName: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'in_queue' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  items: OrderItemEntry[];
}

const fmt = (n: number) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function DatabaseOrderCodes() {
  const [orders, setOrders] = useState<OrderCodeItem[]>([]);
  const [cabangsList, setCabangsList] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetOrder, setTargetOrder] = useState<OrderCodeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    cabangId: 1,
    cabangName: 'Main Branch',
    drinkName: 'Es Kopi Susu Aren',
    drinkPrice: 25000,
    qty: 1,
    ice: 'Normal Ice (70%)',
    topping: 'Golden Boba Pearl',
    toppingPrice: 5000,
    paymentMethod: 'QRIS',
    orderStatus: 'preparing' as OrderCodeItem['orderStatus'],
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [orderRes, cabangRes] = await Promise.all([
        orderCodesApi.getAll(),
        cabangsApi.getAll(),
      ]);

      if (cabangRes.success && Array.isArray(cabangRes.data)) {
        setCabangsList(cabangRes.data.map(c => ({ id: c.id, name: c.name })));
      }

      if (orderRes.success && Array.isArray(orderRes.data)) {
        const mapped: OrderCodeItem[] = orderRes.data.map(o => ({
          id: o.id,
          orderCode: o.order_code,
          cabangId: o.cabang_id,
          cabangName: o.cabang?.name || (o.cabang_id ? `Branch #${o.cabang_id}` : 'Munajat Drinks Main'),
          customerName: o.customer_name || 'Walk-In Customer',
          totalAmount: Number(o.total_amount),
          paymentMethod: o.payment_method || 'QRIS',
          paymentStatus: o.payment_status || 'paid',
          orderStatus: o.order_status || 'completed',
          createdAt: o.created_at ? new Date(o.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : '2026-08-20 08:35',
          items: Array.isArray(o.items_data) && o.items_data.length > 0 ? o.items_data : [
            { name: 'Es Kopi Susu Aren', qty: 1, price: Number(o.total_amount), ice: 'Normal Ice (70%)' }
          ],
        }));
        setOrders(mapped);
      }
    } catch (err: any) {
      showToast('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.cabangName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Quick Status Update
  const handleUpdateStatus = async (id: number, newStatus: OrderCodeItem['orderStatus']) => {
    try {
      await orderCodesApi.update(id, { order_status: newStatus });
      setOrders(orders.map(o => (o.id === id ? { ...o, orderStatus: newStatus } : o)));
      showToast(`Order status updated to ${newStatus}!`);
    } catch (err: any) {
      showToast('Failed to update status: ' + err.message);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setTargetOrder(null);
    setFormData({
      customerName: '',
      cabangId: cabangsList[0]?.id || 1,
      cabangName: cabangsList[0]?.name || 'Main Branch',
      drinkName: 'Es Kopi Susu Aren',
      drinkPrice: 25000,
      qty: 1,
      ice: 'Normal Ice (70%)',
      topping: 'Golden Boba Pearl',
      toppingPrice: 5000,
      paymentMethod: 'QRIS',
      orderStatus: 'preparing',
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (o: OrderCodeItem) => {
    setTargetOrder(o);
    const firstItem = o.items[0] || { name: 'Es Kopi Susu Aren', price: 25000, qty: 1, ice: 'Normal Ice (70%)', topping: 'No Topping', toppingPrice: 0 };
    setFormData({
      customerName: o.customerName,
      cabangId: o.cabangId || 1,
      cabangName: o.cabangName,
      drinkName: firstItem.name,
      drinkPrice: firstItem.price || 25000,
      qty: firstItem.qty || 1,
      ice: firstItem.ice || 'Normal Ice (70%)',
      topping: firstItem.topping || 'No Topping',
      toppingPrice: firstItem.toppingPrice || 0,
      paymentMethod: o.paymentMethod,
      orderStatus: o.orderStatus,
    });
    setFormModalOpen(true);
  };

  // Open Receipt Modal
  const handleOpenReceipt = (o: OrderCodeItem) => {
    setTargetOrder(o);
    setReceiptModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (o: OrderCodeItem) => {
    setTargetOrder(o);
    setDeleteModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const total = (formData.drinkPrice + formData.toppingPrice) * formData.qty;
    const itemsData = [{
      name: formData.drinkName,
      qty: formData.qty,
      price: formData.drinkPrice,
      ice: formData.ice,
      topping: formData.topping,
      toppingPrice: formData.toppingPrice,
    }];

    try {
      if (targetOrder) {
        await orderCodesApi.update(targetOrder.id, {
          customer_name: formData.customerName,
          cabang_id: formData.cabangId,
          total_amount: total,
          payment_method: formData.paymentMethod,
          order_status: formData.orderStatus,
          items_data: itemsData,
        });
        showToast(`Order ${targetOrder.orderCode} updated successfully!`);
      } else {
        await orderCodesApi.create({
          cabang_id: formData.cabangId,
          customer_name: formData.customerName || 'Walk-In Customer',
          total_amount: total,
          payment_method: formData.paymentMethod,
          payment_status: 'paid',
          order_status: formData.orderStatus,
          items_data: itemsData,
        });
        showToast(`New Order Code generated successfully!`);
      }
      setFormModalOpen(false);
      loadOrders();
    } catch (err: any) {
      showToast('Failed to save order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!targetOrder) return;
    setIsSubmitting(true);
    try {
      await orderCodesApi.delete(targetOrder.id);
      showToast(`Order ${targetOrder.orderCode} deleted.`);
      setDeleteModalOpen(false);
      setTargetOrder(null);
      loadOrders();
    } catch (err: any) {
      showToast('Failed to delete order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: OrderCodeItem['orderStatus']) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', bg: 'rgba(16,185,129,0.15)', color: '#34d399', icon: CheckCircle };
      case 'ready':
        return { label: 'Ready', bg: 'rgba(6,182,212,0.15)', color: '#06b6d4', icon: CheckCircle };
      case 'preparing':
        return { label: 'Brewing', bg: 'rgba(249,115,22,0.15)', color: '#f97316', icon: Clock };
      default:
        return { label: 'In Queue', bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', icon: Clock };
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '3px 10px', borderRadius: '100px', marginBottom: '6px' }}>
            <QrCode size={13} />
            DATABASE / ORDER CODE ENGINE
          </div>
          <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.5px', color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif" }}>
            Order Codes & Cashier Transactions
          </h1>
          <p style={{ fontSize: isMobile ? '12px' : '13.5px', color: 'var(--ph-text-muted)', margin: 0 }}>
            Automated Order ID tracking, barista brewing queues, QRIS settlement, and receipt generation.
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
          <span>Generate New Order</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '16px' }}>
        <div style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Total Orders</div>
          <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{orders.length} Orders</div>
          <div style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 600 }}>Cloud database synced</div>
        </div>
        <div style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Brewing Now</div>
          <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: '#f97316', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{orders.filter(o => o.orderStatus === 'preparing').length} Orders</div>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-dim)' }}>Avg 3 mins per cup</div>
        </div>
        <div style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Ready for Pickup</div>
          <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: '#06b6d4', fontFamily: "'Outfit', sans-serif", margin: '4px 0' }}>{orders.filter(o => o.orderStatus === 'ready').length} Orders</div>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-dim)' }}>Awaiting pickup</div>
        </div>
        <div style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-muted)', fontWeight: 600 }}>Network Omset</div>
          <div style={{ fontSize: isMobile ? '16px' : '24px', fontWeight: 800, color: '#10b981', fontFamily: "'Outfit', sans-serif", margin: '4px 0', wordBreak: 'break-word' }}>{fmt(orders.reduce((acc, o) => acc + o.totalAmount, 0))}</div>
          <div style={{ fontSize: '10.5px', color: '#34d399', fontWeight: 600 }}>Settled</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        padding: '14px 16px', borderRadius: '16px', backgroundColor: CARD, border: `1px solid ${BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ position: 'relative', width: isMobile ? '100%' : '340px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--ph-text-muted)' }} />
          <input
            type="text"
            placeholder="Search order code (MNJ-...), customer, branch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '2px' }}>
          {[
            { id: 'All', label: 'All Status' },
            { id: 'in_queue', label: 'In Queue' },
            { id: 'preparing', label: 'Brewing' },
            { id: 'ready', label: 'Ready' },
            { id: 'completed', label: 'Completed' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              style={{
                padding: '6px 12px', borderRadius: '100px', border: 'none',
                background: statusFilter === s.id ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' : 'rgba(255,255,255,0.05)',
                color: statusFilter === s.id ? '#fff' : 'var(--ph-text-muted)',
                fontWeight: statusFilter === s.id ? 700 : 500, fontSize: '12px', cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ borderRadius: '18px', backgroundColor: CARD, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--ph-text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px' }}>Order Code</th>
                <th style={{ padding: '16px' }}>Customer & Branch</th>
                <th style={{ padding: '16px' }}>Drink Details</th>
                <th style={{ padding: '16px' }}>Total & Payment</th>
                <th style={{ padding: '16px' }}>Brewing Status</th>
                <th style={{ padding: '16px' }}>Quick Advance</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState
                  variant="table-row"
                  colSpan={7}
                  icon={QrCode}
                  title="No orders found"
                  description="There are no transactions matching your current search or filter criteria."
                  actionText="Generate New Order"
                  onAction={handleOpenCreate}
                />
              ) : (
                paginatedOrders.map(o => {
                const badge = getStatusBadge(o.orderStatus);
                const BadgeIcon = badge.icon;
                return (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <QrCode size={16} color="#38bdf8" />
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--ph-text)', fontSize: '13px' }}>
                          {o.orderCode}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--ph-text-muted)' }}>{o.createdAt}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--ph-text)' }}>{o.customerName}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--ph-text-muted)' }}>{o.cabangName}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {o.items.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '12px' }}>
                          <strong>{it.qty}x {it.name}</strong>
                          <div style={{ fontSize: '10.5px', color: 'var(--ph-text-dim)' }}>
                            {it.ice} {it.topping && `· ${it.topping}`}
                          </div>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#10b981' }}>{fmt(o.totalAmount)}</div>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', fontSize: '10.5px', fontWeight: 600 }}>
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '100px',
                        background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700
                      }}>
                        <BadgeIcon size={12} />
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {o.orderStatus === 'in_queue' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'preparing')}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'rgba(249,115,22,0.15)', color: '#f97316', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Brew Now →
                          </button>
                        )}
                        {o.orderStatus === 'preparing' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'ready')}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'rgba(6,182,212,0.15)', color: '#38bdf8', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Mark Ready →
                          </button>
                        )}
                        {o.orderStatus === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'completed')}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Complete ✓
                          </button>
                        )}
                        {o.orderStatus === 'completed' && (
                          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>Settled</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenReceipt(o)}
                          title="Print Receipt"
                          style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: "transparent", color: "#10b981", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(o)}
                          title="Edit Order"
                          style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: "transparent", color: "var(--ph-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(o)}
                          title="Delete Order"
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
          itemName="order codes"
        />
      </div>

      {/* Form Modal */}
      {formModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '12px' : '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: isMobile ? '20px 16px' : '28px', color: 'var(--ph-text)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0', fontFamily: "'Outfit', sans-serif" }}>
              {targetOrder ? 'Edit Order Data' : 'Generate New Order'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Customer Name</label>
                <input
                  type="text" required value={formData.customerName} placeholder="e.g. John Doe"
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Branch Outlet</label>
                <select
                  value={formData.cabangId}
                  onChange={e => setFormData({ ...formData, cabangId: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '14px' }}
                >
                  {cabangsList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Beverage Name</label>
                  <input
                    type="text" required value={formData.drinkName}
                    onChange={e => setFormData({ ...formData, drinkName: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--ph-bg)', border: `1px solid ${BORDER}`, color: 'var(--ph-text)', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Quantity</label>
                  <input
                    type="number" min={1} required value={formData.qty}
                    onChange={e => setFormData({ ...formData, qty: Number(e.target.value) })}
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
                  {isSubmitting ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModalOpen && targetOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '12px' : '20px' }}>
          <div style={{ width: '100%', maxWidth: '380px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: isMobile ? '20px 16px' : '28px', color: 'var(--ph-text)', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#10b981' }}>
              <Printer size={28} />
            </div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800 }}>Munajat Drinks Receipt</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--ph-text-muted)' }}>{targetOrder.orderCode} · {targetOrder.createdAt}</p>

            <div style={{ borderTop: `1px dashed ${BORDER}`, borderBottom: `1px dashed ${BORDER}`, padding: '14px 0', margin: '14px 0', textAlign: 'left', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Customer:</span>
                <strong>{targetOrder.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Branch:</span>
                <span>{targetOrder.cabangName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Total Paid:</span>
                <strong style={{ color: '#10b981' }}>{fmt(targetOrder.totalAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Method:</span>
                <span>{targetOrder.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
                setReceiptModalOpen(false);
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
            >
              Print Digital Receipt
            </button>
            <button
              onClick={() => setReceiptModalOpen(false)}
              style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '12px', border: `1px solid ${BORDER}`, background: 'transparent', color: 'var(--ph-text)', fontWeight: 600, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && targetOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '24px', backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: '28px', color: 'var(--ph-text)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800 }}>Delete Order?</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ph-text-muted)' }}>
                Are you sure you want to delete order <strong>{targetOrder.orderCode}</strong>?
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
