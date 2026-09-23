import type { EmailStatus, CampaignStatus } from '@/types';

type StatusType = EmailStatus | CampaignStatus;

const statusConfig: Record<StatusType, { label: string; className: string; dotClass: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-ink-50 text-ink-700 border-ink-200', dotClass: 'bg-ink-400' },
  pending: { label: 'Pending', className: 'bg-ink-50 text-ink-700 border-ink-200', dotClass: 'bg-ink-400' },
  processing: { label: 'Processing', className: 'bg-info-soft text-info border-info/20', dotClass: 'bg-info' },
  rate_limited: { label: 'Rate Limited', className: 'bg-warning-soft text-warning border-warning/20', dotClass: 'bg-warning' },
  sent: { label: 'Sent', className: 'bg-success-soft text-success border-success/20', dotClass: 'bg-success' },
  failed: { label: 'Failed', className: 'bg-error-soft text-error border-error/20', dotClass: 'bg-error' },
  active: { label: 'Active', className: 'bg-success-soft text-success border-success/20', dotClass: 'bg-success' },
  completed: { label: 'Completed', className: 'bg-ink-50 text-ink-700 border-ink-200', dotClass: 'bg-ink-400' },
  draft: { label: 'Draft', className: 'bg-ink-50 text-ink-600 border-ink-200', dotClass: 'bg-ink-400' },
  paused: { label: 'Paused', className: 'bg-warning-soft text-warning border-warning/20', dotClass: 'bg-warning' },
};

export function StatusBadge({ status, size = 'md' }: { status: StatusType; size?: 'sm' | 'md' }) {
  const config = statusConfig[status] || statusConfig.scheduled;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-[12px] px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  const variants = {
    default: 'bg-ink-50 text-ink-600 border-ink-200',
    primary: 'bg-ink-900 text-white border-transparent',
    success: 'bg-success-soft text-success border-success/20',
    warning: 'bg-warning-soft text-warning border-warning/20',
    error: 'bg-error-soft text-error border-error/20',
  };
  return (
    <span className={`inline-flex items-center text-[12px] font-medium rounded-full border px-2.5 py-0.5 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
