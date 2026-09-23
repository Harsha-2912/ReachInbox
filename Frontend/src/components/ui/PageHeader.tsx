import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTo?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, actionLabel, onAction, actionTo, extra }: PageHeaderProps) {
  const actionButton = actionLabel && (
    actionTo ? (
      <Link
        to={actionTo}
        className="inline-flex items-center justify-center font-medium transition-all duration-150 h-10 px-4 text-[13px] gap-2 rounded-xl bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 border border-transparent whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </Link>
    ) : (
      <button
        onClick={onAction}
        className="inline-flex items-center justify-center font-medium transition-all duration-150 h-10 px-4 text-[13px] gap-2 rounded-xl bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 border border-transparent whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </button>
    )
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
      <div className="min-w-0">
        <h1 className="text-page text-ink-900">{title}</h1>
        {subtitle && <p className="text-[14px] text-ink-600 mt-1.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {extra}
        {actionButton}
      </div>
    </div>
  );
}
