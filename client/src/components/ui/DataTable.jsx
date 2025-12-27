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
      <div className="bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-[var(--steel-50)] border-b border-[var(--border-default)] px-6 py-4">
            <div className="flex gap-4">
              {columns.map((_, i) => (
                <div key={i} className="h-4 bg-[var(--steel-200)] rounded flex-1" />
              ))}
            </div>
          </div>
          {/* Row Skeletons */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex gap-4">
                {columns.map((_, j) => (
                  <div key={j} className="h-4 bg-[var(--steel-100)] rounded flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--steel-50)] border-b border-[var(--border-default)]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`
                    px-6 py-4 text-left text-xs font-semibold text-[var(--steel-500)] uppercase tracking-wider font-['DM_Sans']
                    ${column.sortable !== false ? 'cursor-pointer hover:bg-[var(--steel-100)] hover:text-[var(--steel-700)] transition-all' : ''}
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
                    <div className="w-16 h-16 bg-[var(--steel-100)] rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-[var(--steel-400)]" />
                    </div>
                    <div>
                      <p className="text-[var(--steel-700)] font-semibold font-['Sora']">No data available</p>
                      <p className="text-sm text-[var(--steel-500)] mt-1 font-['DM_Sans']">Records will appear here once created</p>
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
                    hover:bg-[var(--brand-accent-muted)] transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${row.isOverdue ? 'bg-[var(--status-danger-bg)]' : ''}
                  `}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-default)] bg-[var(--steel-50)]">
          <p className="text-sm text-[var(--steel-600)] font-['DM_Sans']">
            Showing{' '}
            <span className="font-semibold text-[var(--steel-800)]">
              {((pagination.page - 1) * pagination.limit) + 1}
            </span>
            {' '}to{' '}
            <span className="font-semibold text-[var(--steel-800)]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            {' '}of{' '}
            <span className="font-semibold text-[var(--steel-800)]">{pagination.total}</span> results
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-[var(--steel-500)] hover:bg-[var(--steel-200)] hover:text-[var(--steel-700)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg text-[var(--steel-500)] hover:bg-[var(--steel-200)] hover:text-[var(--steel-700)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-4 py-1.5 text-sm font-semibold text-[var(--steel-700)] bg-white rounded-lg border border-[var(--border-default)] font-['DM_Sans']">
              {pagination.page} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg text-[var(--steel-500)] hover:bg-[var(--steel-200)] hover:text-[var(--steel-700)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg text-[var(--steel-500)] hover:bg-[var(--steel-200)] hover:text-[var(--steel-700)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
