import type { Email, Campaign, User, Sender, DashboardStats, EmailStatus, CampaignStatus } from '@/types';

const senders: Sender[] = [
  { id: 's1', name: 'James Carter', email: 'james@reachinbox.io' },
  { id: 's2', name: 'Sarah Lin', email: 'sarah@reachinbox.io' },
  { id: 's3', name: 'Outreach Team', email: 'outreach@reachinbox.io' },
];

const currentUser: User = {
  id: 'u1',
  name: 'James Carter',
  email: 'james@reachinbox.io',
  role: 'Admin',
  avatarUrl: '',
  googleConnected: true,
};

const campaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Summer Campaign',
    subject: 'Welcome to ReachInbox',
    body: 'Welcome to ReachInbox! We are thrilled to have you on board.',
    status: 'active',
    recipientCount: 1248,
    sentCount: 382,
    failedCount: 4,
    startTime: '2026-09-23T10:30:00',
    delaySeconds: 2,
    hourlyLimit: 100,
    senderId: 's1',
    senderEmail: 'james@reachinbox.io',
    createdAt: '2026-09-22T14:00:00',
  },
  {
    id: 'c2',
    name: 'Product Launch',
    subject: 'Introducing our new analytics dashboard',
    body: 'We are excited to announce our new analytics dashboard, now available to all users.',
    status: 'active',
    recipientCount: 856,
    sentCount: 210,
    failedCount: 3,
    startTime: '2026-09-23T09:00:00',
    delaySeconds: 5,
    hourlyLimit: 80,
    senderId: 's2',
    senderEmail: 'sarah@reachinbox.io',
    createdAt: '2026-09-21T16:30:00',
  },
  {
    id: 'c3',
    name: 'Q4 Newsletter',
    subject: 'Your Q4 product roundup',
    body: 'Here is everything that happened this quarter and what is coming next.',
    status: 'completed',
    recipientCount: 3400,
    sentCount: 3388,
    failedCount: 12,
    startTime: '2026-09-15T08:00:00',
    delaySeconds: 3,
    hourlyLimit: 120,
    senderId: 's3',
    senderEmail: 'outreach@reachinbox.io',
    createdAt: '2026-09-14T10:00:00',
  },
  {
    id: 'c4',
    name: 'Webinar Invite',
    subject: 'You are invited: SaaS Email Strategies 2026',
    body: 'Join us for a deep-dive webinar on modern email outreach strategies.',
    status: 'completed',
    recipientCount: 1200,
    sentCount: 1198,
    failedCount: 2,
    startTime: '2026-09-10T12:00:00',
    delaySeconds: 4,
    hourlyLimit: 100,
    senderId: 's1',
    senderEmail: 'james@reachinbox.io',
    createdAt: '2026-09-09T15:00:00',
  },
  {
    id: 'c5',
    name: 'Re-engagement Drive',
    subject: 'We miss you — here is 20% off',
    body: 'It has been a while since your last visit. Here is a special offer just for you.',
    status: 'failed',
    recipientCount: 500,
    sentCount: 120,
    failedCount: 380,
    startTime: '2026-09-18T14:00:00',
    delaySeconds: 1,
    hourlyLimit: 200,
    senderId: 's2',
    senderEmail: 'sarah@reachinbox.io',
    createdAt: '2026-09-17T11:00:00',
  },
  {
    id: 'c6',
    name: 'Holiday Promo',
    subject: 'Holiday special: save big this season',
    body: 'Our biggest holiday sale of the year starts now.',
    status: 'draft',
    recipientCount: 0,
    sentCount: 0,
    failedCount: 0,
    startTime: '2026-12-01T10:00:00',
    delaySeconds: 3,
    hourlyLimit: 100,
    senderId: 's3',
    senderEmail: 'outreach@reachinbox.io',
    createdAt: '2026-09-22T18:00:00',
  },
];

const recipients = [
  'john@gmail.com', 'rahim@gmail.com', 'sarah@yahoo.com', 'mike@outlook.com',
  'emma@company.co', 'liam@startup.io', 'olivia@tech.dev', 'noah@design.studio',
  'ava@creative.ai', 'ethan@finance.com', 'sophia@health.org', 'mason@edu.net',
  'isabella@research.io', 'lucas@media.co', 'mia@consulting.biz', 'alex@ventures.com',
  'amelia@growth.io', 'harper@solutions.net', 'daniel@cloud.dev', 'ella@data.ai',
  'jack@metrics.co', 'grace@scale.io', 'ryan@product.dev', 'nora@strategy.biz',
];

const subjects = [
  'Welcome to ReachInbox', 'Your weekly roundup', 'Introducing our new analytics dashboard',
  'You are invited: SaaS Email Strategies 2026', 'We miss you — here is 20% off',
  'Holiday special: save big this season', 'Quick question about your account',
  'Your trial is ending soon', 'New feature: scheduled sequences', 'Q4 product roundup',
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function generateEmails(count: number): Email[] {
  const emails: Email[] = [];
  const statuses: EmailStatus[] = ['scheduled', 'pending', 'processing', 'sent', 'failed', 'rate_limited', 'sent', 'sent', 'scheduled', 'scheduled'];

  for (let i = 0; i < count; i++) {
    const campaign = pick(campaigns, i);
    const status = pick(statuses, i);
    const recipient = pick(recipients, i * 3 + 1);
    const sender = senders.find(s => s.id === campaign.senderId) || senders[0];

    const baseDate = new Date('2026-09-23T10:30:00');
    const offset = i * 1000 * 60 * 7;
    const scheduledTime = new Date(baseDate.getTime() + offset).toISOString();

    const sentTime = (status === 'sent' || status === 'failed')
      ? new Date(new Date(scheduledTime).getTime() + 30000).toISOString()
      : null;

    emails.push({
      id: `e${i + 1}`,
      recipient,
      subject: pick(subjects, i),
      body: campaign.body,
      campaignId: campaign.id,
      campaignName: campaign.name,
      senderId: sender.id,
      senderEmail: sender.email,
      status,
      scheduledTime,
      sentTime,
      delaySeconds: campaign.delaySeconds,
      errorMessage: status === 'failed' ? 'SMTP timeout: connection refused by recipient server.' : undefined,
    });
  }
  return emails;
}

const allEmails = generateEmails(60);

const dashboardStats: DashboardStats = {
  scheduled: 1248,
  sentToday: 382,
  failed: 7,
  emailsThisMonth: 8421,
};

export const mockDb = {
  currentUser,
  senders,
  campaigns,
  emails: allEmails,
  dashboardStats,
};

export function getCampaignName(id: string): string {
  return campaigns.find(c => c.id === id)?.name || 'Unknown';
}

export { allEmails, campaigns, senders, currentUser, dashboardStats };
