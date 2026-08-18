import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button } from './Button.jsx';
import { EmptyState } from './EmptyState.jsx';

/**
 * Enterprise Data Table with built-in sorting, pagination, and empty state
 */
export const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  pageSize = 10,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display matching your criteria.',
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  if (!isLoading && data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon={Inbox} />;
  }

  return (
    <div className={`table-card ${className}`.trim()}>
      <div className="table-responsive">
        <table className="enterprise-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const rowKey = row[keyField] || rowIndex;
              return (
                <tr key={rowKey}>
                  {columns.map((col) => {
                    const cellKey = `${rowKey}-${col.key || col.header}`;
                    return (
                      <td key={cellKey} style={{ textAlign: col.align || 'left' }}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length > pageSize && (
        <div className="table-pagination">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={handlePrev}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={handleNext}
              icon={ChevronRight}
              iconPosition="right"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
