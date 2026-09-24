import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/EmptyState';
import { searchService } from '@/services/search.service';
import { mockDb } from '@/services/mockData';
import { formatDateTime } from '@/lib/format';
import type { Email, EmailFilterStatus, Pagination } from '@/types';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState<EmailFilterStatus>('all');
  const [campaign, setCampaign] = useState('all');
  const [sender, setSender] = useState('all');
  const [results, setResults] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  const doSearch = useCallback(async () => {
    if (!query.trim() && status === 'all' && campaign === 'all' && sender === 'all') {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setError(false);
    setHasSearched(true);
    try {
      const res = await searchService({ search: query, status, campaign, sender, page, pageSize: 10 });
      setResults(res.data);
      setPagination(res.pagination);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query, status, campaign, sender, page]);

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => { doSearch(); }, 350);
    return () => clearTimeout(timer);
  }, [doSearch]);

  const columns: Column<Email>[] = [
    { key: 'recipient', header: 'Recipient', render: (r) => <span className="font-medium text-ink-900">{r.recipient}</span> },
    { key: 'subject', header: 'Subject', render: (r) => <span className="text-ink-700 truncate block max-w-[240px]">{r.subject}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} size="sm" /> },
    { key: 'scheduled', header: 'Scheduled', render: (r: any) => <span className="text-ink-600">{formatDateTime(r.scheduledTime || r.scheduledAt)}</span> },
    { key: 'sent', header: 'Sent', render: (r: any) => <span className="text-ink-600">{formatDateTime(r.sentTime || r.sentAt)}</span> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Search Emails"
        subtitle="Find any email across all your campaigns and sending history."
      />

      {/* Search input */}
      <Card className="mb-5 p-5">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by recipient, subject or content..."
            className="w-full h-12 pl-12 pr-4 text-[15px] text-ink-900 bg-white border border-ink-200 rounded-xl transition-colors placeholder:text-ink-500 hover:border-ink-400 focus:border-ink-900 focus:ring-2 focus:ring-ink-900/5"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-ink-500" />
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => { setStatus(e.target.value as EmailFilterStatus); setPage(1); }}
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
            <option value="rate_limited">Rate Limited</option>
          </Select>
          <Select
            label="Campaign"
            value={campaign}
            onChange={(e) => { setCampaign(e.target.value); setPage(1); }}
          >
            <option value="all">All campaigns</option>
            {mockDb.campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            label="Sender"
            value={sender}
            onChange={(e) => { setSender(e.target.value); setPage(1); }}
          >
            <option value="all">All senders</option>
            {mockDb.senders.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Results */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-ink-200">
          <h3 className="text-section text-ink-900">Results</h3>
          <p className="text-[13px] text-ink-600 mt-0.5">
            {loading ? 'Searching...' : hasSearched ? `${pagination?.total || results.length} emails found` : 'Enter a search term or select filters to begin'}
          </p>
        </div>

        {error ? (
          <ErrorState message="Search failed. Please try again." onRetry={doSearch} />
        ) : !hasSearched && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-ink-50 border border-ink-200 text-ink-500 mb-4">
              <SearchIcon className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-semibold text-ink-900 mb-1">Start searching</h3>
            <p className="text-[13px] text-ink-600 max-w-sm">Search by recipient, subject, or content to find emails across your campaigns.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={results}
            loading={loading}
            empty={<EmptyState icon={<SearchIcon className="w-5 h-5" />} title="No emails found" description="Try a different search term or adjust your filters." />}
          />
        )}

        {pagination && pagination.totalPages > 1 && !loading && (
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
