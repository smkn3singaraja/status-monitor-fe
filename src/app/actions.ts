'use server';

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
