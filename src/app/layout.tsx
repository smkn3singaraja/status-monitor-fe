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
  title: 'STEMSI Apps Monitor',
  description: 'Service monitoring dashboard',
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
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-medium py-1 text-center tracking-wide">
            Crafted by <strong className="font-bold">Dedan Labs</strong> hosted on <strong className="font-bold">nbtrisna server</strong>
          </div>
          <Navigation />
          <PageViewTracker />
          <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
