
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Question } from '@/lib/types';
import Loading from '@/app/loading';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mapping URL slug to section name in database
const sectionMap: { [key: string]: string } = {
    listening: 'listening',
    structure: 'structure',
    reading: 'reading',
};


export default function TrainingSessionPage() {
    const params = useParams();
    const sectionSlug = typeof params.section === 'string' ? params.section : '';
    const section = sectionMap[sectionSlug];
    const firestore = useFirestore();

    const questionsQuery = useMemoFirebase(() => {
        if (!firestore || !section) return null;
        return query(collection(firestore, 'questions'), where('section', '==', section));
    }, [firestore, section]);

    const { data: questions, isLoading } = useCollection<Omit<Question, 'id'>>(questionsQuery);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    if (isLoading) {
        return <Loading />;
    }

    if (!section) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Training Mode" />
                <main className="flex-1 flex items-center justify-center text-center p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invalid Section</CardTitle>
                            <CardDescription>
                                The section you are trying to access does not exist.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/training">Choose a Section</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    if (!questions || questions.length === 0) {
        return (
             <div className="flex flex-col h-full">
                <Header title={`Training: ${sectionSlug}`} />
                <main className="flex-1 flex items-center justify-center text-center p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>No Questions Found</CardTitle>
                            <CardDescription>
                                There are no questions available for this section yet.
                            </CardDescription>
                        </CardHeader>
                         <CardContent>
                            <Button asChild>
                                <Link href="/admin">Seed Questions</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

    const handleAnswerSubmit = () => {
        if (selectedOptionId) {
            setIsAnswered(true);
        }
    };

    const handleNextQuestion = () => {
        setIsAnswered(false);
        setSelectedOptionId(null);
        setCurrentQuestionIndex((prev) => prev + 1);
    };

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="flex flex-col h-full">
            <Header title={`Training: ${sectionSlug.charAt(0).toUpperCase() + sectionSlug.slice(1)}`} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                 <div className="max-w-2xl mx-auto">
                    {currentQuestion && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                                {currentQuestion.questionText && 
                                    <CardDescription className="text-lg pt-2">{currentQuestion.questionText}</CardDescription>
                                }
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={selectedOptionId || ''}
                                    onValueChange={setSelectedOptionId}
                                    disabled={isAnswered}
                                >
                                    {currentQuestion.options.map((option) => (
                                        <div key={option.id} className={cn(
                                            "flex items-center space-x-3 p-4 rounded-lg border transition-all",
                                            isAnswered && option.id === currentQuestion.correctOptionId && 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
                                            isAnswered && option.id === selectedOptionId && option.id !== currentQuestion.correctOptionId && 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700'
                                        )}>
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id} className="flex-1 text-base cursor-pointer">{option.text}</Label>
                                            {isAnswered && option.id === currentQuestion.correctOptionId && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                            {isAnswered && option.id === selectedOptionId && option.id !== currentQuestion.correctOptionId && <XCircle className="h-5 w-5 text-red-600" />}
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                            <CardFooter className="flex-col items-stretch gap-4">
                                {!isAnswered ? (
                                    <Button onClick={handleAnswerSubmit} disabled={!selectedOptionId}>
                                        Check Answer
                                    </Button>
                                ) : (
                                    <>
                                        {currentQuestion.explanation && (
                                            <Alert>
                                                <Lightbulb className="h-4 w-4" />
                                                <AlertTitle>{isCorrect ? 'Correct!' : 'Incorrect'}</AlertTitle>
                                                <AlertDescription>{currentQuestion.explanation}</AlertDescription>
                                            </Alert>
                                        )}
                                        {isLastQuestion ? (
                                            <Button asChild>
                                                <Link href="/training">Finish Training</Link>
                                            </Button>
                                        ) : (
                                            <Button onClick={handleNextQuestion}>
                                                Next Question <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    )}
                 </div>
            </main>
        </div>
    )
}
