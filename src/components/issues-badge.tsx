'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getGlobalDowntimeAction } from '@/app/actions';

export function IssuesBadge() {
    const [issueCount, setIssueCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const logs = await getGlobalDowntimeAction(100, 3);
                setIssueCount(logs.length);
            } catch (error) {
                console.error('Failed to fetch issues count:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
        // Poll every 60 seconds
        const interval = setInterval(fetchIssues, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted text-muted-foreground animate-pulse">
                Loading...
            </div>
        );
    }

    const hasIssues = issueCount > 0;

    return (
        <Link
            href="/issues"
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${hasIssues
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
        >
            <AlertTriangle className={`w-3.5 h-3.5 ${hasIssues ? 'animate-pulse' : ''}`} />
            <span>
                {issueCount} Issue{issueCount !== 1 ? 's' : ''}
            </span>
        </Link>
    );
}
