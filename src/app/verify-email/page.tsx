'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If a verified user lands here, redirect to dashboard.
    if (!isUserLoading && user?.emailVerified) {
      router.push('/');
    }
    // If no user is logged in at all, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    signOut(auth);
    router.push('/login');
  };
  
  const handleResend = () => {
    if(user) {
      // resend email
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to{' '}
            <span className="font-semibold text-foreground">
              {user?.email || 'your email address'}
            </span>
            . Please check your inbox and follow the link to activate your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once verified, you will be able to log in.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleLogout} variant="outline">
              Use a Different Account
            </Button>
            <Button asChild>
                <Link href="/login">
                 Go to Login
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
