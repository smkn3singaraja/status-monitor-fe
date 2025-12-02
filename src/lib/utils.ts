import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ServiceStatus, StatusCheck } from "./types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    // Check for invalid date
    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(d);
}

// Response time formatting utilities
export function formatResponseTime(ms: number): string {
    if (!isFinite(ms) || ms < 0) return 'N/A';

    if (ms < 1000) {
        return `${ms.toFixed(0)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
}

export function getResponseTimeClass(ms: number): string {
    if (ms < 100) return 'text-green-600';
    if (ms < 500) return 'text-yellow-600';
    if (ms < 1000) return 'text-orange-600';
    return 'text-red-600';
}

// Uptime utilities
export function calculateUptimeColor(percentage: number): string {
    if (percentage >= 99.9) return 'text-green-600';
    if (percentage >= 99) return 'text-green-500';
    if (percentage >= 95) return 'text-yellow-600';
    if (percentage >= 90) return 'text-orange-600';
    return 'text-red-600';
}

export function getUptimeBadgeVariant(percentage: number): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' {
    if (percentage >= 99.5) return 'success';
    if (percentage >= 95) return 'warning';
    return 'destructive';
}

// Status utilities
export function getStatusColor(status: ServiceStatus): string {
    return status === 'up' ? 'bg-green-500' : 'bg-red-500';
}

export function getStatusTextColor(status: ServiceStatus): string {
    return status === 'up' ? 'text-green-600' : 'text-red-600';
}

export function getStatusBadgeVariant(status: ServiceStatus): 'success' | 'destructive' {
    return status === 'up' ? 'success' : 'destructive';
}

// Data transformation utilities
export function groupServicesByStatus(services: StatusCheck[]): {
    up: StatusCheck[];
    down: StatusCheck[];
} {
    return services.reduce(
        (acc, service) => {
            if (service.status === 'up') {
                acc.up.push(service);
            } else {
                acc.down.push(service);
            }
            return acc;
        },
        { up: [] as StatusCheck[], down: [] as StatusCheck[] }
    );
}

export function calculateOverallUptime(services: StatusCheck[]): number {
    if (services.length === 0) return 0;
    const upCount = services.filter(s => s.status === 'up').length;
    return (upCount / services.length) * 100;
}

// Memoization utility for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
    fn: T,
    ttl: number = 5000
): T {
    const cache = new Map<string, { value: any; timestamp: number }>();

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);
        const cached = cache.get(key);
        const now = Date.now();

        if (cached && now - cached.timestamp < ttl) {
            return cached.value;
        }

        const value = fn(...args);
        cache.set(key, { value, timestamp: now });

        // Cleanup old entries
        if (cache.size > 100) {
            const oldestKey = cache.keys().next().value as string;
            if (oldestKey) {
                cache.delete(oldestKey);
            }
        }

        return value;
    }) as T;
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// Validation utilities
export function isValidDateRange(start: Date, end: Date): boolean {
    return start.getTime() <= end.getTime();
}

export function sanitizeInput(input?: string): string {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
}
