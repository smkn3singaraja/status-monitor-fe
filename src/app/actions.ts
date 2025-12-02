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

export async function getRecentDowntimeAction(serviceName: string, limit: number = 5): Promise<DowntimeLog[]> {
    try {
        const response = await fetch(`${API_URL}/api/v1/status/${encodeURIComponent(serviceName)}/downtime?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 10 },
        });

        if (!response.ok) {
            console.error('Failed to fetch downtime logs:', response.statusText);
            return [];
        }

        const data = await response.json();

        // Check if response is encrypted
        if (data.key && data.iv && data.data) {
            const decrypted = await decryptResponse(data);
            if (!decrypted.success) {
                console.error('API Error (Decrypted):', decrypted.error);
                return [];
            }
            return decrypted.data || [];
        }

        return data.data || [];
    } catch (error) {
        console.error('Error fetching downtime logs:', error);
        return [];
    }
}
