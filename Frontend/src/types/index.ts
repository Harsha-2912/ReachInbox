export type EmailStatus =
  | 'scheduled'
  | 'pending'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'rate_limited';

export type CampaignStatus =
  | 'active'
  | 'completed'
  | 'failed'
  | 'draft'
  | 'paused';

export type EmailFilterStatus = 'all' | 'pending' | 'processing' | 'rate_limited' | 'sent' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  googleConnected: boolean;
}

export interface Sender {
  id: string;
  name: string;
  email: string;
}

export interface Email {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  campaignId: string;
  campaignName: string;
  senderId: string;
  senderEmail: string;
  status: EmailStatus;
  scheduledTime: string | null;
  sentTime: string | null;
  delaySeconds: number;
  errorMessage?: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  startTime: string;
  delaySeconds: number;
  hourlyLimit: number;
  senderId: string;
  senderEmail: string;
  createdAt: string;
}

export interface SlackConnection {
  connected: boolean;
  workspace?: string;
  channel?: string;
  connectedAt?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
  error?: string;
}

export interface DashboardStats {
  scheduled: number;
  sentToday: number;
  failed: number;
  emailsThisMonth: number;
}

export interface CampaignSummaryData {
  recipients: number;
  startTime: string;
  delaySeconds: number;
  hourlyLimit: number;
}

export interface LeadFile {
  fileName: string;
  totalLines: number;
  validEmails: number;
  invalidEmails: number;
  duplicates: number;
  emails: string[];
}
