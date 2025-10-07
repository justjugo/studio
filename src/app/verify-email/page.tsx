'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Send } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

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
    // router.push('/login') is handled by the useEffect above
  };

  const handleResend = () => {
    if (user && !user.emailVerified) {
      setIsResending(true);
      sendEmailVerification(user)
        .then(() => {
          toast({
            title: 'Email Sent',
            description: 'A new verification link has been sent to your email.',
          });
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to resend verification email. Please try again later.',
          });
        })
        .finally(() => {
          setIsResending(false);
        });
    }
  };

  // Reload user data to check if email has been verified.
  // User might have verified in another tab.
  const handleCheckVerification = () => {
    user?.reload().then(() => {
      // The onAuthStateChanged listener will automatically pick up the change
      // and the useEffect will trigger the redirect if verified.
      if (user.emailVerified) {
        toast({
            title: 'Success!',
            description: 'Your email has been verified. Redirecting...',
          });
      } else {
         toast({
            title: 'Not Yet Verified',
            description: 'Please check your inbox for the verification link.',
          });
      }
    });
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
            . Please check your inbox (and spam folder) and follow the link to
            activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCheckVerification} className="w-full">
            I've Verified My Email
          </Button>

          <p className="text-sm text-muted-foreground">
            Didn't receive the email?
          </p>

          <Button
            onClick={handleResend}
            variant="secondary"
            className="w-full"
            disabled={isResending}
          >
            <Send className="mr-2 h-4 w-4" />
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogout} variant="link" className="w-full">
            Use a Different Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
