'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HistoricalChart } from '@/components/historical-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { ServiceSidebar } from '@/components/historical/service-sidebar';
import { DateRangeSelector } from '@/components/historical/date-range-selector';
import { getHistoricalStatusClient, getRecentDowntimeClient } from '@/lib/api-client';
import { DowntimeLog, HistoricalStatusResponse, StatusCheck } from '@/lib/types';
import { ConnectionError } from '@/components/connection-error';

interface HistoricalViewProps {
    initialServices: StatusCheck[];
}

export function HistoricalView({ initialServices }: HistoricalViewProps) {
    const searchParams = useSearchParams();
    const serviceParam = searchParams.get('service');
    const daysParam = searchParams.get('days') || '7';

    const [selectedService, setSelectedService] = useState<string>('');
    const [currentData, setCurrentData] = useState<HistoricalStatusResponse | null>(null);
    const [downtimeLogs, setDowntimeLogs] = useState<DowntimeLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize selected service
    useEffect(() => {
        if (serviceParam) {
            setSelectedService(serviceParam);
        } else if (initialServices.length > 0) {
            setSelectedService(initialServices[0].service_name);
        }
    }, [serviceParam, initialServices]);

    // Fetch data when service or days change
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedService) return;

            setLoading(true);
            setError(null);

            const daysInt = parseInt(daysParam);
            const start = subDays(new Date(), daysInt).toISOString();
            const end = new Date().toISOString();

            try {
                const [historicalData, logs] = await Promise.all([
                    getHistoricalStatusClient({
                        start,
                        end,
                        service: selectedService,
                    }),
                    getRecentDowntimeClient(selectedService, 10)
                ]);

                if (historicalData && historicalData.length > 0) {
                    setCurrentData(historicalData[0]);
                } else {
                    setCurrentData(null);
                }
                setDowntimeLogs(logs);
            } catch (err) {
                console.error('Failed to load historical data:', err);
                setError('Failed to load historical data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedService, daysParam]);

    const daysInt = parseInt(daysParam);
    const dateRange = {
        start: subDays(new Date(), daysInt),
        end: new Date(),
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)]">
            {/* Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <ServiceSidebar services={initialServices} selectedService={selectedService} />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{selectedService || 'Select a Service'}</h1>
                        {currentData?.description && (
                            <p className="text-sm text-muted-foreground mt-1">{currentData.description}</p>
                        )}
                        {!currentData?.description && (
                            <p className="text-sm text-muted-foreground">Historical performance data</p>
                        )}
                    </div>

                    {/* Date Range Selector */}
                    <DateRangeSelector days={daysParam} />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="rounded-lg bg-red-500/10 p-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                ) : currentData && currentData.statistics ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground">Uptime</div>
                                    <div className={`text-2xl font-bold mt-2 ${currentData.statistics.uptime_percentage >= 99
                                        ? 'text-green-600 dark:text-green-400'
                                        : currentData.statistics.uptime_percentage >= 95
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {currentData.statistics.uptime_percentage.toFixed(2)}%
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground">Avg Response</div>
                                    <div className="text-2xl font-bold mt-2 text-foreground">
                                        {currentData.statistics.avg_response_time_ms.toFixed(0)}ms
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground">Total Checks</div>
                                    <div className="text-2xl font-bold mt-2 text-foreground">
                                        {currentData.statistics.total_checks.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground">Downtime</div>
                                    <div className="text-2xl font-bold mt-2 text-foreground">
                                        {currentData.statistics.failed_checks} <span className="text-sm font-normal text-muted-foreground">checks</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Response Time History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <HistoricalChart
                                    dataPoints={currentData.data_points}
                                    serviceName={currentData.service_name}
                                />
                            </CardContent>

                        </Card>

                        {/* Recent Downtime Logs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    Recent Downtime Logs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {downtimeLogs.length > 0 ? (
                                    <div className="space-y-4">
                                        {downtimeLogs.map((log, idx) => (
                                            <div key={idx} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm text-foreground">{log.error}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(new Date(log.timestamp), 'PPP p')}
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                                                    Duration: {log.duration}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground italic text-center py-4">
                                        No recent downtime logs found for this period.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Date Range Display */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center pt-4">
                            <Calendar className="h-4 w-4" />
                            <span>
                                Showing data from {format(dateRange.start, 'PPP')} to{' '}
                                {format(dateRange.end, 'PPP')}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Select a service to view historical data
                    </div>
                )}
            </div>
        </div >
    );
}
