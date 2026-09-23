import { useState, useEffect } from 'react';
import { Slack as SlackIcon, CheckCircle2, XCircle, Loader2, Bell, Zap, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { slackService } from '@/services/slack.service';
import { toast } from 'sonner';
import type { SlackConnection } from '@/types';

export function SlackPage() {
  const [slack, setSlack] = useState<SlackConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    slackService.getStatus()
      .then(setSlack)
      .catch(() => toast.error('Failed to load Slack status'))
      .finally(() => setLoading(false));
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
        title="Slack Integration"
        subtitle="Receive notifications when an email sender reaches its hourly sending limit."
        actionLabel="Compose New Email"
        actionTo="/compose"
      />

      <div className="max-w-2xl space-y-6">
        {/* Connection card */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-ink-200">
            <h3 className="text-section text-ink-900">Connection</h3>
          </div>
          <CardBody className="pt-5">
            {loading ? (
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
                      <p className="text-[13px] text-ink-600 mb-4">Connect your Slack workspace to start receiving notifications.</p>
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

        {/* What you get */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-ink-200">
            <h3 className="text-section text-ink-900">What you get</h3>
          </div>
          <CardBody className="pt-5">
            <div className="space-y-4">
              <FeatureRow
                icon={<AlertTriangle className="w-4 h-4" />}
                title="Hourly limit alerts"
                desc="Get notified when a sender hits the hourly sending limit."
              />
              <FeatureRow
                icon={<Zap className="w-4 h-4" />}
                title="Campaign events"
                desc="Receive updates when campaigns start, complete, or fail."
              />
              <FeatureRow
                icon={<Bell className="w-4 h-4" />}
                title="Failure notifications"
                desc="Instant alerts when emails fail to send, so you can act fast."
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-ink-50 border border-ink-200 flex items-center justify-center text-ink-700 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-medium text-ink-900">{title}</p>
        <p className="text-[13px] text-ink-600">{desc}</p>
      </div>
    </div>
  );
}
