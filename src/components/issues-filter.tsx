'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function IssuesFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentDays = searchParams.get('days') || '7';

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('days', value);
        router.push(`/issues?${params.toString()}`);
        router.refresh();
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Time Range:</span>
            <Select value={currentDays} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">Last 24 Hours</SelectItem>
                    <SelectItem value="3">Last 3 Days</SelectItem>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="14">Last 14 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
