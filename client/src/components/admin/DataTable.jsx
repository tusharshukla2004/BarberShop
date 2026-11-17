import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

function getSearchableText(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(getSearchableText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(getSearchableText).join(' ');
  return String(value);
}

export default function DataTable({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  searchKey,
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
    const keysToSearch = searchKeys.length > 0 ? searchKeys : searchKey ? [searchKey] : [];

    return data.filter((row) => {
      if (keysToSearch.length > 0) {
        return keysToSearch.some((key) => getSearchableText(row[key]).toLowerCase().includes(term));
      }
      return Object.values(row).some((value) => getSearchableText(value).toLowerCase().includes(term));
    });
  }, [data, searchTerm, searchKey, searchKeys]);

  // Paginated slice
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const page = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-border-light/90 shadow-2xs">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3.5 py-2 rounded-lg bg-card/50 border border-border-light text-xs sm:text-sm text-ink placeholder-muted/80 focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-muted font-medium self-end sm:self-center" aria-live="polite">
          Showing{' '}
          <span className="font-semibold text-ink">
            {filteredData.length === 0 ? 0 : (page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, filteredData.length)}
          </span>{' '}
          of <span className="font-semibold text-ink">{filteredData.length}</span> records
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
        <div className="rounded-xl border border-border-light/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-sand/30 border-b border-border-light text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key || col.header} className={`px-4 py-3.5 ${col.className || ''}`}>
                      {col.label || col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/50">
                {paginatedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-sand/15 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td key={col.key || col.header} className={`px-4 py-3.5 ${col.cellClassName || ''}`}>
                        {col.accessor
                          ? col.accessor(row, data.indexOf(row))
                          : col.render
                            ? col.render(row[col.key], row)
                            : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-sand/20 border-t border-border-light text-xs">
              <span className="text-muted font-medium">
                Page <span className="font-bold text-ink">{page}</span> of {totalPages}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label="Previous page"
                  className="p-1.5 rounded-md border border-border-light bg-white text-ink hover:bg-sand/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label="Next page"
                  className="p-1.5 rounded-md border border-border-light bg-white text-ink hover:bg-sand/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
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
      key: PropTypes.string,
      label: PropTypes.string,
      header: PropTypes.string,
      className: PropTypes.string,
      cellClassName: PropTypes.string,
      render: PropTypes.func,
      accessor: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  searchPlaceholder: PropTypes.string,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  searchKey: PropTypes.string,
  pageSize: PropTypes.number,
  emptyTitle: PropTypes.string,
  emptyMessage: PropTypes.string,
  onEmptyAction: PropTypes.func,
  emptyActionLabel: PropTypes.string,
};
