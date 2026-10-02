import { apiClient } from './client';
import { apiCache } from './cache';
import {
  MarketReportResponse,
  PaginatedMarketReportsResponse,
} from '@/types/reports.types';

export const reportsApi = {
  /**
   * Fetches the latest published domestic Pre-Market Report with 120s cache
   */
  async getLatestPreMarketReport(forceRefresh = false): Promise<MarketReportResponse> {
    return apiCache.fetchWithCache<MarketReportResponse>(
      'reports:pre-market:latest',
      async () => {
        const response = await apiClient.get<MarketReportResponse>('/market-reports/pre-market/latest');
        return response.data;
      },
      120000,
      { forceRefresh }
    );
  },

  /**
   * Fetches the latest published domestic Post-Market Report with 120s cache
   */
  async getLatestPostMarketReport(forceRefresh = false): Promise<MarketReportResponse> {
    return apiCache.fetchWithCache<MarketReportResponse>(
      'reports:post-market:latest',
      async () => {
        const response = await apiClient.get<MarketReportResponse>('/market-reports/post-market/latest');
        return response.data;
      },
      120000,
      { forceRefresh }
    );
  },

  /**
   * Fetches the latest published Global Pre-Market Report with 120s cache
   */
  async getLatestGlobalPreMarketReport(forceRefresh = false): Promise<MarketReportResponse> {
    return apiCache.fetchWithCache<MarketReportResponse>(
      'reports:global:pre-market:latest',
      async () => {
        const response = await apiClient.get<MarketReportResponse>('/market-reports/global/pre-market/latest');
        return response.data;
      },
      120000,
      { forceRefresh }
    );
  },

  /**
   * Fetches the latest published Global Post-Market Report with 120s cache
   */
  async getLatestGlobalPostMarketReport(forceRefresh = false): Promise<MarketReportResponse> {
    return apiCache.fetchWithCache<MarketReportResponse>(
      'reports:global:post-market:latest',
      async () => {
        const response = await apiClient.get<MarketReportResponse>('/market-reports/global/post-market/latest');
        return response.data;
      },
      120000,
      { forceRefresh }
    );
  },

  /**
   * Fetches a published market report by ID with 120s cache
   */
  async getMarketReportById(id: number | string, forceRefresh = false): Promise<MarketReportResponse> {
    return apiCache.fetchWithCache<MarketReportResponse>(
      `reports:item:${id}`,
      async () => {
        const response = await apiClient.get<MarketReportResponse>(`/market-reports/${id}`);
        return response.data;
      },
      120000,
      { forceRefresh }
    );
  },

  /**
   * Lists published market reports with optional filters and 60s cache
   */
  async listMarketReports(
    params?: {
      report_type?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    },
    forceRefresh = false
  ): Promise<PaginatedMarketReportsResponse> {
    const cacheKey = apiCache.makeKey('reports:list', params);
    return apiCache.fetchWithCache<PaginatedMarketReportsResponse>(
      cacheKey,
      async () => {
        const response = await apiClient.get<PaginatedMarketReportsResponse>('/market-reports', { params });
        return response.data;
      },
      60000,
      { forceRefresh }
    );
  },
};
