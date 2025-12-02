'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordPageViewAction } from '@/app/actions';

export function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        const timer = setTimeout(() => {
            recordPageViewAction();
        }, 5000); // Record after 5 seconds

        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
