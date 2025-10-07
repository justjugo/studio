'use client';

import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>TCF Prep App</title>
        <meta name="description" content="Your personal companion to ace the TCF exam." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
            <AppLayout>{children}</AppLayout>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
