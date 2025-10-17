'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book, Headphones, Puzzle } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const sections = [
    { id: 'listening', title: 'Compréhension orale', description: 'Affinez votre capacité à comprendre le français parlé.', icon: Headphones, questions: 87 },
    { id: 'structure', title: 'Structures de la langue', description: 'Maîtrisez la grammaire, le vocabulaire et la syntaxe.', icon: Puzzle, questions: 125 },
    { id: 'reading', title: 'Compréhension écrite', description: 'Améliorez vos compétences en compréhension de textes écrits.', icon: Book, questions: 180 },
];

export default function TrainingPage() {
    const { user } = useUser();
    const [lastTraining, setLastTraining] = useState<any>(null);
    const [isPaidUser, setIsPaidUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setLastTraining(userData.lastTraining);
                setIsPaidUser(userData.role === 'paiduser');
            }
            setIsLoading(false);
        };
        fetchUserData();
    }, [user]);

    const getRemainingTime = (sectionId: string) => {
        if (isPaidUser || !lastTraining || !lastTraining[sectionId]) {
            return { onCooldown: false, message: 'Commencer (A1) →' };
        }

        const now = new Date();
        const lastTrainingDate = lastTraining[sectionId].toDate();
        const diff = now.getTime() - lastTrainingDate.getTime();
        const hoursPassed = diff / (1000 * 60 * 60);

        if (hoursPassed < 24) {
            const hoursRemaining = Math.ceil(24 - hoursPassed);
            return { onCooldown: true, message: `Prochaine session disponible dans ${hoursRemaining}h` };
        }

        return { onCooldown: false, message: 'Commencer (A1) →' };
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Mode Entraînement" />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-headline">Choisissez une section à pratiquer</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Entraînez-vous sur les questions à votre rythme sans limite de temps.</p>
                </div>
                <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
                    {sections.map(section => {
                        const { onCooldown, message } = getRemainingTime(section.id);
                        const image = PlaceHolderImages.find(img => img.id === section.id);

                        return (
                            <Card key={section.id} className={cn("flex flex-col hover:shadow-lg transition-shadow")}>
                                <CardHeader className="relative h-40">
                                    {image && <Image src={image.imageUrl} alt={section.title} fill className="object-cover rounded-t-lg" />}
                                </CardHeader>
                                <CardContent className="flex-grow pt-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <section.icon className="h-8 w-8 text-primary" />
                                        <h2 className="text-2xl font-bold">{section.title}</h2>
                                    </div>
                                    <p className="text-muted-foreground mb-4">{section.description}</p>
                                    <div className="text-sm bg-secondary/50 p-2 rounded-md w-fit">{section.questions} questions</div>
                                </CardContent>
                                <CardFooter>
                                     <Button asChild className="w-full" variant={onCooldown ? 'secondary' : 'default'}>
                                        <Link href={`/training/${section.id}`}>
                                            {onCooldown ? message : 'Commencer'}
                                            {!onCooldown && <ArrowRight className="ml-2 h-4 w-4"/>}
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
