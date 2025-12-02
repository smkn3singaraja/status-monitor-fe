import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { StatusCheck } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

export function calculateOverallUptime(checks: StatusCheck[]): number {
  if (!checks || checks.length === 0) return 100;
  const upChecks = checks.filter((check) => check.status === 'up').length;
  return Math.round((upChecks / checks.length) * 100);
}
