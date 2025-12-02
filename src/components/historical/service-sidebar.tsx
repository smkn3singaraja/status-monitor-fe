"use client";

import { StatusCheck } from '@/lib/types';
import { groupAndSortServices } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface ServiceSidebarProps {
    services: StatusCheck[];
    selectedService: string;
}

export function ServiceSidebar({ services, selectedService }: ServiceSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isOpen, setIsOpen] = useState(false);

    const handleSelectService = (serviceName: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('service', serviceName);
        router.push(`/historical?${params.toString()}`);
        setIsOpen(false);
    };

    // Use centralized grouping and sorting logic
    const groupedServices = groupAndSortServices(services);

    const ServiceList = () => (
        <div className="space-y-6">
            {groupedServices.map((group) => (
                <div key={group.name}>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-3">
                        {group.name}
                    </h3>
                    <div className="space-y-1">
                        {group.subGroups.map(subGroup => (
                            subGroup.services.map((service) => (
                                <button
                                    key={service.service_name}
                                    onClick={() => handleSelectService(service.service_name)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${selectedService === service.service_name
                                        ? 'bg-card text-primary font-semibold shadow-sm ring-1 ring-border'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${service.status === 'up' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                        {service.service_name}
                                    </div>
                                </button>
                            ))
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar Trigger */}
            <div className="lg:hidden mb-4">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-md shadow-sm text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <Menu className="w-4 h-4" />
                            Select Service
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                        <SheetHeader className="mb-6">
                            <SheetTitle>Select Service</SheetTitle>
                        </SheetHeader>
                        <ServiceList />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-8">
                    <h2 className="text-lg font-semibold mb-6 px-2">Services</h2>
                    <ServiceList />
                </div>
            </div>
        </>
    );
}
