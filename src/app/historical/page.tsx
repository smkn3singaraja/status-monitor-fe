
import { StatusMonitorService } from '@/lib/api';
import { HistoricalView } from '@/components/historical/historical-view';
import { Suspense } from 'react';

// Server Component
export default async function HistoricalPage() {
    // Fetch services for initial sidebar population
    const latestStatus = await StatusMonitorService.getLatestStatus().catch(() => ({ services: [] }));
    const services = latestStatus.services || [];

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <HistoricalView initialServices={services} />
        </Suspense>
    );
}
