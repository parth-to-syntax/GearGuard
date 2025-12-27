import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from 'lucide-react';

const DataTable = ({ 
  columns, 
  data, 
  onRowClick,
  loading = false,
  pagination,
  onPageChange
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-[rgba(255,255,255,0.03)] border-b border-[var(--card-border)] px-6 py-4">
            <div className="flex gap-4">
              {columns.map((_, i) => (
                <div key={i} className="h-4 bg-[rgba(255,255,255,0.08)] rounded flex-1" />
              ))}
            </div>
          </div>
          {/* Row Skeletons */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-[var(--card-border)]">
              <div className="flex gap-4">
                {columns.map((_, j) => (
                  <div key={j} className="h-4 bg-[rgba(255,255,255,0.05)] rounded flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-[var(--border-strong)] rounded-lg bg-transparent">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-transparent border-b border-[var(--border-strong)]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`
                    px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider
                    ${column.sortable !== false ? 'cursor-pointer hover:text-primary transition-colors' : ''}
                  `}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable !== false && sortConfig.key === column.key && (
                      <span className="text-[var(--brand-accent)]">
                        {sortConfig.direction === 'asc' 
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <p className="text-primary font-light">No data available</p>
                      <p className="text-sm text-muted mt-1">Records will appear here once created</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    hover:bg-[rgba(255,255,255,0.04)] transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${row.isOverdue ? 'bg-[var(--status-danger-bg)]' : ''}
                  `}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-2.5">
                      {column.render 
                        ? column.render(row[column.key], row)
                        : <span className="text-sm text-[var(--steel-700)] font-['DM_Sans']">{row[column.key]}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-strong)] bg-transparent">
          <p className="text-sm text-[var(--steel-600)] font-['DM_Sans']">
            Showing{' '}
            <span className="font-semibold text-[var(--steel-800)]">
              {((pagination.page - 1) * pagination.limit) + 1}
            </span>
            {' '}to{' '}
            <span className="font-medium text-primary">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            {' '}of{' '}
            <span className="font-medium text-primary">{pagination.total}</span> results
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-1 text-sm font-light text-primary bg-transparent rounded-md border border-[var(--border-subtle)]">
              {pagination.page} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
