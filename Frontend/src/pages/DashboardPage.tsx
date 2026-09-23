import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Mail, AlertCircle, BarChart3, ArrowUpRight, MoreHorizontal, Eye, RotateCcw, Ban } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { CardSkeleton } from '@/components/ui/LoadingState';
import { formatNumber, formatTime } from '@/lib/format';
import { dashboardStats as mockStats, allEmails } from '@/services/mockData';
import type { Email, DashboardStats } from '@/types';
import { emailService } from '@/services/email.service';
import { toast } from 'sonner';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  trend?: string;
}

function StatCard({ label, value, icon, iconColor, trend }: StatCardProps) {
  return (
    <Card className="p-5" hover>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg bg-ink-50 border border-ink-200 flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-[12px] text-ink-600 mb-1">{label}</p>
      <p className="text-[26px] font-semibold text-ink-900 tracking-tight">{formatNumber(value)}</p>
    </Card>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activity, setActivity] = useState<Email[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setStatsLoading(true);
    emailService.getDashboardStats()
      .then(data => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsLoading(false);
      });
  }, []);

  useEffect(() => {
    setActivityLoading(true);
    setError(false);
    emailService.getRecentActivity(8)
      .then(data => {
        setActivity(data);
        setActivityLoading(false);
      })
      .catch(() => {
        setError(true);
        setActivityLoading(false);
      });
  }, []);

  const handleRetry = (id: string) => {
    toast.success('Email queued for retry');
  };
  const handleCancel = (id: string) => {
    toast.info('Email cancelled');
  };

  const columns: Column<Email>[] = [
    {
      key: 'recipient',
      header: 'Recipient',
      render: (row) => <span className="text-ink-900 font-medium">{row.recipient}</span>,
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (row) => <span className="text-ink-700 truncate block max-w-[220px]">{row.subject}</span>,
    },
    {
      key: 'campaign',
      header: 'Campaign',
      render: (row) => <span className="text-ink-600">{row.campaignName}</span>,
    },
    {
      key: 'time',
      header: 'Scheduled / Sent',
      render: (row) => <span className="text-ink-600">{formatTime(row.scheduledTime)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end">
          <Dropdown
            width={160}
            trigger={
              <button className="flex items-center justify-center w-7 h-7 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
          >
            <DropdownItem icon={<Eye className="w-4 h-4" />}>View</DropdownItem>
            {row.status === 'failed' && (
              <DropdownItem icon={<RotateCcw className="w-4 h-4" />} onClick={() => handleRetry(row.id)}>Retry</DropdownItem>
            )}
            {(row.status === 'scheduled' || row.status === 'pending') && (
              <DropdownItem icon={<Ban className="w-4 h-4" />} danger onClick={() => handleCancel(row.id)}>Cancel</DropdownItem>
            )}
          </Dropdown>
        </div>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Monitor your email campaigns and sending activity."
        actionLabel="Compose New Email"
        actionTo="/compose"
      />

      {/* KPI Cards */}
      {statsLoading ? (
        <CardSkeleton count={4} />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Scheduled" value={stats.scheduled} icon={<CalendarClock className="w-4 h-4" />} iconColor="text-ink-700" />
          <StatCard label="Sent Today" value={stats.sentToday} icon={<Mail className="w-4 h-4" />} iconColor="text-success" trend="12%" />
          <StatCard label="Failed" value={stats.failed} icon={<AlertCircle className="w-4 h-4" />} iconColor="text-error" />
          <StatCard label="This Month" value={stats.emailsThisMonth} icon={<BarChart3 className="w-4 h-4" />} iconColor="text-ink-700" trend="8%" />
        </div>
      ) : null}

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <h3 className="text-section text-ink-900">Recent Email Activity</h3>
            <p className="text-[13px] text-ink-600 mt-0.5">Latest scheduled and sent emails across all campaigns.</p>
          </div>
          <Link to="/scheduled" className="text-[13px] font-medium text-ink-700 hover:text-ink-900 flex items-center gap-1 transition-colors">
            View all
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="border-t border-ink-200">
          <DataTable
            columns={columns}
            data={activity}
            loading={activityLoading}
            error={error ? 'Unable to load recent activity.' : undefined}
            onRetry={() => window.location.reload()}
            empty={
              <div className="py-16 text-center">
                <p className="text-[15px] font-semibold text-ink-900 mb-1">No activity yet</p>
                <p className="text-[13px] text-ink-600 mb-5">Your recent email activity will appear here.</p>
                <Link to="/compose" className="inline-flex items-center justify-center h-10 px-4 text-[13px] font-medium rounded-xl bg-ink-900 text-white hover:bg-ink-800 transition-colors">
                  Create New Campaign
                </Link>
              </div>
            }
          />
        </div>
      </Card>
    </div>
  );
}
