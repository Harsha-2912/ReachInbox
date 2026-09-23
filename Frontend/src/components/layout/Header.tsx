import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, Menu, User, Settings, Slack, LogOut, ChevronDown } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'Dashboard', breadcrumb: 'General' },
  '/scheduled': { title: 'Scheduled Emails', breadcrumb: 'General / Scheduled' },
  '/sent': { title: 'Sent Emails', breadcrumb: 'General / Sent' },
  '/search': { title: 'Search', breadcrumb: 'General / Search' },
  '/compose': { title: 'Create New Campaign', breadcrumb: 'Campaigns / Compose' },
  '/campaigns': { title: 'All Campaigns', breadcrumb: 'Campaigns' },
  '/campaigns/active': { title: 'Active Campaigns', breadcrumb: 'Campaigns / Active' },
  '/campaigns/completed': { title: 'Completed Campaigns', breadcrumb: 'Campaigns / Completed' },
  '/campaigns/failed': { title: 'Failed Campaigns', breadcrumb: 'Campaigns / Failed' },
  '/settings': { title: 'Settings', breadcrumb: 'Integrations / Settings' },
  '/settings/slack': { title: 'Slack Integration', breadcrumb: 'Integrations / Slack' },
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');

  const match = pageTitles[location.pathname] || { title: 'ReachInbox', breadcrumb: '' };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-ink-200">
      <div className="flex items-center gap-4 h-16 px-4 lg:px-6">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="text-[11px] text-ink-500 font-medium">{match.breadcrumb}</span>
          <span className="text-[14px] font-semibold text-ink-900 truncate">{match.title}</span>
        </div>

        {/* Search */}
        <div className="flex-1 flex justify-center max-w-md mx-auto">
          <SearchBar
            placeholder="Search emails..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            containerClassName="w-full max-w-[300px] hidden md:block"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-error" />
          </button>

          <div className="h-6 w-px bg-ink-200 hidden sm:block" />

          <Dropdown
            width={220}
            trigger={
              <div className="flex items-center gap-2.5 cursor-pointer py-1 px-1 rounded-lg hover:bg-ink-50 transition-colors">
                <Avatar name={user?.name || 'User'} size="sm" />
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-[13px] font-medium text-ink-900 truncate max-w-[120px]">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-ink-500 truncate">{user?.role || 'Member'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-ink-500 hidden sm:block" />
              </div>
            }
          >
            <div className="px-3.5 py-3 border-b border-ink-200">
              <p className="text-[13px] font-medium text-ink-900 truncate">{user?.name}</p>
              <p className="text-[12px] text-ink-500 truncate">{user?.email}</p>
            </div>
            <DropdownItem icon={<User className="w-4 h-4" />} onClick={() => navigate('/settings')}>
              Profile
            </DropdownItem>
            <DropdownItem icon={<Settings className="w-4 h-4" />} onClick={() => navigate('/settings')}>
              Settings
            </DropdownItem>
            <DropdownItem icon={<Slack className="w-4 h-4" />} onClick={() => navigate('/settings/slack')}>
              Connect Slack
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={<LogOut className="w-4 h-4" />} danger onClick={() => { logout(); navigate('/login'); }}>
              Logout
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
