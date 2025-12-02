'use client';

import { StatusCheck } from '@/lib/types';
import { StatusCard } from './status-card';
import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronUp } from 'lucide-react';

interface StatusGridProps {
    services: StatusCheck[];
}

export function StatusGrid({ services }: StatusGridProps) {
    const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

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

    if (services.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-muted-foreground">No services are being monitored</p>
                </div>
            </div>
        );
    }

    // Group services by group name, then by sub-group
    // Sort services: Order first, then Name
    const sortedServices = [...services].sort((a, b) => {
        if (a.order !== b.order) {
            return (a.order || 999) - (b.order || 999);
        }
        return a.service_name.localeCompare(b.service_name);
    });

    const groupedServices = sortedServices.reduce((acc, service) => {
        const group = service.group || 'Other Services';
        if (!acc[group]) {
            acc[group] = {};
        }

        const subGroup = service.sub_group || 'General';
        if (!acc[group][subGroup]) {
            acc[group][subGroup] = [];
        }

        acc[group][subGroup].push(service);
        return acc;
    }, {} as Record<string, Record<string, StatusCheck[]>>);

    // Sort groups
    const sortedGroups = Object.keys(groupedServices).sort((a, b) => {
        if (a === 'Server Status') return -1;
        if (b === 'Server Status') return 1;
        if (a === 'Apps') return -1;
        if (b === 'Apps') return 1;
        return a.localeCompare(b);
    });

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

            {sortedGroups.map((group) => {
                const subGroups = groupedServices[group];
                const sortedSubGroups = Object.keys(subGroups).sort();

                return (
                    <div key={group} className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h2 className="text-xl font-bold text-foreground">
                                {group}
                            </h2>
                            {/* Optional: Add group-level collapse here if needed */}
                        </div>

                        <div className="space-y-8">
                            {sortedSubGroups.map((subGroup) => (
                                <div key={`${group}-${subGroup}`} className="space-y-3">
                                    {/* Only show sub-group header if it's not "General" or if there are multiple sub-groups */}
                                    {(subGroup !== 'General' || sortedSubGroups.length > 1) && (
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                            {subGroup}
                                        </h3>
                                    )}

                                    <div className="space-y-2">
                                        {subGroups[subGroup].map((service, index) => (
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
                );
            })}
        </div>
    );
}
