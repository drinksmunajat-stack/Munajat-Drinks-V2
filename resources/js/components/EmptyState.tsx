import React from 'react';
import { Inbox, LucideIcon } from 'lucide-react';
import { CARD, BORDER } from '../theme';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'card' | 'table-row' | 'compact';
  colSpan?: number;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no data records available or matching your current search criteria.',
  actionText,
  onAction,
  variant = 'card',
  colSpan = 6,
}: EmptyStateProps) {
  if (variant === 'table-row') {
    return (
      <tr>
        <td colSpan={colSpan} style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              maxWidth: '420px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Icon size={28} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ph-text)' }}>
              {title}
            </div>
            {description && (
              <div style={{ fontSize: '12.5px', color: 'var(--ph-text-muted)', lineHeight: 1.5 }}>
                {description}
              </div>
            )}
            {actionText && onAction && (
              <button
                onClick={onAction}
                style={{
                  marginTop: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                }}
              >
                {actionText}
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        style={{
          padding: '28px 16px',
          borderRadius: '14px',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: `1px dashed ${BORDER}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(16,185,129,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
          }}
        >
          <Icon size={20} />
        </div>
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ph-text)' }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: '11.5px', color: 'var(--ph-text-muted)', maxWidth: '280px' }}>
            {description}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '48px 24px',
        borderRadius: '20px',
        backgroundColor: CARD,
        border: `1.5px dashed ${BORDER}`,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '18px',
          backgroundColor: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10b981',
        }}
      >
        <Icon size={30} />
      </div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ph-text)', fontFamily: "'Outfit', sans-serif" }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: '13px', color: 'var(--ph-text-muted)', maxWidth: '380px', lineHeight: 1.5 }}>
          {description}
        </div>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
