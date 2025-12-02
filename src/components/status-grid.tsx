import { StatusCheck } from '@/lib/types';
import { StatusCard } from './status-card';

interface StatusGridProps {
    services: StatusCheck[];
}

export function StatusGrid({ services }: StatusGridProps) {
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
    const groupedServices = services.reduce((acc, service) => {
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
        <div className="space-y-10">
            {sortedGroups.map((group) => {
                const subGroups = groupedServices[group];
                const sortedSubGroups = Object.keys(subGroups).sort();

                return (
                    <div key={group} className="space-y-6">
                        <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                            {group}
                        </h2>

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
                                            <StatusCard key={`${service.service_name}-${index}`} status={service} />
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
