
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ListChecks, Lock } from 'lucide-react';
import { seedQuestions } from '@/lib/seed-data';
import type { Question } from '@/lib/types';
import { useUser } from '@/firebase/provider';
import { getFirestore, doc, getDoc, Timestamp, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const sectionConfig: { [key: string]: { name: string; questionCount: number; title: string } } = {
    listening: { name: 'listening', questionCount: 29, title: 'Compréhension orale' },
    structure: { name: 'structure', questionCount: 18, title: 'Structures de la langue' },
    reading: { name: 'reading', questionCount: 29, title: 'Compréhension écrite' },
};

export default function TrainingSectionPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const sectionSlug = typeof params.section === 'string' ? params.section : '';
    const config = sectionConfig[sectionSlug];

    const [isPaidUser, setIsPaidUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1');
    const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const isRestrictedListening = sectionSlug === 'listening' && !isPaidUser;

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setIsPaidUser(false);
                setIsLoading(false);
                return;
            }
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().role === 'paiduser') {
                setIsPaidUser(true);
            } else {
                setIsPaidUser(false);
            }
            setIsLoading(false);
        };

        fetchUserRole();
    }, [user]);


    const handleTestStart = async (testId: number, level: string) => {
        if (!user) {
            toast({
                title: "Connexion requise",
                description: "Vous devez être connecté pour commencer un entraînement.",
                action: <Button asChild><Link href="/login">Se connecter</Link></Button>,
                variant: 'destructive'
            });
            return;
        }
        
        // For non-paid users, check the cooldown period just before starting the test.
        if (!isPaidUser) {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const lastTrainingTimestamp = userData.lastTraining?.[sectionSlug];

                if (lastTrainingTimestamp) {
                    const now = new Date();
                    const lastTrainingDate = lastTrainingTimestamp.toDate();
                    const diff = now.getTime() - lastTrainingDate.getTime();
                    const hoursPassed = diff / (1000 * 60 * 60);

                    if (hoursPassed < 24) {
                        const hoursRemaining = Math.ceil(24 - hoursPassed);
                        toast({
                            title: "Limite atteinte",
                            description: `Vous avez déjà fait un entraînement dans cette section. Veuillez réessayer dans ${hoursRemaining}h. Passez à Premium pour un accès illimité.`,
                            action: <Button asChild><Link href="/premium">Voir Premium</Link></Button>,
                            variant: 'destructive'
                        });
                        return; // Stop the process
                    }
                }
            }
            
            // If cooldown has passed or doesn't exist, update the timestamp and proceed.
            try {
                await setDoc(userDocRef, { 
                    lastTraining: { ...((userDoc.data()?.lastTraining || {})), [sectionSlug]: Timestamp.now() }
                }, { merge: true });
            } catch (error) {
                console.error("Failed to update last training time", error);
                toast({ title: "Erreur", description: "Impossible de sauvegarder votre progression. Veuillez réessayer.", variant: 'destructive' });
                return;
            }
        }

        router.push(`/training/${sectionSlug}/${testId}?level=${level}`);
    };

    useEffect(() => {
        if (!isLoading && isRestrictedListening) {
            setSelectedLevel('A1');
        }
    }, [isLoading, isRestrictedListening]);

    const availableTests = useMemo(() => {
        if (!config) return [];
        const allSectionQuestions = (seedQuestions as Question[]).filter(q => q.section === config.name);
        const levelQuestions = allSectionQuestions.filter(q => q.difficulty === selectedLevel);
        if (levelQuestions.length > 0) {
            return [{ id: 1, name: `Test ${selectedLevel}`, questionCount: levelQuestions.length }];
        }
        return [];
    }, [config, selectedLevel]);

    if (isLoading) {
        return <div>Chargement...</div>; 
    }

    if (!config) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Mode Entraînement" />
                <main className="flex-1 flex items-center justify-center text-center p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Section invalide</CardTitle>
                            <CardDescription>
                                La section que vous essayez de consulter n'existe pas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/training">Choisir une section</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <Header title={`Entraînement: ${config.title}`} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                     <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold font-headline">Tests disponibles</h2>
                        <p className="text-muted-foreground mt-2">Sélectionnez un niveau pour voir les tests disponibles.</p>
                    </div>

                    {isRestrictedListening && (
                        <Alert className="mb-8 border-yellow-500/50 text-yellow-700">
                            <AlertTitle className="text-yellow-800">Accès limité</AlertTitle>
                            <AlertDescription>
                                En tant qu'utilisateur gratuit, votre accès à la section d'écoute est limité au niveau A1. Passez à premium pour débloquer tous les niveaux.
                                <Button asChild size="sm" className="ml-4"> 
                                    <Link href="/premium">Passez à Premium</Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                  
                    <div className="flex justify-center flex-wrap gap-2 mb-8">
                        {levels.map(level => (
                            <Button 
                                key={level} 
                                variant={selectedLevel === level ? 'default' : 'outline'} 
                                onClick={() => setSelectedLevel(level)}
                                disabled={isRestrictedListening && level !== 'A1'}
                                className={cn(isRestrictedListening && level !== 'A1' && "cursor-not-allowed")}
                            >
                                {level}
                                {isRestrictedListening && level !== 'A1' && <Lock className="h-4 w-4 ml-2"/>}
                            </Button>
                        ))}
                    </div>

                    {availableTests.length > 0 ? (
                        <div className="space-y-4">
                            {availableTests.map(test => (
                                <Card 
                                    key={test.id} 
                                    onClick={() => handleTestStart(test.id, selectedLevel)} 
                                    className={cn("group transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary cursor-pointer")}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <ListChecks className="h-8 w-8 text-primary" />
                                            <div>
                                                <h3 className="text-lg font-semibold">{test.name}</h3>
                                                <p className="text-sm text-muted-foreground">{test.questionCount} questions</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm font-semibold text-primary">
                                            Commencer le test
                                            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <Card>
                            <CardHeader className="text-center">
                                <CardTitle>Aucun test disponible</CardTitle>
                                <CardDescription>
                                    Il n'y a pas de questions disponibles pour le niveau {selectedLevel}. Veuillez sélectionner un autre niveau.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
