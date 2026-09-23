import type { ReactNode } from 'react';
import { Inbox, Search, FileQuestion } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-ink-50 border border-ink-200 text-ink-500 mb-4">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h3 className="text-[16px] font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-[13px] text-ink-600 max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={<Plus className="w-4 h-4" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// avoid extra import
import { Plus } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-error-soft border border-error/20 text-error mb-4">
        <FileQuestion className="w-5 h-5" />
      </div>
      <h3 className="text-[16px] font-semibold text-ink-900 mb-1">Something went wrong</h3>
      <p className="text-[13px] text-ink-600 max-w-sm mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function SearchEmptyState() {
  return (
    <EmptyState
      icon={<Search className="w-5 h-5" />}
      title="No emails found"
      description="Try a different search term or adjust your filters."
    />
  );
}
