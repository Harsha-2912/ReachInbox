import type { SlackConnection } from '@/types';
import { apiClient } from './apiClient';

function delay(ms: number = 600): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let slackConnection: SlackConnection = {
  connected: false,
};

export const slackService = {
  async getStatus(): Promise<SlackConnection> {
    const res = await apiClient.get<{ success: boolean; data: SlackConnection }>('/slack/status');
    return res.data.data;
  },

  async getAuthUrl(): Promise<string> {
    return `${import.meta.env.VITE_API_URL || '/api'}/slack/auth`;
  },

  async connect(workspace: string): Promise<SlackConnection> {
    // Auth flow redirects
    throw new Error('Not implemented, use redirect');
  },

  async disconnect(): Promise<void> {
    await apiClient.post('/slack/disconnect');
  },
};
