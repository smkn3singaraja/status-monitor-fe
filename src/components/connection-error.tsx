'use client';

import { Laptop, Server, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ConnectionError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="relative flex items-center justify-center gap-24 mb-8 p-8">
                {/* Frontend Icon */}
                <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shadow-sm border border-border">
                        <Laptop className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Frontend</span>
                </div>

                {/* Disconnected State */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 z-10">
                        <WifiOff className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="w-48 h-[2px] bg-border absolute top-4 -z-0 border-t border-dashed border-muted-foreground/30" />
                </div>

                {/* Backend Icon */}
                <div className="flex flex-col items-center gap-2 opacity-50">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shadow-sm border border-border">
                        <Server className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Backend</span>
                </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">Connection Lost</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                We're having trouble connecting to the status server.
                <br />
                Please verify your internet connection or try again later.
            </p>

            <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
            >
                <RefreshCw className="w-4 h-4" />
                Try Again
            </Button>
        </div>
    );
}
