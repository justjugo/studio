
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookOpenText, Clock, Headphones, Puzzle, Lock } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PracticePage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [sessionStatus, setSessionStatus] = useState<Record<string, { canStart: boolean; message: string }>>({
    full: { canStart: false, message: 'Chargement...' },
    written: { canStart: false, message: 'Chargement...' },
  });
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const practiceImage = PlaceHolderImages.find(img => img.id === 'practice-test');

  useEffect(() => {
    const fetchUserAndSetStatus = async () => {
      if (!user) {
        setIsPaidUser(false);
        setSessionStatus({
          full: { canStart: false, message: 'Passez à Premium pour débloquer' },
          written: { canStart: true, message: '' }, // Allow non-logged in user to see the button as active
        });
        setIsLoading(false);
        return;
      }

      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let paid = false;
      let userData = null;
      if (userDoc.exists()) {
        userData = userDoc.data();
        if (userData.role === 'paiduser') {
          paid = true;
        }
      }
      setIsPaidUser(paid);

      if (paid) {
        setSessionStatus({
          full: { canStart: true, message: '' },
          written: { canStart: true, message: '' },
        });
      } else {
        const now = new Date();
        const newStatus: { [key: string]: { canStart: boolean; message: string } } = {
          full: { canStart: false, message: 'Passez à Premium pour débloquer' },
          written: { canStart: false, message: '' }
        };

        const lastSession = userData?.[`lastSession_written`]?.toDate();
        if (!lastSession) {
          newStatus.written = { canStart: true, message: '' };
        } else {
          const diff = now.getTime() - lastSession.getTime();
          const hoursPassed = diff / (1000 * 60 * 60);

          if (hoursPassed >= 24) {
            newStatus.written = { canStart: true, message: '' };
          } else {
            const hoursRemaining = Math.ceil(24 - hoursPassed);
            newStatus.written = { canStart: false, message: `Prochaine session dans ${hoursRemaining}h.` };
          }
        }
        setSessionStatus(newStatus);
      }
      setIsLoading(false);
    };

    fetchUserAndSetStatus();
  }, [user]);

  const handleStartSession = async (sessionType: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Non connecté',
        description: 'Vous devez être connecté pour démarrer une session.',
        action: <Button asChild size="sm"><Link href="/auth">Se connecter</Link></Button>
      });
      return;
    }

    if (!sessionStatus[sessionType]?.canStart) {
      const description = sessionType === 'full' && !isPaidUser
        ? 'Le test complet est réservé aux membres premium.'
        : sessionStatus[sessionType]?.message || 'Vous ne pouvez pas encore commencer cette session.';
      
      toast({
        variant: 'destructive',
        title: sessionType === 'full' && !isPaidUser ? 'Accès Premium Requis' : 'Limite atteinte',
        description: description,
        action: sessionType === 'full' && !isPaidUser ? <Button asChild size="sm"><Link href="/premium">Voir Premium</Link></Button> : undefined,
      });
      return;
    }
    
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    try {
      if (!isPaidUser && sessionType === 'written') {
        await updateDoc(userDocRef, {
          [`lastSession_${sessionType}`]: Timestamp.now(),
        });
      }
      router.push(`/practice/session/${sessionType}`);
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de démarrer la session. Veuillez réessayer.'
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <Header title="Test d'entraînement" />
      <main className="flex-1 overflow-y-auto">
        <div className="relative h-48 md:h-64">
          {practiceImage && (
            <Image
              src={practiceImage.imageUrl}
              alt={practiceImage.description}
              fill
              className="object-cover"
              data-ai-hint={practiceImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <h1 className="text-4xl md:text-5xl font-bold font-headline">Choisissez votre test d'entraînement</h1>
              <p className="mt-2 text-lg md:text-xl">Simulez les conditions réelles de l'examen</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
            <Card className={cn("flex flex-col", !isPaidUser && "border-2 border-amber-500/80")}>
              <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl">Test d'entraînement complet</CardTitle>
                    {!isPaidUser && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                           Premium
                        </span>
                    )}
                 </div>
                <CardDescription>Les trois sections obligatoires.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Headphones className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Compréhension orale (25 min)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Puzzle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Structures de la langue (15 min)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BookOpenText className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Compréhension écrite (45 min)</span>
                  </li>
                </ul>
                 <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg text-sm">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Durée totale:</span> ~1 heure 25 minutes
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button size="lg" className="w-full" onClick={() => handleStartSession('full')} disabled={isLoading || !sessionStatus.full.canStart}>
                  {isLoading ? 'Chargement...' : sessionStatus.full.canStart ? (
                    <>
                      Commencer le test complet <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) :  <><Lock className="mr-2 h-4 w-4"/> {sessionStatus.full.message}</>}
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Grammaire & Lecture</CardTitle>
                <CardDescription>Concentrez-vous sur les compétences écrites.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Puzzle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Structures de la langue (15 min)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BookOpenText className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Compréhension écrite (45 min)</span>
                  </li>
                </ul>
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg text-sm">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                   <div>
                    <span className="font-semibold">Durée totale:</span> ~1 heure
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full" onClick={() => handleStartSession('written')} disabled={isLoading || !sessionStatus.written.canStart}>
                   {isLoading ? 'Chargement...' : sessionStatus.written.canStart ? (
                    <>
                      Commencer le test écrit <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : sessionStatus.written.message}
                </Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
