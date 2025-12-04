import {
    APIResponse,
    LatestStatusResponse,
    HistoricalStatusResponse,
    HistoricalQueryParams,
    APIError as APIErrorType,
    isSuccessResponse,
    API_ERROR_CODES,
} from './types';
import { decryptResponse } from './crypto'; // Added import for decryptResponse

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Custom error class for API errors
export class StatusMonitorAPIError extends Error {
    constructor(
        message: string,
        public code: string,
        public status?: number
    ) {
        super(message);
        this.name = 'StatusMonitorAPIError';
        Object.setPrototypeOf(this, StatusMonitorAPIError.prototype);
    }

    static fromResponse(error: APIErrorType, status?: number): StatusMonitorAPIError {
        return new StatusMonitorAPIError(error.message, error.code, status);
    }

    static networkError(message: string = 'Network error occurred'): StatusMonitorAPIError {
        return new StatusMonitorAPIError(message, API_ERROR_CODES.NETWORK_ERROR);
    }
}

// Request configuration
interface RequestConfig extends RequestInit {
    timeout?: number;
    next?: { revalidate?: number; tags?: string[] };
}

// Fetch with timeout
async function fetchWithTimeout(
    url: string,
    config: RequestConfig = {}
): Promise<Response> {
    const { timeout = 30000, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchConfig,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Generic API request function with strong typing
async function request<T>(
    endpoint: string,
    options?: RequestConfig
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    try {
        const response = await fetchWithTimeout(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw StatusMonitorAPIError.networkError(
                `HTTP error! status: ${response.status}`
            );
        }

        const data: any = await response.json();

        // Check if response is encrypted
        if (data.ephemPublicKey && data.iv && data.data) {
            const decrypted = await decryptResponse(data);
            if (!decrypted.success) {
                throw StatusMonitorAPIError.networkError(decrypted.error?.message || 'Unknown API Error');
            }
            return decrypted.data as unknown as T;
        }

        if (isSuccessResponse(data)) {
            return data.data as unknown as T;
        }

        if (data.error) {
            throw StatusMonitorAPIError.fromResponse(data.error, response.status);
        }

        throw StatusMonitorAPIError.networkError('Invalid response format');
    } catch (error) {
        if (error instanceof StatusMonitorAPIError) {
            throw error;
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw StatusMonitorAPIError.networkError('Network connection failed');
        }

        if (error instanceof Error) {
            throw StatusMonitorAPIError.networkError(error.message);
        }

        throw StatusMonitorAPIError.networkError('Unknown error occurred');
    }
}

import { unstable_cache } from 'next/cache';

// Service layer with proper separation
export class StatusMonitorService {
    /**
     * Get the latest status of all monitored services
     * Uses caching on the frontend (60s default TTL)
     */
    static getLatestStatus = unstable_cache(
        async (): Promise<LatestStatusResponse> => {
            return request<LatestStatusResponse>('/api/v1/status/latest', {
                timeout: 10000,
            });
        },
        ['latest-status'],
        { revalidate: 60, tags: ['status'] }
    );

    /**
     * Get historical status data with optional filtering
     * @param params Query parameters for filtering
     */
    static async getHistoricalStatus(
        params: HistoricalQueryParams
    ): Promise<HistoricalStatusResponse[]> {
        const searchParams = new URLSearchParams();

        // Required parameter
        searchParams.append('start', params.start);

        // Optional parameters
        if (params.end) searchParams.append('end', params.end);
        if (params.service) searchParams.append('service', params.service);
        if (params.limit) searchParams.append('limit', params.limit.toString());

        const cacheKey = `historical-${params.service || 'all'}-${params.start}-${params.end || 'now'}`;

        return unstable_cache(
            async () => {
                return request<HistoricalStatusResponse[]>(
                    `/api/v1/status/historical?${searchParams.toString()}`,
                    {
                        timeout: 30000,
                    }
                );
            },
            [cacheKey],
            { revalidate: 60, tags: ['historical'] }
        )();
    }

    /**
     * Get available services from latest status
     * Useful for dropdowns and filters
     */
    static async getAvailableServices(): Promise<string[]> {
        const data = await this.getLatestStatus();
        return Array.from(new Set(data.services.map(s => s.service_name)));
    }
    /**
     * Get global recent downtime logs
     * @param limit Maximum number of logs to return
     * @param days Number of days to look back
     */
    static async getGlobalDowntime(limit: number = 100, days: number = 7): Promise<any[]> {
        return unstable_cache(
            async () => {
                return request<any[]>(`/api/v1/status/downtime/history?limit=${limit}&days=${days}`, {
                    timeout: 10000,
                });
            },
            [`global-downtime-${limit}-${days}`],
            { revalidate: 30, tags: ['downtime'] }
        )();
    }
}

// Re-export for backwards compatibility and convenience
export const getLatestStatus = StatusMonitorService.getLatestStatus;
export const getHistoricalStatus = StatusMonitorService.getHistoricalStatus;
