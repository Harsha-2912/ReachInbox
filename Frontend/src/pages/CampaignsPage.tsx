import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoreHorizontal, Eye, RotateCcw, Pause, Users, Send, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { campaignService } from '@/services/campaign.service';
import { formatNumber, formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import type { Campaign, CampaignStatus } from '@/types';

const titleMap: Record<string, { title: string; subtitle: string }> = {
  all: { title: 'All Campaigns', subtitle: 'View and manage all your email campaigns.' },
  active: { title: 'Active Campaigns', subtitle: 'Campaigns currently sending emails.' },
  completed: { title: 'Completed Campaigns', subtitle: 'Campaigns that have finished sending.' },
  failed: { title: 'Failed Campaigns', subtitle: 'Campaigns that encountered errors.' },
};

export function CampaignsPage() {
  const { status } = useParams<{ status?: string }>();
  const filterStatus = (status as CampaignStatus | undefined) || 'all';
  const meta = titleMap[filterStatus] || titleMap.all;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await campaignService.getCampaigns(filterStatus as CampaignStatus | 'all');
      setCampaigns(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handlePause = (id: string) => toast.info('Campaign paused');
  const handleRetry = (id: string) => toast.success('Campaign retry initiated');

  const columns: Column<Campaign>[] = [
    { key: 'name', header: 'Campaign', render: (r: any) => (
      <div className="min-w-0">
        <p className="font-medium text-ink-900 truncate">{r.name || r.subject || 'Campaign'}</p>
        <p className="text-[12px] text-ink-500 truncate">{r.subject || r.name}</p>
      </div>
    )},
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} size="sm" /> },
    { key: 'recipients', header: 'Recipients', render: (r: any) => (
      <span className="text-ink-600">{formatNumber(r.recipientCount ?? r.totalRecipients ?? 0)}</span>
    )},
    { key: 'progress', header: 'Progress', render: (r: any) => {
      const total = r.recipientCount ?? r.totalRecipients ?? 0;
      const sent = r.sentCount ?? 0;
      const failed = r.failedCount ?? 0;
      return (
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${failed > sent ? 'bg-error' : 'bg-success'}`}
              style={{ width: `${total > 0 ? (sent / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[12px] text-ink-600">{formatNumber(sent)}/{formatNumber(total)}</span>
        </div>
      );
    }},
    { key: 'start', header: 'Start Time', render: (r) => <span className="text-ink-600">{formatDateTime(r.startTime)}</span> },
    { key: 'sender', header: 'Sender', render: (r: any) => <span className="text-ink-600">{r.senderEmail || r.sender?.email || '—'}</span> },
    {
      key: 'actions', header: '', headerClassName: 'text-right', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end">
          <Dropdown width={160} trigger={
            <button className="flex items-center justify-center w-7 h-7 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }>
            <DropdownItem icon={<Eye className="w-4 h-4" />}>View Details</DropdownItem>
            {r.status === 'active' && (
              <DropdownItem icon={<Pause className="w-4 h-4" />} onClick={() => handlePause(r.id)}>Pause</DropdownItem>
            )}
            {r.status === 'failed' && (
              <DropdownItem icon={<RotateCcw className="w-4 h-4" />} onClick={() => handleRetry(r.id)}>Retry</DropdownItem>
            )}
          </Dropdown>
        </div>
      ),
    },
  ];

  const emptyMap: Record<string, { title: string; desc: string }> = {
    all: { title: 'No campaigns yet', desc: 'Create your first campaign to get started.' },
    active: { title: 'No active campaigns', desc: 'Active campaigns will appear here.' },
    completed: { title: 'No completed campaigns', desc: 'Completed campaigns will appear here.' },
    failed: { title: 'No failed campaigns', desc: 'Failed campaigns will appear here.' },
  };
  const empty = emptyMap[filterStatus] || emptyMap.all;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        actionLabel="Compose New Email"
        actionTo="/compose"
      />

      <Card>
        <DataTable
          columns={columns}
          data={campaigns}
          loading={loading}
          error={error ? 'Unable to load campaigns.' : undefined}
          onRetry={fetchCampaigns}
          empty={
            <EmptyState
              title={empty.title}
              description={empty.desc}
              actionLabel="Create New Campaign"
              onAction={() => window.location.href = '/compose'}
            />
          }
        />
      </Card>
    </div>
  );
}
