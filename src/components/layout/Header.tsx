
'use client';

import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelRightClose, Sparkles } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';

export function Header({ title, showSidebarToggle = true }: { title: string, showSidebarToggle?: boolean }) {
    const { toggleSidebar, open, openMobile, isMobile } = useSidebar();

    const isSidebarOpen = isMobile ? openMobile : open;

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-4">
                {showSidebarToggle && (
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isSidebarOpen ? (
                            <PanelLeftClose className="h-6 w-6" />
                        ) : (
                            <PanelRightClose className="h-6 w-6" />
                        )}
                        <span className="sr-only">Toggle main sidebar</span>
                    </Button>
                )}
                <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
                 <Button asChild variant="outline" className="border-2 border-purple-500/50 text-purple-600 hover:bg-purple-500/10 hover:text-purple-600 hover:no-underline shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow">
                    <Link href="https://n8n-m1ji.onrender.com/webhook/2f8b8ccc-f4bb-4822-8cc4-f59d79856b0a/chat" target="_blank" className="flex items-center gap-2 px-4 py-2">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-base font-semibold">Discuter avec le professeure  </span>
                    </Link>
                </Button>
            </div>
        </header>
    )
}
