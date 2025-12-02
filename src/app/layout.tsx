import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { ThemeProvider } from "@/components/theme-provider"
import { PageViewTracker } from '@/components/page-view-tracker';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'STEMSI Apps Monitor | Status Web SMKN 3 Singaraja',
    template: '%s | STEMSI Apps Monitor',
  },
  description: 'Real-time service status monitoring for SMKN 3 Singaraja (STEMSI). Check the availability of school applications, networks, and services instantly.',
  keywords: [
    'stemsi status',
    'status web smkn3singaraja',
    'smkn 3 singaraja',
    'stemsi apps',
    'uptime monitor',
    'service status',
    'network availability',
    'dedan labs'
  ],
  authors: [{ name: 'Dedan Labs' }],
  creator: 'Dedan Labs',
  publisher: 'SMKN 3 Singaraja',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://status.smkn3singaraja.sch.id',
    title: 'STEMSI Apps Monitor | Status Web SMKN 3 Singaraja',
    description: 'Real-time service status monitoring for SMKN 3 Singaraja (STEMSI). Check the availability of school applications, networks, and services instantly.',
    siteName: 'STEMSI Apps Monitor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STEMSI Apps Monitor | Status Web SMKN 3 Singaraja',
    description: 'Real-time service status monitoring for SMKN 3 Singaraja (STEMSI).',
    creator: '@smkn3singaraja',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-medium py-1 text-center tracking-wide animate-gradient">
            Crafted by <strong className="font-bold">Dedan Labs</strong> hosted on <strong className="font-bold">nbtrisna server</strong>
          </div>
          <Navigation />
          <PageViewTracker />
          <main className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-140px)]">
            {children}
          </main>
          <footer className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient text-white py-1.5 text-center text-[10px] font-medium tracking-wide shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            STEMSI Monitor © {new Date().getFullYear()} • Built for Reliability
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
