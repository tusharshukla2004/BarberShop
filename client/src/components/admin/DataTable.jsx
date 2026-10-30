import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  pageSize = 10,
  emptyTitle,
  emptyMessage,
  onEmptyAction,
  emptyActionLabel,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered rows by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => String(row[k] || '').toLowerCase().includes(term));
      }
      return Object.values(row).some((val) =>
        String(val || '').toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKeys]);

  // Paginated slice
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 rounded-md bg-white border border-border-light text-xs sm:text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="text-xs text-muted font-medium self-end sm:self-center">
          Showing {filteredData.length} total records
        </div>
      </div>

      {/* Table Container */}
      {filteredData.length === 0 ? (
        <EmptyState
          title={emptyTitle || 'No items found'}
          message={emptyMessage || 'Try adjusting your search criteria or filter options.'}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <div className="rounded-lg border border-border-light bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-card/70 border-b border-border-light text-[11px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className={`px-4 py-3.5 ${col.className || ''}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/60">
                {paginatedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-card/40 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 ${col.cellClassName || ''}`}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-card/40 border-t border-border-light text-xs">
              <span className="text-muted">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label="Previous page"
                  className="p-1.5 rounded border border-border-light bg-white text-ink hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label="Next page"
                  className="p-1.5 rounded border border-border-light bg-white text-ink hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      className: PropTypes.string,
      cellClassName: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  searchPlaceholder: PropTypes.string,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  pageSize: PropTypes.number,
  emptyTitle: PropTypes.string,
  emptyMessage: PropTypes.string,
  onEmptyAction: PropTypes.func,
  emptyActionLabel: PropTypes.string,
};
