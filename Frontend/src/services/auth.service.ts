import type { User } from '@/types';
import { apiClient, API_BASE_URL } from './apiClient';

function delay(ms: number = 600): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const authService = {
  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return res.data.data;
  },

  async loginWithGoogle(): Promise<{ user: User; token: string }> {
    // Handled by the backend redirect
    throw new Error('Not implemented here, handled by redirect');
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('reachinbox_token');
  },

  async getGoogleAuthUrl(): Promise<string> {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const query = origin ? `?returnTo=${encodeURIComponent(origin)}` : '';
    return `${API_BASE_URL}/auth/google${query}`;
  },
};
