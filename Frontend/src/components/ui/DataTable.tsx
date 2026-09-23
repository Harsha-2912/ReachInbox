import type { ReactNode } from 'react';
import { TableSkeleton } from './LoadingState';
import { EmptyState, ErrorState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: ReactNode;
  error?: string;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  empty,
  error,
  onRetry,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton rows={8} cols={columns.length} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (data.length === 0) {
    return <>{empty || <EmptyState title="No results" description="There are no items to display." />}</>;
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-[11px] font-semibold uppercase tracking-wider text-ink-600 px-5 py-3 ${col.headerClassName || ''}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200/60">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''} hover:bg-ink-50/50`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-3.5 text-[13px] text-ink-900 ${col.className || ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
