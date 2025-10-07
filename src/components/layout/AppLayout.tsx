
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Lightbulb,
  ClipboardList,
  User,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { Logo } from '../Logo';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect } from 'react';
import Loading from '@/app/loading';

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
    if (isUserLoading) return; // Wait until user status is resolved

    // If there's no user and they aren't on an auth page, redirect to login
    if (!user && !isAuthPage && !isVerifyEmailPage) {
      router.push('/login');
    }

    // If there IS a user but their email is not verified,
    // and they are NOT on the verify-email page, force them there.
    if (user && !user.emailVerified && !isVerifyEmailPage) {
      router.push('/verify-email');
    }

    // If the user IS verified and they land on an auth or verification page,
    // send them to the dashboard.
    if (user && user.emailVerified && (isAuthPage || isVerifyEmailPage)) {
      router.push('/');
    }

  }, [user, isUserLoading, isAuthPage, isVerifyEmailPage, router]);


  // If it's an auth-related page, don't show the main layout
  if (isAuthPage || isVerifyEmailPage) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  // While checking auth status and not on an auth page, show a loader
  if (isUserLoading) {
    return <Loading />;
  }
  
  // If no user is authenticated (and we're not on an auth page), the useEffect will redirect.
  // Render a loader to prevent a flash of content.
  if (!user) {
      return <Loading />;
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
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <Logo />
            <span className="font-headline text-xl font-semibold text-primary">
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
                 <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate text-sidebar-foreground">
                            {user.displayName || 'Utilisateur anonyme'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                        </span>
                    </div>
                 </div>
            )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="[&_span]:text-base" onClick={handleLogout}>
                <LogOut />
                <span>Déconnexion</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
