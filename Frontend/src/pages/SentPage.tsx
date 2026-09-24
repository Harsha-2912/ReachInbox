import { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, Eye, RotateCcw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { emailService } from '@/services/email.service';
import { formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import type { Email, Pagination } from '@/types';

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Sent', value: 'sent' },
  { label: 'Failed', value: 'failed' },
];

export function SentPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await emailService.getSentEmails({
        status: filter as 'all' | 'sent' | 'failed',
        search, page, pageSize: 10,
      });
      setEmails(res.data);
      setPagination(res.pagination);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const handleRetry = async (id: string) => {
    try {
      await emailService.retryEmail(id);
      toast.success('Email queued for retry');
      fetchEmails();
    } catch {
      toast.error('Failed to retry email');
    }
  };

  const columns: Column<Email>[] = [
    { key: 'recipient', header: 'Recipient', render: (r) => <span className="font-medium text-ink-900">{r.recipient}</span> },
    { key: 'subject', header: 'Subject', render: (r) => <span className="text-ink-700 truncate block max-w-[220px]">{r.subject}</span> },
    { key: 'campaign', header: 'Campaign', render: (r: any) => <span className="text-ink-600">{r.campaignName || r.campaign?.subject || r.campaign?.name || 'General Campaign'}</span> },
    { key: 'time', header: 'Sent Time', render: (r: any) => <span className="text-ink-600">{formatDateTime(r.sentTime || r.sentAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} size="sm" /> },
    {
      key: 'actions', header: '', headerClassName: 'text-right', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end">
          {r.status === 'failed' ? (
            <Dropdown width={170} trigger={
              <button className="flex items-center justify-center w-7 h-7 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }>
              <DropdownItem icon={<AlertCircle className="w-4 h-4" />}>View Error</DropdownItem>
              <DropdownItem icon={<RotateCcw className="w-4 h-4" />} onClick={() => handleRetry(r.id)}>Retry</DropdownItem>
            </Dropdown>
          ) : (
            <Dropdown width={140} trigger={
              <button className="flex items-center justify-center w-7 h-7 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }>
              <DropdownItem icon={<Eye className="w-4 h-4" />}>View</DropdownItem>
            </Dropdown>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sent Emails"
        subtitle="Review emails that have already been processed."
        actionLabel="Compose New Email"
        actionTo="/compose"
      />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 pt-5 pb-4 border-b border-ink-200">
          <div className="flex items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className={`text-[13px] font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                  filter === f.value
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-ink-600 border-ink-200 hover:border-ink-400 hover:text-ink-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto w-full sm:w-[260px]">
            <SearchBar
              placeholder="Search sent emails..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onClear={() => { setSearch(''); setPage(1); }}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={emails}
          loading={loading}
          error={error ? 'Unable to load sent emails.' : undefined}
          onRetry={fetchEmails}
          empty={
            <EmptyState
              title="No sent emails yet."
              description="Your sent emails will appear here once campaigns start sending."
              actionLabel="Create New Campaign"
              onAction={() => window.location.href = '/compose'}
            />
          }
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-ink-200">
            <p className="text-[12px] text-ink-600">
              Showing {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-[13px] font-medium px-3 py-1.5 rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="text-[13px] font-medium px-3 py-1.5 rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
