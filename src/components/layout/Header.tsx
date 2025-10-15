
'use client';

import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export function Header({ title, showSidebarToggle = true }: { title: string, showSidebarToggle?: boolean }) {
    const { setOpen, open } = useSidebar();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-4">
                {showSidebarToggle && (
                    <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
                        {open ? (
                            <PanelLeftClose className="h-6 w-6" />
                        ) : (
                            <PanelRightClose className="h-6 w-6" />
                        )}
                        <span className="sr-only">Toggle main sidebar</span>
                    </Button>
                )}
                <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
            </div>
        </header>
    )
}
