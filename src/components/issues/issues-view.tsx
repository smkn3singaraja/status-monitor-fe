'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getGlobalDowntimeClient } from '@/lib/api-client';
import { DowntimeLog } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { IssuesFilter } from '@/components/issues-filter';
import { ConnectionError } from '@/components/connection-error';

export function IssuesView() {
    const searchParams = useSearchParams();
    const daysParam = searchParams.get('days') || '3';
    const days = parseInt(daysParam);

    const [logs, setLogs] = useState<DowntimeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError(false);
            try {
                const data = await getGlobalDowntimeClient(100, days);
                setLogs(data);
            } catch (err) {
                console.error('Failed to fetch issues:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [days]);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            Recent Issues
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Showing downtime events from the last {days} days (limit 100).
                        </p>
                    </div>
                    <IssuesFilter />
                </div>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error) {
        return <ConnectionError />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        Recent Issues
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Showing downtime events from the last {days} days (limit 100).
                    </p>
                </div>
                <IssuesFilter />
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No Recent Issues</h3>
                        <p className="text-muted-foreground mt-1">
                            All systems have been operational for the past {days} days.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-4 py-3">Service</th>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Duration</th>
                                    <th className="px-4 py-3">Error</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {logs.map((log, index) => (
                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {log.service_name}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                                    {log.duration}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-red-500/90 font-mono text-xs truncate max-w-[300px]" title={log.error}>
                                            {log.error}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
