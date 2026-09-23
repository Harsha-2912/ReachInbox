import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Gauge, Send, Users, Sparkles, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { EmailEditor } from '@/components/ui/EmailEditor';
import { campaignService } from '@/services/campaign.service';
import { mockDb } from '@/services/mockData';
import { formatNumber } from '@/lib/format';
import { toast } from 'sonner';
import type { LeadFile, Sender } from '@/types';
import { apiClient } from '@/services/apiClient';

export function ComposePage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [leadFile, setLeadFile] = useState<LeadFile | null>(null);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:30');
  const [delay, setDelay] = useState('2');
  const [hourlyLimit, setHourlyLimit] = useState('100');
  const [senders, setSenders] = useState<Sender[]>([]);
  const [senderId, setSenderId] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Fetch senders on mount
  useEffect(() => {
    apiClient.get('/senders').then(res => {
      const data = res.data.data;
      setSenders(data);
      if (data.length > 0) {
        setSenderId(data[0].id);
      }
    }).catch(() => {
      toast.error('Failed to load senders');
    });
  }, []);

  const recipientCount = leadFile?.validEmails || 0;
  const delayNum = parseInt(delay) || 0;
  const hourlyNum = parseInt(hourlyLimit) || 1;

  const estimatedDuration = useMemo(() => {
    if (recipientCount === 0) return '—';
    const totalSeconds = recipientCount * delayNum;
    const cappedSeconds = Math.max(totalSeconds, (recipientCount / hourlyNum) * 3600);
    const hours = Math.floor(cappedSeconds / 3600);
    const minutes = Math.floor((cappedSeconds % 3600) / 60);
    return `~${hours}h ${minutes}m`;
  }, [recipientCount, delayNum, hourlyNum]);

  const canSchedule = subject.trim() && body.trim() && recipientCount > 0 && startDate && startTime;

  const handleSchedule = async () => {
    if (!canSchedule) {
      toast.error('Please fill in all required fields and upload a lead file.');
      return;
    }
    setScheduling(true);
    try {
      const startTimeISO = new Date(`${startDate}T${startTime}:00`).toISOString();
      await campaignService.createCampaign({
        name: campaignName || subject,
        subject,
        body,
        startTime: startTimeISO,
        delaySeconds: delayNum,
        hourlyLimit: hourlyNum,
        senderId,
        recipients: leadFile?.emails || [],
      });
      toast.success('Campaign scheduled successfully');
      navigate('/scheduled');
    } catch {
      toast.error('Campaign could not be scheduled. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Create New Campaign"
        subtitle="Configure your email campaign and schedule your recipients."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left — Email content */}
        <div className="space-y-6">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-ink-200">
              <h3 className="text-section text-ink-900">Email Content</h3>
              <p className="text-[13px] text-ink-600 mt-0.5">Write the subject and body of your campaign email.</p>
            </div>
            <CardBody className="space-y-5 pt-5">
              <Input
                label="Campaign Name"
                placeholder="e.g. Summer Outreach 2026"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                hint="Internal name to identify this campaign."
              />
              <Input
                label="Subject"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink-700">Body</label>
                <EmailEditor
                  value={body}
                  onChange={setBody}
                  placeholder="Write your email message..."
                />
                <p className="text-[12px] text-ink-500">Supports bold, italic, links, and lists.</p>
              </div>
            </CardBody>
          </Card>

          {/* Lead file */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-ink-200">
              <h3 className="text-section text-ink-900">Upload Leads</h3>
              <p className="text-[13px] text-ink-600 mt-0.5">Upload a CSV or TXT file containing your recipient email addresses.</p>
            </div>
            <CardBody className="pt-5">
              <FileUploader onFileProcessed={setLeadFile} />
            </CardBody>
          </Card>
        </div>

        {/* Right — Settings */}
        <div className="space-y-6">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-ink-200">
              <h3 className="text-section text-ink-900">Campaign Settings</h3>
              <p className="text-[13px] text-ink-600 mt-0.5">Configure when and how emails are sent.</p>
            </div>
            <CardBody className="space-y-4 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <Input
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>
              <Input
                label="Delay Between Emails"
                type="number"
                min="1"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                hint="Minimum delay between consecutive sends (seconds)."
              />
              <Input
                label="Hourly Sending Limit"
                type="number"
                min="1"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(e.target.value)}
                hint="Maximum number of emails allowed within one hour."
              />
              <Select
                label="Sender"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                hint="The email address this campaign will send from."
              >
                {senders.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.email} — {s.email}</option>
                ))}
              </Select>
            </CardBody>
          </Card>

          {/* Summary */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-ink-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ink-700" />
                <h3 className="text-section text-ink-900">Campaign Summary</h3>
              </div>
            </div>
            <CardBody className="pt-5">
              <dl className="space-y-3 mb-5">
                <SummaryRow icon={<Users className="w-4 h-4" />} label="Recipients" value={recipientCount > 0 ? formatNumber(recipientCount) : '—'} />
                <SummaryRow icon={<Clock className="w-4 h-4" />} label="Start time" value={startDate ? `${startDate}, ${startTime}` : '—'} />
                <SummaryRow icon={<Gauge className="w-4 h-4" />} label="Delay" value={`${delay} seconds`} />
                <SummaryRow icon={<Send className="w-4 h-4" />} label="Hourly limit" value={`${hourlyLimit} emails/hour`} />
                <SummaryRow icon={<Clock className="w-4 h-4" />} label="Estimated duration" value={estimatedDuration} />
              </dl>
              <div className="flex items-center gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  loading={scheduling}
                  disabled={!canSchedule}
                  onClick={handleSchedule}
                  icon={!scheduling ? <Send className="w-4 h-4" /> : undefined}
                >
                  {scheduling ? 'Scheduling...' : 'Schedule Campaign'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-2 text-[13px] text-ink-600">
        <span className="text-ink-500">{icon}</span>
        {label}
      </dt>
      <dd className="text-[13px] font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
