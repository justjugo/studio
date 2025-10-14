
'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Menu, PanelLeftClose } from 'lucide-react';

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
  className?: string;
};

export function Header({ title, children, className }: HeaderProps) {

  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <header className={cn("flex h-20 items-center justify-between border-b bg-card px-4 md:px-6", className)}>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
        >
          {isSidebarOpen ? <PanelLeftClose className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <h1 className="font-headline text-2xl font-bold text-foreground">{title}</h1>
      </div>
      <div>{children}</div>
    </header>
  );
}
