'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Lightbulb,
  ClipboardList,
  User,
  LogOut,
} from 'lucide-react';
import { Logo } from '../Logo';
import { useAuth, useUser } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = () => {
    signOut(auth);
  };
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <AuthLayout>{children}</AuthLayout>;
  }


  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/',
    },
    {
      href: '/training',
      label: 'Training',
      icon: Lightbulb,
      isActive: pathname.startsWith('/training'),
    },
    {
      href: '/practice',
      label: 'Practice Test',
      icon: ClipboardList,
      isActive: pathname.startsWith('/practice'),
    },
     {
      href: '/results',
      label: 'Results',
      icon: User,
      isActive: pathname.startsWith('/results'),
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <Logo />
            <span className="font-headline text-xl font-semibold text-primary">
              TCF Prep
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  size="lg"
                  className="[&_span]:text-base"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="[&_span]:text-base" onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
