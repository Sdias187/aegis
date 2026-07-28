import type { AxiosError } from 'axios';

export interface RetryPolicyConfig {
  retries: number;
  retryDelay: (attempt: number) => number;
  retryCondition: (error: AxiosError) => boolean;
}

export const defaultRetryPolicy: RetryPolicyConfig = {
  retries: 3,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
  retryCondition: (error: AxiosError) => {
    return !error.response || error.response.status >= 500;
  },
};
