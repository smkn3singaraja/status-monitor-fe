// Branded types for type safety
export type ServiceName = string & { readonly __brand: 'ServiceName' };
export type ServerLabel = string & { readonly __brand: 'ServerLabel' };
export type ISODateString = string & { readonly __brand: 'ISODateString' };

// Status constants
export const SERVICE_STATUS = {
    UP: 'up',
    DOWN: 'down',
} as const;

export type ServiceStatus = typeof SERVICE_STATUS[keyof typeof SERVICE_STATUS];

// API Response Types matching backend exactly
export interface StatusCheck {
    service_name: string;
    description?: string;
    group: string;
    sub_group: string;
    order: number;
    server_label: string;
    status: 'up' | 'down';
    response_time_ms: number;
    status_code?: number;
    error_message?: string;
    cert_expiry_days?: number;
    timestamp: string;
}

export interface LatestStatusResponse {
    timestamp: string;
    services: StatusCheck[];
}

export interface HistoricalDataPoint {
    timestamp: string;
    status: ServiceStatus;
    response_time_ms: number;
    status_code?: number;
}

export interface Statistics {
    uptime_percentage: number;
    avg_response_time_ms: number;
    min_response_time_ms: number;
    max_response_time_ms: number;
    total_checks: number;
    successful_checks: number;
    failed_checks: number;
}

export interface HistoricalStatusResponse {
    service_name: string;
    description?: string;
    server_label: string;
    start_time: string;
    end_time: string;
    data_points: HistoricalDataPoint[];
    statistics?: Statistics;
}

export interface DowntimeLog {
    service_name: string;
    error: string;
    timestamp: string;
    duration: string;
}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: APIError;
}

export interface APIError {
    code: string;
    message: string;
}

// Query parameter types
export interface HistoricalQueryParams {
    service?: string;
    start: string;
    end?: string;
    limit?: number;
}

// UI-specific derived types
export interface ServiceWithMetrics extends StatusCheck {
    uptimeClass: string;
    statusIcon: 'check' | 'x';
    formattedResponseTime: string;
}

// Type guards
export function isSuccessResponse<T>(response: APIResponse<T>): response is APIResponse<T> & { success: true; data: T } {
    return response.success === true && response.data !== undefined;
}

export function isErrorResponse<T>(response: APIResponse<T>): response is APIResponse<T> & { success: false; error: APIError } {
    return response.success === false && response.error !== undefined;
}

// Constants
export const API_ERROR_CODES = {
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    INVALID_PARAMETER: 'INVALID_PARAMETER',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type APIErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];
