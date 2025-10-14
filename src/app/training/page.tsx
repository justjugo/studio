
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider'; 
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookOpenText, Headphones, Puzzle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { seedQuestions } from '@/lib/seed-data';
import type { Question } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const sections = [
  {
    name: 'Compréhension orale',
    slug: 'listening',
    icon: <Headphones className="h-10 w-10 text-primary" />,
    description: "Affinez votre capacité à comprendre le français parlé.",
    imageId: 'listening'
  },
  {
    name: 'Structures de la langue',
    slug: 'structure',
    icon: <Puzzle className="h-10 w-10 text-primary" />,
    description: "Maîtrisez la grammaire, le vocabulaire et la syntaxe.",
    imageId: 'structure'
  },
  {
    name: 'Compréhension écrite',
    slug: 'reading',
    icon: <BookOpenText className="h-10 w-10 text-primary" />,
    description: "Améliorez vos compétences en compréhension de textes écrits.",
    imageId: 'reading'
  },
];

export default function TrainingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [sessionStatus, setSessionStatus] = useState<Record<string, { canStart: boolean; message: string }>>({
    listening: { canStart: false, message: '' },
    structure: { canStart: false, message: '' },
    reading: { canStart: false, message: '' },
  });

  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const allQuestions = seedQuestions as Question[];

    for (const section of sections) {
        counts[section.slug] = allQuestions.filter(q => q.section === section.slug).length;
    }
    return counts;
  }, []);

  useEffect(() => {
    if (user) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      const fetchUserProfile = async () => {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData.role === 'paiduser') {
            setSessionStatus({
              listening: { canStart: true, message: '' },
              structure: { canStart: true, message: '' },
              reading: { canStart: true, message: '' },
            });
          } else {
            const now = new Date();
            const newStatus: Record<string, { canStart: boolean; message: string }> = {};
            
            for (const section of sections) {
              if (section.slug === 'listening') {
                newStatus[section.slug] = { canStart: true, message: 'Accès limité au niveau A1' };
              } else {
                const lastSession = userData[`lastSession_${section.slug}`]?.toDate();
                if (!lastSession) {
                  newStatus[section.slug] = { canStart: true, message: '' };
                } else {
                  const diff = now.getTime() - lastSession.getTime();
                  const hoursPassed = diff / (1000 * 60 * 60);

                  if (hoursPassed >= 24) {
                    newStatus[section.slug] = { canStart: true, message: '' };
                  } else {
                    const hoursRemaining = Math.ceil(24 - hoursPassed);
                    newStatus[section.slug] = { canStart: false, message: `Prochaine session disponible dans ${hoursRemaining}h.` };
                  }
                }
              }
            }
            setSessionStatus(newStatus);
          }
        } else {
            setSessionStatus({
                listening: { canStart: true, message: 'Accès limité au niveau A1' },
                structure: { canStart: true, message: '' },
                reading: { canStart: true, message: '' },
            });
        }
      };

      fetchUserProfile();
    }
  }, [user]);

  const handleStartSession = async (sectionSlug: string) => {
    if (!user) return;

    if (sessionStatus[sectionSlug]?.canStart) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role !== 'paiduser' && sectionSlug !== 'listening') {
            await updateDoc(userDocRef, {
                [`lastSession_${sectionSlug}`]: Timestamp.now(),
            });
        }
        router.push(`/training/${sectionSlug}`);
      } catch (error) { 
        console.error('Error starting session:', error);
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible de démarrer la session. Veuillez réessayer.'
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Limite atteinte',
        description: sessionStatus[sectionSlug]?.message || 'Passez à premium pour un accès illimité.',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Mode Entraînement" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Choisissez une section à pratiquer</h2>
            <p className="text-muted-foreground mt-2">Entraînez-vous sur les questions à votre rythme sans limite de temps.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => {
              const image = PlaceHolderImages.find(img => img.id === section.imageId);
              const status = sessionStatus[section.slug] || { canStart: false, message: '' };
              const count = questionCounts[section.slug] || 0;
              const isListeningFree = section.slug === 'listening' && status.message.includes('A1');

              return (
                <Card 
                  key={section.slug}
                  onClick={() => handleStartSession(section.slug)}
                  className={cn(
                    'group flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out',
                    status.canStart ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'cursor-not-allowed opacity-60'
                  )}
                >
                  <div>
                    {image && (
                       <div className="overflow-hidden aspect-video">
                         <Image
                           src={image.imageUrl}
                           alt={image.description}
                           width={600}
                           height={400}
                           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                           data-ai-hint={image.imageHint}
                         />
                       </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-start gap-4 mb-2">
                          {section.icon}
                          <span>{section.name}</span>
                        </CardTitle>
                        <Badge variant="secondary">{count} questions</Badge>
                      </div>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="flex justify-end pt-4">
                     <div className={cn(
                        'flex items-center text-sm font-semibold',
                        status.canStart ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {status.canStart ? (isListeningFree ? 'Commencer (A1)': 'Commencer l\'entraînement') : status.message}
                        {status.canStart && <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />}
                     </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
