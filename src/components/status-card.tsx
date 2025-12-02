'use client';

import { StatusCheck, DowntimeLog } from '@/lib/types';
import { useState, useMemo } from 'react';
import { ShieldCheck, AlertCircle, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { getRecentDowntimeAction } from '@/app/actions';

interface StatusCardProps {
    status: StatusCheck;
}

export function StatusCard({ status }: StatusCardProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [downtimeLogs, setDowntimeLogs] = useState<DowntimeLog[]>([]);
    const [logsLoaded, setLogsLoaded] = useState(false);

    const handleExpand = async () => {
        const newExpandedState = !isExpanded;
        setIsExpanded(newExpandedState);

        if (newExpandedState && !logsLoaded) {
            setLoadingLogs(true);
            try {
                const logs = await getRecentDowntimeAction(status.service_name, 2);
                setDowntimeLogs(logs);
                setLogsLoaded(true);
            } catch (error) {
                console.error("Failed to load logs", error);
            } finally {
                setLoadingLogs(false);
            }
        }
    };

    const isUp = status.status === 'up';
    const statusColor = isUp ? 'bg-green-500' : 'bg-red-500';

    const formattedTime = useMemo(() => {
        return new Date(status.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [status.timestamp]);

    return (
        <div className="w-full">
            <div
                className="bg-card text-card-foreground border border-border rounded-lg p-3 hover:border-ring/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between group cursor-pointer shadow-sm"
                onClick={handleExpand}
            >
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{status.service_name}</span>
                        {status.description && (
                            <span className="text-xs text-muted-foreground">{status.description}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        {/* Certificate Expiry */}
                        {status.cert_expiry_days !== undefined && status.cert_expiry_days > 0 && (
                            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${status.cert_expiry_days < 7
                                ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                : status.cert_expiry_days < 30
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    : 'bg-primary/10 text-primary border-primary/20'
                                }`}>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{status.cert_expiry_days} days</span>
                                <span className="sm:hidden">{status.cert_expiry_days}d</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {status.error_message && (
                            <div className="flex items-center gap-1.5 text-red-500 text-xs">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[100px] sm:max-w-[200px]">{status.error_message}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Status Badge */}
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${isUp
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                            }`}>
                            {isUp ? 'Operational' : 'Downtime'}
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs tabular-nums">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formattedTime}</span>
                        </div>

                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>

            {/* Expanded Content - Downtime Logs */}
            {isExpanded && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-border space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pt-2 mb-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Downtime Logs</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/historical?service=${encodeURIComponent(status.service_name)}`);
                            }}
                        >
                            View Details
                        </Button>
                    </div>
                    {loadingLogs ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading logs...
                        </div>
                    ) : downtimeLogs.length > 0 ? (
                        <div className="space-y-2">
                            {downtimeLogs.map((log, idx) => (
                                <div key={idx} className="bg-muted/50 rounded p-2 text-xs flex items-start gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-foreground">{log.error}</span>
                                            <span className="text-muted-foreground">{format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}</span>
                                        </div>
                                        <div className="text-muted-foreground">Duration: {log.duration}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic py-2">
                            No recent downtime logs found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
