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
            <div className="bg-red-50 p-4 rounded-full mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong!
            </h2>

            <p className="text-gray-600 mb-8 max-w-md">
                We encountered an unexpected error. Please try again or return to the dashboard.
            </p>

            {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 p-4 rounded-lg mb-8 max-w-lg w-full text-left overflow-auto text-xs font-mono text-red-800">
                    {error.message}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                    <Home className="w-4 h-4" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
