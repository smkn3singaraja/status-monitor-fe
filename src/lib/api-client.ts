import { LatestStatusResponse, API_ERROR_CODES, DowntimeLog, HistoricalQueryParams, HistoricalStatusResponse } from './types';
import { decryptResponseClient } from './crypto-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Simple in-memory cache
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 30 * 1000; // 30 seconds

function getFromCache<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setCache<T>(key: string, data: T) {
    cache.set(key, { data, timestamp: Date.now() });
}

export class StatusMonitorAPIError extends Error {
    constructor(
        message: string,
        public code: string,
        public status?: number
    ) {
        super(message);
        this.name = 'StatusMonitorAPIError';
    }

    static networkError(message: string = 'Network error occurred'): StatusMonitorAPIError {
        return new StatusMonitorAPIError(message, API_ERROR_CODES.NETWORK_ERROR);
    }
}

export async function getLatestStatusClient(): Promise<LatestStatusResponse> {
    const cacheKey = 'latest-status';
    const cached = getFromCache<LatestStatusResponse>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${API_URL}/api/v1/status/latest`, {
            headers: {
                'Content-Type': 'application/json',
            },
            // Add cache control to prevent stale data
            cache: 'no-store'
        });

        if (!response.ok) {
            throw StatusMonitorAPIError.networkError(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let result: LatestStatusResponse;

        // Check if response is encrypted
        if (data.ephemPublicKey && data.iv && data.data) {
            const decryptedData = await decryptResponseClient(data);

            // Unwrap the APIResponse structure
            if (decryptedData.success && decryptedData.data) {
                result = decryptedData.data as LatestStatusResponse;
            } else {
                result = decryptedData as LatestStatusResponse;
            }
        } else if (data.success && data.data) {
            result = data.data as LatestStatusResponse;
        } else {
            throw new Error('Invalid response format');
        }

        setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Client-side fetch error:', error);
        throw error;
    }
}

export async function getRecentDowntimeClient(serviceName: string, limit: number = 5): Promise<DowntimeLog[]> {
    const cacheKey = `downtime-${serviceName}-${limit}`;
    const cached = getFromCache<DowntimeLog[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${API_URL}/api/v1/status/${encodeURIComponent(serviceName)}/downtime?limit=${limit}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Failed to fetch downtime logs:', response.statusText);
            return [];
        }

        const data = await response.json();
        let result: DowntimeLog[] = [];

        // Check if response is encrypted
        if (data.ephemPublicKey && data.iv && data.data) {
            const decryptedData = await decryptResponseClient(data);

            // Unwrap the APIResponse structure
            if (decryptedData.success && decryptedData.data) {
                result = decryptedData.data as DowntimeLog[];
            } else {
                result = decryptedData as DowntimeLog[];
            }
        } else if (data.success && data.data) {
            result = data.data as DowntimeLog[];
        }

        setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Client-side downtime fetch error:', error);
        return [];
    }
}

export async function getHistoricalStatusClient(params: HistoricalQueryParams): Promise<HistoricalStatusResponse[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('start', params.start);
    if (params.end) searchParams.append('end', params.end);
    if (params.service) searchParams.append('service', params.service);
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const cacheKey = `historical-${searchParams.toString()}`;
    const cached = getFromCache<HistoricalStatusResponse[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${API_URL}/api/v1/status/historical?${searchParams.toString()}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Failed to fetch historical status:', response.statusText);
            return [];
        }

        const data = await response.json();
        let result: HistoricalStatusResponse[] = [];

        if (data.ephemPublicKey && data.iv && data.data) {
            const decryptedData = await decryptResponseClient(data);
            if (decryptedData.success && decryptedData.data) {
                result = decryptedData.data as HistoricalStatusResponse[];
            } else {
                result = decryptedData as HistoricalStatusResponse[];
            }
        } else if (data.success && data.data) {
            result = data.data as HistoricalStatusResponse[];
        }

        setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Client-side historical fetch error:', error);
        return [];
    }
}

export async function getGlobalDowntimeClient(limit: number = 100, days: number = 7): Promise<DowntimeLog[]> {
    const cacheKey = `global-downtime-${limit}-${days}`;
    const cached = getFromCache<DowntimeLog[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${API_URL}/api/v1/status/downtime/history?limit=${limit}&days=${days}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Failed to fetch global downtime logs:', response.statusText);
            return [];
        }

        const data = await response.json();
        let result: DowntimeLog[] = [];

        if (data.ephemPublicKey && data.iv && data.data) {
            const decryptedData = await decryptResponseClient(data);
            if (decryptedData.success && decryptedData.data) {
                result = decryptedData.data as DowntimeLog[];
            } else {
                result = decryptedData as DowntimeLog[];
            }
        } else if (data.success && data.data) {
            result = data.data as DowntimeLog[];
        }

        setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Client-side global downtime fetch error:', error);
        return [];
    }
}
