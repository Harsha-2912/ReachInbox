import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Mail, CalendarClock, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await login();
      // Do not navigate here, the login() function sets window.location.href to the backend OAuth URL
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 bg-white">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-lg bg-ink-900 flex items-center justify-center">
              <Inbox className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-ink-900">REACHINBOX</span>
          </div>

          {/* Headline */}
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-ink-900 leading-tight mb-3">
            Schedule emails without the busywork.
          </h1>
          <p className="text-[15px] text-ink-600 leading-relaxed mb-10">
            Plan, schedule and monitor email campaigns from one simple workspace.
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-ink-200 rounded-xl text-[14px] font-medium text-ink-900 hover:bg-ink-50 hover:border-ink-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-ink-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p className="text-[12px] text-ink-500 mt-6 text-center leading-relaxed">
            By continuing, you agree to ReachInbox's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Right side — product preview (desktop only) */}
      <div className="hidden lg:flex flex-1 bg-ink-50 items-center justify-center px-12 border-l border-ink-200">
        <div className="max-w-md w-full">
          {/* Mini dashboard preview */}
          <div className="bg-white border border-ink-200 rounded-xl2 shadow-card p-5 mb-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-0.5">Dashboard</p>
                <p className="text-[15px] font-semibold text-ink-900">Email Activity</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-ink-900 flex items-center justify-center">
                <Inbox className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Scheduled', value: '1,248', icon: CalendarClock, color: 'text-ink-700' },
                { label: 'Sent Today', value: '382', icon: Mail, color: 'text-success' },
                { label: 'Failed', value: '7', icon: Mail, color: 'text-error' },
                { label: 'This Month', value: '8,421', icon: BarChart3, color: 'text-ink-700' },
              ].map((stat) => (
                <div key={stat.label} className="border border-ink-200 rounded-xl p-3.5">
                  <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
                  <p className="text-[11px] text-ink-600 mb-0.5">{stat.label}</p>
                  <p className="text-[20px] font-semibold text-ink-900 tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mini activity table */}
          <div className="bg-white border border-ink-200 rounded-xl2 shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-ink-200">
              <p className="text-[13px] font-semibold text-ink-900">Recent Activity</p>
            </div>
            <div className="divide-y divide-ink-200/60">
              {[
                { email: 'john@gmail.com', status: 'Sent', color: 'bg-success' },
                { email: 'rahim@gmail.com', status: 'Scheduled', color: 'bg-ink-400' },
                { email: 'sarah@yahoo.com', status: 'Sent', color: 'bg-success' },
              ].map((row) => (
                <div key={row.email} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] text-ink-900">{row.email}</span>
                  <span className="flex items-center gap-1.5 text-[12px] text-ink-600">
                    <span className={`w-1.5 h-1.5 rounded-full ${row.color}`} />
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
