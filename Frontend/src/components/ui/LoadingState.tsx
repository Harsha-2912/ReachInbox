export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-ink-200">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="skeleton h-4 rounded"
              style={{ width: `${15 + ((j * 7 + i * 3) % 20)}%`, flex: j === 0 ? 0 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-ink-200 rounded-xl2 p-5">
          <div className="skeleton h-3.5 w-20 rounded mb-3" />
          <div className="skeleton h-7 w-24 rounded mb-4" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ButtonSkeleton() {
  return <div className="skeleton h-10 w-40 rounded-xl" />;
}

export function TextSkeleton({ width = '100%' }: { width?: string }) {
  return <div className="skeleton h-4 rounded" style={{ width }} />;
}
