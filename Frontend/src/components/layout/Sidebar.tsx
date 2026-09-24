import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarClock, CheckCircle2, Search,
  Mail, Activity, CheckCircle, XCircle, Slack, Settings,
  LifeBuoy, Plus, X, Inbox,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user: { name: string; email: string; role: string } | null;
  onNavigate: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const generalItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
  { to: '/scheduled', label: 'Scheduled', icon: <CalendarClock className="w-[18px] h-[18px]" />, badge: 1248 },
  { to: '/sent', label: 'Sent', icon: <CheckCircle2 className="w-[18px] h-[18px]" /> },
  { to: '/search', label: 'Search', icon: <Search className="w-[18px] h-[18px]" /> },
];

const campaignItems: NavItem[] = [
  { to: '/campaigns', label: 'All Campaigns', icon: <Mail className="w-[18px] h-[18px]" /> },
  { to: '/campaigns/active', label: 'Active', icon: <Activity className="w-[18px] h-[18px]" />, badge: 2 },
  { to: '/campaigns/completed', label: 'Completed', icon: <CheckCircle className="w-[18px] h-[18px]" /> },
  { to: '/campaigns/failed', label: 'Failed', icon: <XCircle className="w-[18px] h-[18px]" /> },
];

const integrationItems: NavItem[] = [
  { to: '/settings/slack', label: 'Slack', icon: <Slack className="w-[18px] h-[18px]" /> },
  { to: '/settings', label: 'Settings', icon: <Settings className="w-[18px] h-[18px]" /> },
];

export function Sidebar({ open, onClose, user, onNavigate }: SidebarProps) {
  const location = useLocation();

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 px-3 mb-2">{title}</p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-ink-100 text-ink-900'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-ink-900' : 'text-ink-500'}`}>{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="text-[11px] font-medium text-ink-500 bg-ink-50 border border-ink-200 rounded-full px-2 py-0.5">
                  {item.badge > 999 ? `${(item.badge / 1000).toFixed(1)}k` : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ink-900/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[260px] flex-shrink-0 bg-white border-r border-ink-200 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Wordmark */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ink-900 flex items-center justify-center">
              <Inbox className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-ink-900">REACHINBOX</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-ink-600 hover:text-ink-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create button */}
        <div className="px-4 py-4 border-b border-ink-200">
          <NavLink
            to="/compose"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 h-10 px-4 text-[13px] font-medium rounded-xl bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Campaign
          </NavLink>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-5">
          {renderSection('General', generalItems)}
          {renderSection('Campaigns', campaignItems)}
          {renderSection('Integrations', integrationItems)}
        </div>

        {/* Bottom */}
        <div className="border-t border-ink-200 px-4 py-3">
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900 transition-colors mb-2"
          >
            <LifeBuoy className="w-[18px] h-[18px] text-ink-500" />
            Help & Support
          </NavLink>
        </div>

        {/* User profile */}
        {user && (
          <div className="border-t border-ink-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink-900 truncate">{user.name}</p>
                <p className="text-[11px] text-ink-500 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
