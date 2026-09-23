import type { Campaign, CampaignStatus, CampaignSummaryData } from '@/types';
import { apiClient } from './apiClient';

function delay(ms: number = 600): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface CreateCampaignInput {
  name: string;
  subject: string;
  body: string;
  startTime: string;
  delaySeconds: number;
  hourlyLimit: number;
  senderId: string;
  recipients: string[];
}

export const campaignService = {
  async getCampaigns(status?: CampaignStatus | 'all'): Promise<Campaign[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/campaigns', { params: { status } });
    return res.data.data.map(c => ({
      ...c,
      recipientCount: c.totalRecipients || 0,
      senderEmail: c.sender?.email || 'unknown',
    }));
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(`/campaigns/${id}`);
      const c = res.data.data;
      return {
        ...c,
        recipientCount: c.totalRecipients || 0,
        senderEmail: c.sender?.email || 'unknown',
      };
    } catch {
      return null;
    }
  },

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const payload = {
      ...input,
      delayMs: input.delaySeconds * 1000,
    };
    const res = await apiClient.post<{ success: boolean; data: { campaign: Campaign } }>('/campaigns', payload);
    return res.data.data.campaign;
  },

  async getSummary(data: CampaignSummaryData): Promise<{ estimatedDuration: string }> {
    await delay(300);
    const totalSeconds = data.recipients * data.delaySeconds;
    const cappedSeconds = Math.max(totalSeconds, (data.recipients / data.hourlyLimit) * 3600);
    const hours = Math.floor(cappedSeconds / 3600);
    const minutes = Math.floor((cappedSeconds % 3600) / 60);
    return { estimatedDuration: `~${hours}h ${minutes}m` };
  },
};
