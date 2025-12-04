import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { ThemeProvider } from "@/components/theme-provider"
import { PageViewTracker } from '@/components/page-view-tracker';
import { Analytics } from "@vercel/analytics/next";

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
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STEMSI Apps Monitor | Status Web SMKN 3 Singaraja',
    description: 'Real-time service status monitoring for SMKN 3 Singaraja (STEMSI).',
    creator: '@smkn3singaraja',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
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
          <main className="flex-1 pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
          <footer className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient text-white py-2 text-center text-[12px] font-medium tracking-wide shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col items-center gap-1">
              <span>STEMSI Monitor © {new Date().getFullYear()} • Built for Reliability</span>
              <a
                href="https://wa.me/6285646505614?text=%5BAMERTA%20SUPPORT%5D%0A%0A*ISI%20DATA%20DIRI%20DI%20BAWAH*%20%0ANama%3A%20%0ANISN%3A%0ANIS%3A%0AKelas%3A%0A%0A%20_Tulis%20pesan%20anda%20disini_%0A%0ANB%3A%20Tambahkan%20screenshot%20(jika%20mengalami%20kendala)%20agar%20admin%20dapat%20menyelesaikan%20masalah%20lebih%20cepat"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-200 flex items-center gap-1"
              >
                Contact Support
              </a>
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
