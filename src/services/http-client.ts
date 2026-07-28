import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { appConfig } from '@/config/app.config';
import { logger } from '@/logging';
import type { ApiError } from '@/types';

function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: appConfig.api.baseUrl,
    timeout: appConfig.api.timeout,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(
    (config) => {
      logger.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const handledError = normalizeError(error);
      logger.error(`[API] Error: ${handledError.message}`, error);
      return Promise.reject(handledError);
    },
  );

  return client;
}

function normalizeError(error: AxiosError): ApiError {
  if (error.code === 'ERR_NETWORK') {
    return { type: 'NETWORK', message: 'Falha de conexão com o servidor', retry: true };
  }
  if (error.code === 'ECONNABORTED') {
    return { type: 'TIMEOUT', message: 'Tempo limite da requisição excedido', retry: true };
  }
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return { type: 'VALIDATION', message: 'Dados inválidos', errors: (error.response.data as Record<string, unknown>)?.errors as Record<string, string[]> };
      case 404:
        return { type: 'NOT_FOUND', message: 'Recurso não encontrado' };
      case 422:
        return { type: 'VALIDATION', message: 'Erro de validação', errors: (error.response.data as Record<string, unknown>)?.errors as Record<string, string[]> };
      case 429:
        return { type: 'SERVER', message: 'Muitas requisições, tente novamente', retry: true };
      case 500:
        return { type: 'SERVER', message: 'Erro interno do servidor', retry: true };
      case 503:
        return { type: 'SERVER', message: 'Serviço indisponível', retry: true };
      default:
        return { type: 'UNKNOWN', message: `Erro ${error.response.status}: ${error.message}` };
    }
  }
  return { type: 'UNKNOWN', message: 'Erro desconhecido' };
}

export { createHttpClient, normalizeError };

export const httpClient = createHttpClient();
