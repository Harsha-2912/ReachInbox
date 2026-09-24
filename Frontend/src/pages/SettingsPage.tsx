import { useState, useEffect } from 'react';
import { Slack as SlackIcon, CheckCircle2, XCircle, Loader2, Bell } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { slackService } from '@/services/slack.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { SlackConnection } from '@/types';

export function SettingsPage() {
  const { user } = useAuth();
  const [slack, setSlack] = useState<SlackConnection | null>(null);
  const [slackLoading, setSlackLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    slackService.getStatus()
      .then(setSlack)
      .catch(() => toast.error('Failed to load Slack status'))
      .finally(() => setSlackLoading(false));
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const conn = await slackService.connect('ReachInbox Workspace');
      setSlack(conn);
      toast.success('Slack connected successfully');
    } catch {
      toast.error('Slack connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await slackService.disconnect();
      setSlack({ connected: false });
      toast.info('Slack disconnected');
    } catch {
      toast.error('Failed to disconnect Slack');
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, integrations, and preferences."
      />

      <div className="max-w-2xl space-y-6">
        {/* Account */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-ink-200">
            <h3 className="text-section text-ink-900">Account</h3>
            <p className="text-[13px] text-ink-600 mt-0.5">Your account information and Google connection.</p>
          </div>
          <CardBody className="pt-5 space-y-5">
            <div className="flex items-center gap-4 pb-5 border-b border-ink-200">
              <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="lg" />
              <div>
                <p className="text-[15px] font-semibold text-ink-900">{user?.name}</p>
                <p className="text-[13px] text-ink-600">{user?.email}</p>
                <p className="text-[12px] text-ink-500 mt-1">{user?.role}</p>
              </div>
            </div>
            <Input label="Name" defaultValue={user?.name} />
            <Input label="Email" defaultValue={user?.email} disabled />
            <div className="flex items-center justify-between p-4 bg-ink-50 rounded-xl border border-ink-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-ink-200 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-ink-900">Google Account</p>
                  <p className="text-[12px] text-ink-600">{user?.googleConnected ? 'Connected' : 'Not connected'}</p>
                </div>
              </div>
              {user?.googleConnected && <CheckCircle2 className="w-5 h-5 text-success" />}
            </div>
          </CardBody>
        </Card>

        {/* Slack Integration */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-ink-200">
            <h3 className="text-section text-ink-900">Slack Integration</h3>
            <p className="text-[13px] text-ink-600 mt-0.5">Receive notifications when an email sender reaches its hourly sending limit.</p>
          </div>
          <CardBody className="pt-5">
            {slackLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-ink-500" />
              </div>
            ) : (
              <div className="flex items-start gap-4 p-5 border border-ink-200 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-center flex-shrink-0">
                  <SlackIcon className="w-6 h-6 text-ink-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[14px] font-semibold text-ink-900">Slack</p>
                    {slack?.connected ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-success bg-success-soft border border-success/20 rounded-full px-2.5 py-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-600 bg-ink-50 border border-ink-200 rounded-full px-2.5 py-0.5">
                        <XCircle className="w-3 h-3" /> Not connected
                      </span>
                    )}
                  </div>
                  {slack?.connected ? (
                    <>
                      <p className="text-[13px] text-ink-600 mb-1">Workspace: <span className="text-ink-900 font-medium">{slack.workspace}</span></p>
                      <p className="text-[13px] text-ink-600 mb-4">Notifications: <span className="text-ink-900 font-medium">{slack.channel}</span></p>
                      <Button variant="danger" onClick={handleDisconnect}>Disconnect</Button>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] text-ink-600 mb-4">Connect Slack to receive sending limit alerts and campaign notifications.</p>
                      <Button onClick={handleConnect} loading={connecting} disabled={connecting}>
                        {connecting ? 'Connecting...' : 'Connect Slack'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
