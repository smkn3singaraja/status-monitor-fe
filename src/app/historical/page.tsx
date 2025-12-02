

import { StatusMonitorService } from '@/lib/api';
import { HistoricalChart } from '@/components/historical-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { ServiceSidebar } from '@/components/historical/service-sidebar';
import { DateRangeSelector } from '@/components/historical/date-range-selector';

// Server Component
export default async function HistoricalPage({
    searchParams,
}: {
    searchParams: Promise<{ service?: string; days?: string }>;
}) {
    // Await searchParams (Next.js 15+ requirement, good practice generally)
    const params = await searchParams;

    // Fetch services
    const latestStatus = await StatusMonitorService.getLatestStatus().catch(() => ({ services: [] }));
    const services = latestStatus.services;

    // Determine selected service and date range
    const selectedService = params.service || (services.length > 0 ? services[0].service_name : '');
    const days = params.days || '7';
    const daysInt = parseInt(days);

    // Fetch historical data if a service is selected
    let currentData = null;
    let error = null;
    let dateRange = {
        start: subDays(new Date(), daysInt),
        end: new Date(),
    };

    if (selectedService) {
        try {
            const historicalData = await StatusMonitorService.getHistoricalStatus({
                start: dateRange.start.toISOString(),
                end: dateRange.end.toISOString(),
                service: selectedService,
            });
            if (historicalData && historicalData.length > 0) {
                currentData = historicalData[0];
            }
        } catch (err) {
            error = "Failed to load historical data";
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)]">
            {/* Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <ServiceSidebar services={services} selectedService={selectedService} />
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
                    <DateRangeSelector days={days} />
                </div>

                {error ? (
                    <div className="rounded-lg bg-red-500/10 p-4 text-red-600 dark:text-red-400">
                        {error}
                    </div>
                ) : currentData && currentData.statistics ? (
                    <div className="space-y-6">
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
        </div>
    );
}
