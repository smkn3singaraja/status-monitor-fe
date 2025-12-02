'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Activity } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Status' },
        { href: '/historical', label: 'History' },
    ];

    return (
        <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="STEMSI Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-foreground leading-tight">STEMSI</span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Apps Monitor</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-secondary text-secondary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div className="ml-2 pl-2 border-l border-border">
                            <ModeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
