import type { Email, EmailFilterStatus, Pagination } from '@/types';
import { apiClient } from './apiClient';

function delay(ms: number = 600): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface EmailListResponse {
  data: Email[];
  pagination: Pagination;
}

export interface EmailQueryParams {
  page?: number;
  pageSize?: number;
  status?: EmailFilterStatus;
  search?: string;
}

function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; pagination: Pagination } {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    pagination: { page, pageSize, total, totalPages },
  };
}

export const emailService = {
  async getScheduledEmails(params: EmailQueryParams = {}): Promise<EmailListResponse> {
    const res = await apiClient.get<EmailListResponse>('/emails/scheduled', { params });
    return res.data;
  },

  async getSentEmails(params: EmailQueryParams = {}): Promise<EmailListResponse> {
    const res = await apiClient.get<EmailListResponse>('/emails/sent', { params });
    return res.data;
  },

  async searchEmails(params: EmailQueryParams & { campaign?: string; sender?: string }): Promise<EmailListResponse> {
    const res = await apiClient.get<EmailListResponse>('/emails/search', { params: { ...params, q: params.search } });
    return res.data;
  },

  async getDashboardStats(): Promise<import('@/types').DashboardStats> {
    const res = await apiClient.get<{ success: boolean; data: import('@/types').DashboardStats }>('/emails/stats');
    return res.data.data;
  },

  async getRecentActivity(limit: number = 8): Promise<Email[]> {
    const res = await apiClient.get<EmailListResponse>('/emails/sent', { params: { limit } });
    return res.data.data;
  },

  async retryEmail(id: string): Promise<void> {
    await apiClient.post(`/emails/${id}/retry`);
  },

  async cancelEmail(id: string): Promise<void> {
    await apiClient.post(`/emails/${id}/cancel`);
  },
};
