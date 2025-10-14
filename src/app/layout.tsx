
'use client';

import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainSidebarControlProvider, useMainSidebarControl } from '@/context/MainSidebarControlContext';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics } from "@vercel/analytics/next"

// A wrapper component to consume the context and apply to SidebarProvider
function MainSidebarWrapper({ children }: { children: React.ReactNode }) {
  const { isMainSidebarMinimized } = useMainSidebarControl();

  return (
    <SidebarProvider open={!isMainSidebarMinimized}> {/* Control open prop based on context */}
      {children}
    </SidebarProvider>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = useMemo(() => pathname === '/login' || pathname === '/signup'  || pathname === '/verify-email', [pathname]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <MainSidebarControlProvider>
      <MainSidebarWrapper>
        <AppLayout>{children}</AppLayout>
      </MainSidebarWrapper>
    </MainSidebarControlProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>App de Préparation TCF</title>
        <meta name="description" content="Votre compagnon personnel pour réussir l'examen du TCF." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AppContent>{children}</AppContent>
            <Toaster />
            <Analytics />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
