'use server';

import { DowntimeLog } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function recordPageViewAction() {
    try {
        const response = await fetch(`${API_URL}/api/v1/analytics/views`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to record page view:', response.statusText);
        }
    } catch (error) {
        console.error('Error recording page view:', error);
    }
}

import { decryptResponse } from '@/lib/crypto';

import { unstable_cache } from 'next/cache';

export async function getRecentDowntimeAction(serviceName: string, limit: number = 5): Promise<DowntimeLog[]> {
    return unstable_cache(
        async () => {
            try {
                const response = await fetch(`${API_URL}/api/v1/status/${encodeURIComponent(serviceName)}/downtime?limit=${limit}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Remove next: { revalidate } as it's handled by unstable_cache
                });

                if (!response.ok) {
                    console.error('Failed to fetch downtime logs:', response.statusText);
                    return [];
                }

                const data = await response.json();

                // Check if response is encrypted
                if (data.ephemPublicKey && data.iv && data.data) {
                    const decrypted = await decryptResponse(data);
                    if (!decrypted.success) {
                        console.error('API Error (Decrypted):', decrypted.error);
                        return [];
                    }
                    const result = decrypted.data;
                    return Array.isArray(result) ? result : [];
                }

                const result = data.data;
                return Array.isArray(result) ? result : [];
            } catch (error) {
                console.error('Error fetching downtime logs:', error);
                return [];
            }
        },
        [`downtime-${serviceName}-${limit}`],
        { revalidate: 10, tags: ['downtime'] }
    )();
}

export async function getGlobalDowntimeAction(limit: number = 100, days: number = 7): Promise<DowntimeLog[]> {
    return unstable_cache(
        async () => {
            try {
                const response = await fetch(`${API_URL}/api/v1/status/downtime/history?limit=${limit}&days=${days}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-store',
                });

                if (!response.ok) {
                    console.error('Failed to fetch global downtime logs:', response.statusText);
                    return [];
                }

                const data = await response.json();

                // Check if response is encrypted
                if (data.ephemPublicKey && data.iv && data.data) {
                    const decrypted = await decryptResponse(data);
                    if (!decrypted.success) {
                        console.error('API Error (Decrypted):', decrypted.error);
                        return [];
                    }
                    const result = decrypted.data;
                    return Array.isArray(result) ? result : [];
                }

                const result = data.data;
                return Array.isArray(result) ? result : [];
            } catch (error) {
                console.error('Error fetching global downtime logs:', error);
                return [];
            }
        },
        [`global-downtime-${limit}-${days}`],
        { revalidate: 30, tags: ['downtime'] }
    )();
}
