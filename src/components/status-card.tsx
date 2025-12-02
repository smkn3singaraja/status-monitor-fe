'use client';

import { StatusCheck, DowntimeLog } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Clock, ChevronDown, Loader2, History, ArrowRight, Timer } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { getRecentDowntimeAction } from '@/app/actions';

interface StatusCardProps {
    status: StatusCheck;
    isExpanded: boolean;
    onToggle: () => void;
}

export function StatusCard({ status, isExpanded, onToggle }: StatusCardProps) {
    const router = useRouter();
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [downtimeLogs, setDowntimeLogs] = useState<DowntimeLog[]>([]);
    const [logsLoaded, setLogsLoaded] = useState(false);

    // Fetch logs when expanded
    useEffect(() => {
        const fetchLogs = async () => {
            if (isExpanded && !logsLoaded && !loadingLogs) {
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
        fetchLogs();
    }, [isExpanded, logsLoaded, loadingLogs, status.service_name]);

    const isUp = status.status === 'up';
    const statusColor = isUp ? 'bg-green-500' : 'bg-red-500';

    const formattedTime = useMemo(() => {
        return new Date(status.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [status.timestamp]);

    return (
        <div className="w-full">
            <div
                className="bg-card text-card-foreground border border-border rounded-lg p-3 hover:border-ring/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between group cursor-pointer shadow-sm"
                onClick={onToggle}
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
            {/* Expanded Content - Downtime Logs */}
            {isExpanded && (
                <div className="mt-3 pt-2 border-t border-border/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            Recent Downtime
                        </h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/historical?service=${encodeURIComponent(status.service_name)}`);
                            }}
                        >
                            View All History
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>

                    {loadingLogs ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4 bg-muted/20 rounded-md">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Loading logs...</span>
                        </div>
                    ) : downtimeLogs.length > 0 ? (
                        <div className="space-y-2">
                            {downtimeLogs.map((log, idx) => (
                                <div
                                    key={idx}
                                    className="group/log bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border/50 transition-all rounded-md p-2.5 text-xs grid gap-1.5"
                                >
                                    {/* Header: Error and Time */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span className="break-all">{log.error}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 tabular-nums">
                                            <Clock className="w-3 h-3" />
                                            <span>{format(new Date(log.timestamp), 'MMM d, HH:mm')}</span>
                                        </div>
                                    </div>

                                    {/* Footer: Duration */}
                                    <div className="flex items-center gap-1.5 text-muted-foreground pl-5">
                                        <Timer className="w-3 h-3" />
                                        <span>Duration: <span className="text-foreground font-medium">{log.duration}</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground italic py-4 text-center bg-muted/20 rounded-md">
                            No recent downtime logs found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
