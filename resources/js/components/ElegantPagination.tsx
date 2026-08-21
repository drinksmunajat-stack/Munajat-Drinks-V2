import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { BORDER, CARD } from '../theme';

export interface ElegantPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export default function ElegantPagination({
  currentPage,
  totalItems,
  itemsPerPage = 5,
  onPageChange,
  itemName = 'entries',
}: ElegantPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // If there are 5 or fewer items, don't show pagination controls (only 1 page)
  if (totalItems <= itemsPerPage && totalPages <= 1) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderTop: `1px solid ${BORDER}`,
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          fontSize: '12.5px',
          color: 'var(--ph-text-muted)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>
          Showing <strong style={{ color: 'var(--ph-text)' }}>{totalItems}</strong> {itemName}
        </span>
        <span style={{ fontSize: '11.5px', opacity: 0.7 }}>All items displayed</span>
      </div>
    );
  }

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        borderTop: `1px solid ${BORDER}`,
        backgroundColor: 'rgba(255, 255, 255, 0.015)',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '13px',
      }}
    >
      {/* Left Info: Range & Total */}
      <div style={{ color: 'var(--ph-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>
          Showing <strong style={{ color: 'var(--ph-text)' }}>{startItem}</strong> to{' '}
          <strong style={{ color: 'var(--ph-text)' }}>{endItem}</strong> of{' '}
          <strong style={{ color: '#10b981' }}>{totalItems}</strong> {itemName}
        </span>
      </div>

      {/* Right: Elegant Page Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            border: `1px solid ${BORDER}`,
            backgroundColor: 'transparent',
            color: currentPage === 1 ? 'var(--ph-text-muted)' : 'var(--ph-text)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.35 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
          style={{
            padding: '0 10px',
            height: '32px',
            borderRadius: '9px',
            border: `1px solid ${BORDER}`,
            backgroundColor: 'transparent',
            color: currentPage === 1 ? 'var(--ph-text-muted)' : 'var(--ph-text)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.35 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        {/* Number buttons */}
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0 6px',
                  color: 'var(--ph-text-muted)',
                  fontSize: '12px',
                  userSelect: 'none',
                }}
              >
                •••
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: '32px',
                height: '32px',
                padding: '0 8px',
                borderRadius: '9px',
                border: isActive ? 'none' : `1px solid ${BORDER}`,
                background: isActive
                  ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--ph-text)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 3px 10px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
          style={{
            padding: '0 10px',
            height: '32px',
            borderRadius: '9px',
            border: `1px solid ${BORDER}`,
            backgroundColor: 'transparent',
            color: currentPage === totalPages ? 'var(--ph-text-muted)' : 'var(--ph-text)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.35 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            border: `1px solid ${BORDER}`,
            backgroundColor: 'transparent',
            color: currentPage === totalPages ? 'var(--ph-text-muted)' : 'var(--ph-text)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.35 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}
