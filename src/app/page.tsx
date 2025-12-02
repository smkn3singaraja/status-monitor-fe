import { cache } from 'react';
import { StatusMonitorService } from '@/lib/api';
import { StatusGrid } from '@/components/status-grid';
import { formatDate, calculateOverallUptime } from '@/lib/utils';
import { Suspense } from 'react';
import { Activity, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

async function getTotalViews() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${API_URL}/api/v1/analytics/views`, { cache: 'no-store' });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.data?.total_views || 0;
  } catch (e) {
    return 0;
  }
}



function StatusSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function ErrorDisplay() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">Unable to Connect</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        Cannot reach the monitoring service. Please ensure the backend is running.
      </p>
    </div>
  );
}

export default async function Home() {
  const latestStatus = await StatusMonitorService.getLatestStatus().catch(() => ({ services: [] }));
  const totalViews = await getTotalViews();

  if (!latestStatus || latestStatus.services.length === 0) {
    return <ErrorDisplay />;
  }

  const upCount = latestStatus.services.filter((s: { status: string }) => s.status === 'up').length;
  const totalCount = latestStatus.services.length;
  const overallUptime = calculateOverallUptime(latestStatus.services);
  const isSystemHealthy = upCount === totalCount;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Status</h1>
          <p className="text-sm text-muted-foreground">Real-time service monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Eye className="w-4 h-4" />
            <span>{totalViews.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isSystemHealthy ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-medium text-foreground">
              {isSystemHealthy ? 'All Systems Operational' : 'System Issues Detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Clean Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-muted-foreground">Online</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">{upCount}</div>
        </div>

        <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs font-medium text-muted-foreground">Offline</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">{totalCount - upCount}</div>
        </div>

        <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground mb-1">Total</div>
          <div className="text-2xl font-semibold text-foreground">{totalCount}</div>
        </div>

        <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground mb-1">Uptime</div>
          <div className="text-2xl font-semibold text-foreground">{overallUptime.toFixed(1)}%</div>
        </div>
      </div>

      {/* Services List */}
      <Suspense fallback={<StatusSkeleton />}>
        <StatusGrid services={latestStatus.services} />
      </Suspense>
    </div>
  );
}
