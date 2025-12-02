'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Activity, Menu, Sun, Moon, Monitor, MessageCircle, Headset } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export function Navigation() {
    const pathname = usePathname();
    const { setTheme, theme } = useTheme();

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

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
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
                        <Button
                            variant="default"
                            size="sm"
                            className="ml-2 gap-2 bg-green-600 hover:bg-green-700 text-white"
                            asChild
                        >
                            <a
                                href="https://api.whatsapp.com/send?text=%5BAMERTA%20SUPPORT%5D%0A%0A*ISI%20DATA%20DIRI%20DI%20BAWAH*%20%0ANama%3A%20%0ANISN%3A%0ANIS%3A%0AKelas%3A%0A%0A%20_Tulis%20pesan%20anda%20disini_%0A%0ANB%3A%20Tambahkan%20screenshot%20(jika%20mengalami%20kendala)%20agar%20admin%20dapat%20menyelesaikan%20masalah%20lebih%20cepat"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Contact Support
                            </a>
                        </Button>
                        <div className="ml-2 pl-2 border-l border-border">
                            <ModeToggle />
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 dark:text-green-400 gap-2"
                            asChild
                        >
                            <a
                                href="https://api.whatsapp.com/send?text=%5BAMERTA%20SUPPORT%5D%0A%0A*ISI%20DATA%20DIRI%20DI%20BAWAH*%20%0ANama%3A%20%0ANISN%3A%0ANIS%3A%0AKelas%3A%0A%0A%20_Tulis%20pesan%20anda%20disini_%0A%0ANB%3A%20Tambahkan%20screenshot%20(jika%20mengalami%20kendala)%20agar%20admin%20dapat%20menyelesaikan%20masalah%20lebih%20cepat"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Headset className="h-4 w-4" />
                                <span className="font-medium">Contact</span>
                            </a>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                                {links.map((link) => (
                                    <DropdownMenuItem key={link.href} asChild>
                                        <Link
                                            href={link.href}
                                            className={`w-full cursor-pointer ${pathname === link.href ? 'bg-accent' : ''}`}
                                        >
                                            {link.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                                <div className="p-2 flex gap-1 bg-muted/50 rounded-md mx-2">
                                    <Button
                                        variant={theme === 'light' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="flex-1 h-8 px-0"
                                        onClick={() => setTheme('light')}
                                    >
                                        <Sun className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={theme === 'dark' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="flex-1 h-8 px-0"
                                        onClick={() => setTheme('dark')}
                                    >
                                        <Moon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={theme === 'system' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="flex-1 h-8 px-0"
                                        onClick={() => setTheme('system')}
                                    >
                                        <Monitor className="h-4 w-4" />
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    );
}
