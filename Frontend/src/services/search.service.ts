import { apiClient } from './apiClient';
import type { EmailQueryParams } from './email.service';

export const searchService = async (params: EmailQueryParams & { campaign?: string; sender?: string }) => {
  const res = await apiClient.get('/emails/search', { params: { ...params, q: params.search } });
  return res.data;
};

export type { EmailQueryParams };
