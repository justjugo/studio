
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
  const [isChecking, setIsChecking] = useState(false);


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
            title: 'Email envoyé',
            description: 'Un nouveau lien de vérification a été envoyé à votre adresse e-mail.',
          });
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Échec de l\'envoi de l\'e-mail de vérification. Veuillez réessayer plus tard.',
          });
        })
        .finally(() => {
          setIsResending(false);
        });
    }
  };

  // Reload user data to check if email has been verified.
  // User might have verified in another tab.
  const handleCheckVerification = async () => {
    if (!user) return;

    setIsChecking(true);
    await user.reload();
    
    // After reloading, the `onAuthStateChanged` listener in our `AppLayout`
    // will get the updated user object. The `useEffect` in that component
    // will then automatically redirect to '/' if `user.emailVerified` is true.
    // We just need to check the local state to provide immediate feedback.
    
    if (user.emailVerified) {
      toast({
        title: 'Succès !',
        description: 'Votre email a été vérifié. Redirection...',
      });
       // We manually push here to ensure immediate navigation.
      router.push('/');
    } else {
      toast({
        title: 'Pas encore vérifié',
        description: 'Veuillez consulter votre boîte de réception pour le lien de vérification.',
      });
      setIsChecking(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Vérifiez votre e-mail</CardTitle>
          <CardDescription>
            Nous avons envoyé un lien de vérification à{' '}
            <span className="font-semibold text-foreground">
              {user?.email || 'votre adresse e-mail'}
            </span>
            . Veuillez consulter votre boîte de réception (et votre dossier de courrier indésirable) et suivre le lien pour
            activer votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCheckVerification} className="w-full" disabled={isChecking}>
            {isChecking ? "Vérification..." : "J'ai vérifié mon e-mail"}
          </Button>

          <p className="text-sm text-muted-foreground">
            Vous n'avez pas reçu l'e-mail ?
          </p>

          <Button
            onClick={handleResend}
            variant="secondary"
            className="w-full"
            disabled={isResending}
          >
            <Send className="mr-2 h-4 w-4" />
            {isResending ? 'Envoi...' : 'Renvoyer l\'e-mail de vérification'}
          </Button>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogout} variant="link" className="w-full">
            Utiliser un autre compte
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
