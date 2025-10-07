
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ListChecks } from 'lucide-react';
import { seedQuestions } from '@/lib/seed-data';
import type { Question } from '@/lib/types';

const sectionConfig: { [key: string]: { name: string; questionCount: number; title: string } } = {
    listening: { name: 'listening', questionCount: 29, title: 'Compréhension orale' },
    structure: { name: 'structure', questionCount: 18, title: 'Structures de la langue' },
    reading: { name: 'reading', questionCount: 29, title: 'Compréhension écrite' },
};

export default function TrainingSectionPage() {
    const params = useParams();
    const router = useRouter();
    const sectionSlug = typeof params.section === 'string' ? params.section : '';
    const config = sectionConfig[sectionSlug];

    const availableTests = useMemo(() => {
        if (!config) return [];
        const sectionQuestions = (seedQuestions as Question[]).filter(q => q.section === config.name);
        const numTests = Math.floor(sectionQuestions.length / config.questionCount);
        return Array.from({ length: numTests }, (_, i) => i + 1);
    }, [config]);

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
                        <p className="text-muted-foreground mt-2">Sélectionnez un test pour commencer votre session d'entraînement.</p>
                    </div>
                    {availableTests.length > 0 ? (
                        <div className="space-y-4">
                            {availableTests.map(testId => (
                                <Link key={testId} href={`/training/${sectionSlug}/${testId}`}>
                                    <Card className="group transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <ListChecks className="h-8 w-8 text-primary" />
                                                <div>
                                                    <h3 className="text-lg font-semibold">Test #{testId}</h3>
                                                    <p className="text-sm text-muted-foreground">{config.questionCount} questions</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-sm font-semibold text-primary">
                                                Commencer le test
                                                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                         <Card>
                            <CardHeader className="text-center">
                                <CardTitle>Aucun test disponible</CardTitle>
                                <CardDescription>
                                    Il n'y a pas assez de questions pour créer un test pour cette section. Veuillez ajouter plus de questions à `src/lib/questions.json`.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <Button asChild>
                                    <Link href="/training">Retour aux sections</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
