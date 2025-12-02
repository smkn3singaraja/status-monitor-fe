'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-red-500/10 p-4 rounded-full mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong!
            </h2>

            <p className="text-muted-foreground mb-8 max-w-md">
                We encountered an unexpected error. Please try again or return to the dashboard.
            </p>

            {process.env.NODE_ENV === 'development' && (
                <div className="bg-muted p-4 rounded-lg mb-8 max-w-lg w-full text-left overflow-auto text-xs font-mono text-red-600 dark:text-red-400">
                    {error.message}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-background border border-border text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium shadow-sm"
                >
                    <Home className="w-4 h-4" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
