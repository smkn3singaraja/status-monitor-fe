import { Metadata } from 'next';
import { IssuesView } from '@/components/issues/issues-view';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Recent Issues | Status Monitor',
    description: 'History of recent downtime events across all services.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export default function IssuesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <IssuesView />
        </Suspense>
    );
}
