import { LatestStatusResponse, API_ERROR_CODES } from './types';
import { decryptResponseClient } from './crypto-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

        // Check if response is encrypted
        if (data.ephemPublicKey && data.iv && data.data) {
            const decryptedData = await decryptResponseClient(data);

            // Unwrap the APIResponse structure
            if (decryptedData.success && decryptedData.data) {
                return decryptedData.data as LatestStatusResponse;
            }
            // Fallback if structure is different (though backend seems consistent)
            return decryptedData as LatestStatusResponse;
        }

        if (data.success && data.data) {
            return data.data as LatestStatusResponse;
        }

        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Client-side fetch error:', error);
        throw error;
    }
}

import { DowntimeLog, HistoricalQueryParams, HistoricalStatusResponse } from './types';

export async function getRecentDowntimeClient(serviceName: string, limit: number = 5): Promise<DowntimeLog[]> {
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

        // Check if response is encrypted
        if (data.ephemPublicKey && data.iv && data.data) {
            const decryptedData = await decryptResponseClient(data);

            // Unwrap the APIResponse structure
            if (decryptedData.success && decryptedData.data) {
                return decryptedData.data as DowntimeLog[];
            }
            return decryptedData as DowntimeLog[];
        }

        if (data.success && data.data) {
            return data.data as DowntimeLog[];
        }

        return [];
    } catch (error) {
        console.error('Client-side downtime fetch error:', error);
        return [];
    }
}

export async function getHistoricalStatusClient(params: HistoricalQueryParams): Promise<HistoricalStatusResponse[]> {
    try {
        const searchParams = new URLSearchParams();
        searchParams.append('start', params.start);
        if (params.end) searchParams.append('end', params.end);
        if (params.service) searchParams.append('service', params.service);
        if (params.limit) searchParams.append('limit', params.limit.toString());

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

        if (data.ephemPublicKey && data.iv && data.data) {
            const decryptedData = await decryptResponseClient(data);
            if (decryptedData.success && decryptedData.data) {
                return decryptedData.data as HistoricalStatusResponse[];
            }
            return decryptedData as HistoricalStatusResponse[];
        }

        if (data.success && data.data) {
            return data.data as HistoricalStatusResponse[];
        }

        return [];
    } catch (error) {
        console.error('Client-side historical fetch error:', error);
        return [];
    }
}
