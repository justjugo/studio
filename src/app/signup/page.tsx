
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles redirecting to the correct page after login/signup.
    if (!isUserLoading && user) {
      if (!user.emailVerified) {
        // A new user has signed up but is not yet verified.
        router.push('/verify-email');
      } else {
        // An already-verified user landed on the signup page.
        router.push('/');
      }
    }
  }, [user, isUserLoading, router]);

  const handleSignUp = async (e: React.FormEvent) => { // Make the handler async
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Champs manquants',
        description: 'Veuillez saisir votre email et votre mot de passe.',
      });
      return;
    }
    try {
      // Wait for the entire sign-up process to complete
      await initiateEmailSignUp(auth, email, password);
      // The useEffect will now safely handle the redirect
    } catch (error) {
      // Errors are already handled and toasted in initiateEmailSignUp
      // No additional error handling is needed here unless you want to.
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center p-4" style={{backgroundImage: "url('https://images.unsplash.com/photo-1502602898657-3e91760c0337?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}>
      <div className="absolute inset-0 bg-black/50 z-0" />
      <Card className="w-full max-w-sm z-10">
        <CardHeader>
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription>
            Entrez vos informations pour créer un compte.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button className="w-full" type="submit">
              Créer un compte
            </Button>
            <div className="mt-4 text-center text-sm">
              Vous avez déjà un compte ?{' '}
              <Link href="/login" className="underline">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
