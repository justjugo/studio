'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Lightbulb,
  ClipboardList,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { Logo } from '../Logo';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect } from 'react';
import Loading from '@/app/loading';
import { ThemeToggle } from '../ThemeToggle';

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
  };
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isVerifyEmailPage = pathname === '/verify-email';

  useEffect(() => {
    if (isUserLoading) return;

    if (!user && !isAuthPage && !isVerifyEmailPage) {
      router.push('/login');
    }

    if (user && !user.emailVerified && !isVerifyEmailPage) {
      router.push('/verify-email');
    }

    if (user && user.emailVerified && (isAuthPage || isVerifyEmailPage)) {
      router.push('/');
    }

  }, [user, isUserLoading, isAuthPage, isVerifyEmailPage, router]);

  if (isAuthPage || isVerifyEmailPage) {
    return <AuthLayout>{children}</AuthLayout>;
  }
  
  const menuItems = [
    {
      href: '/',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      isActive: pathname === '/',
    },
    {
      href: '/training',
      label: 'Entraînement',
      icon: Lightbulb,
      isActive: pathname.startsWith('/training'),
    },
    {
      href: '/practice',
      label: 'Test d\'entraînement',
      icon: ClipboardList,
      isActive: pathname.startsWith('/practice'),
    },
     {
      href: '/results',
      label: 'Résultats',
      icon: BarChart3,
      isActive: pathname.startsWith('/results'),
    },
  ];

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <Logo />
            <span className="font-headline text-xl font-semibold text-primary group-data-[state=collapsed]:hidden">
              Prépa TCF
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
                  tooltip={item.label}
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
        <SidebarFooter className='gap-4'>
            <SidebarSeparator />
            {user && (
                 <div className="flex items-center justify-between gap-3 px-2 group-data-[state=collapsed]:hidden">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                          <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold truncate text-sidebar-foreground">
                              {user.displayName || 'Utilisateur anonyme'}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                              {user.email}
                          </span>
                      </div>
                    </div>
                    <ThemeToggle />
                 </div>
            )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="[&_span]:text-base" onClick={handleLogout} tooltip="Déconnexion">
                <LogOut />
                <span>Déconnexion</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {isUserLoading || !user ? <Loading /> : children}
      </SidebarInset>
    </>
  );
}
