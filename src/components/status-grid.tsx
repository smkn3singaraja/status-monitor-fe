'use client';

import { StatusCheck } from '@/lib/types';
import { StatusCard } from './status-card';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronUp } from 'lucide-react';
import { groupAndSortServices } from '@/lib/utils';
import { getLatestStatusClient } from '@/lib/api-client';
import { ConnectionError } from '@/components/connection-error';

export function StatusGrid() {
    const [services, setServices] = useState<StatusCheck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getLatestStatusClient();
                if (data && data.services) {
                    setServices(data.services);
                }
            } catch (err) {
                console.error('Failed to fetch status:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleService = (serviceName: string) => {
        const newSet = new Set(expandedServices);
        if (newSet.has(serviceName)) {
            newSet.delete(serviceName);
        } else {
            newSet.add(serviceName);
        }
        setExpandedServices(newSet);
    };

    const collapseAll = () => {
        setExpandedServices(new Set());
    };

    if (loading) {
        return (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return <ConnectionError />;
    }

    if (services.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-muted-foreground">No services are being monitored</p>
                </div>
            </div>
        );
    }

    // Use centralized grouping and sorting logic
    const groupedServices = groupAndSortServices(services);

    return (
        <div className="space-y-10 relative">
            {expandedServices.size > 0 && (
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Button
                        onClick={collapseAll}
                        className="shadow-lg rounded-full"
                        size="sm"
                    >
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Collapse All ({expandedServices.size})
                    </Button>
                </div>
            )}

            {groupedServices.map((group) => (
                <div key={group.name} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h2 className="text-xl font-bold text-foreground">
                            {group.name}
                        </h2>
                    </div>

                    <div className="space-y-8">
                        {group.subGroups.map((subGroup) => (
                            <div key={`${group.name}-${subGroup.name}`} className="space-y-3">
                                {/* Only show sub-group header if it's not "General" or if there are multiple sub-groups */}
                                {(subGroup.name !== 'General' || group.subGroups.length > 1) && (
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        {subGroup.name}
                                    </h3>
                                )}

                                <div className="space-y-2">
                                    {subGroup.services.map((service, index) => (
                                        <StatusCard
                                            key={`${service.service_name}-${index}`}
                                            status={service}
                                            isExpanded={expandedServices.has(service.service_name)}
                                            onToggle={() => toggleService(service.service_name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
