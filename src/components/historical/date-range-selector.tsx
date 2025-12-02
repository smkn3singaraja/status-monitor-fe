"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { subDays } from 'date-fns';

interface DateRangeSelectorProps {
    days: string;
}

export function DateRangeSelector({ days }: DateRangeSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (newDays: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('days', newDays);
        router.push(`/historical?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
                value={days}
                onChange={(e) => handleChange(e.target.value)}
                className="text-sm border-none bg-transparent focus:ring-0 font-medium text-foreground cursor-pointer"
            >
                <option value="1" className="bg-background">Last 24 Hours</option>
                <option value="7" className="bg-background">Last 7 Days</option>
                <option value="30" className="bg-background">Last 30 Days</option>
                <option value="90" className="bg-background">Last 90 Days</option>
            </select>
        </div>
    );
}
