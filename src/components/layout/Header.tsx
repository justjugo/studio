
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
  className?: string;
};

export function Header({ title, children, className }: HeaderProps) {
  const isMobile = useIsMobile();
  return (
    <header className={cn("flex h-20 items-center justify-between border-b bg-card px-4 md:px-6", className)}>
      <div className="flex items-center gap-4">
        {isMobile && (
          <SidebarTrigger className="ml-[-1rem] h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
        )}
        <h1 className="font-headline text-2xl font-bold text-foreground">{title}</h1>
      </div>
      <div>{children}</div>
    </header>
  );
}
