'use client';

import { HistoricalDataPoint } from '@/lib/types';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/lib/utils';

interface HistoricalChartProps {
    dataPoints: HistoricalDataPoint[];
    serviceName: string;
}

export function HistoricalChart({ dataPoints, serviceName }: HistoricalChartProps) {
    if (dataPoints.length === 0) {
        return (
            <div className="flex items-center justify-center h-[400px] border rounded-lg">
                <p className="text-muted-foreground">No data available for the selected period</p>
            </div>
        );
    }

    // Transform data for charts
    const chartData = dataPoints.map((point) => ({
        timestamp: new Date(point.timestamp).getTime(),
        responseTime: point.response_time_ms,
        status: point.status === 'up' ? 1 : 0,
        displayTime: formatDate(point.timestamp),
    }));

    return (
        <div className="space-y-8">
            {/* Response Time Chart */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Response Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(timestamp) =>
                                new Date(timestamp).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                })
                            }
                            className="text-xs"
                        />
                        <YAxis
                            label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
                            className="text-xs"
                        />
                        <Tooltip
                            labelFormatter={(timestamp) => formatDate(new Date(timestamp as number))}
                            formatter={(value: number) => [`${value.toFixed(2)}ms`, 'Response Time']}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="responseTime"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                            name="Response Time"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Uptime Chart */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Availability</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(timestamp) =>
                                new Date(timestamp).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                })
                            }
                            className="text-xs"
                        />
                        <YAxis
                            domain={[0, 1]}
                            ticks={[0, 1]}
                            tickFormatter={(value) => (value === 1 ? 'Up' : 'Down')}
                            className="text-xs"
                        />
                        <Tooltip
                            labelFormatter={(timestamp) => formatDate(new Date(timestamp as number))}
                            formatter={(value: number) => [value === 1 ? 'Up' : 'Down', 'Status']}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                        />
                        <Area
                            type="stepAfter"
                            dataKey="status"
                            stroke="hsl(142.1 76.2% 36.3%)"
                            fill="hsl(142.1 76.2% 36.3% / 0.2)"
                            name="Status"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
