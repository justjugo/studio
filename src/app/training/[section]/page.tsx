
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { seedQuestions } from '@/lib/seed-data';
import type { Question } from '@/lib/types';
import Loading from '@/app/loading';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, Clock, BookOpenCheck, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mapping URL slug to section name in database and time limits
const sectionConfig: { [key: string]: { name: string; time: number; questionCount: number } } = {
    listening: { name: 'listening', time: 25 * 60, questionCount: 29 },
    structure: { name: 'structure', time: 15 * 60, questionCount: 18 },
    reading: { name: 'reading', time: 45 * 60, questionCount: 29 },
};

type UserAnswer = {
    question: Question;
    selectedOptionId: string | null;
    isCorrect: boolean;
};

export default function TrainingSessionPage() {
    const params = useParams();
    const router = useRouter();
    const sectionSlug = typeof params.section === 'string' ? params.section : '';
    const config = sectionConfig[sectionSlug];

    const [isLoading, setIsLoading] = useState(false);

    const questions = useMemo(() => {
        if (!config) return [];
        return (seedQuestions as Question[])
            .filter(q => q.section === config.name)
            .slice(0, config.questionCount);
    }, [config]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(config?.time ?? 0);

     useEffect(() => {
        if (!config || isFinished) return;

        if (timeLeft <= 0) {
            setIsFinished(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, config, isFinished]);


    if (isLoading) {
        return <Loading />;
    }

    if (!config) {
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
                                There are no questions available for this section yet. Check your `questions.json` file.
                            </CardDescription>
                        </CardHeader>
                         <CardContent>
                            <Button asChild>
                                <Link href="/training">Back to Training</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }
    
    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
        
        setUserAnswers([...userAnswers, { question: currentQuestion, selectedOptionId, isCorrect }]);
        
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOptionId(null);
        } else {
            setIsFinished(true);
        }
    };
    
    const restartTraining = () => {
        setCurrentQuestionIndex(0);
        setSelectedOptionId(null);
        setUserAnswers([]);
        setIsFinished(false);
        setTimeLeft(config.time);
    };

    const currentQuestion = questions[currentQuestionIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (isFinished) {
        const correctCount = userAnswers.filter(a => a.isCorrect).length;
        const totalAnswered = userAnswers.length;
        const scorePercentage = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;

        return (
            <div className="flex flex-col h-full">
                <Header title={`Results: ${sectionSlug.charAt(0).toUpperCase() + sectionSlug.slice(1)}`} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl">Training Complete!</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center space-y-4">
                                <div className="w-full max-w-sm space-y-2">
                                    <div className="flex justify-between font-medium">
                                    <span>Overall Score</span>
                                    <span>{correctCount} / {totalAnswered}</span>
                                    </div>
                                    <Progress value={scorePercentage} className="h-4" />
                                    <p className="text-right text-lg font-bold text-primary">{`${Math.round(scorePercentage)}%`}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Review Your Answers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {userAnswers.map((answer, index) => {
                                        const userAnswerText = answer.question.options.find(o => o.id === answer.selectedOptionId)?.text;
                                        const correctAnswerText = answer.question.options.find(o => o.id === answer.question.correctOptionId)?.text;
                                        return (
                                            <AccordionItem key={index} value={`item-${index}`}>
                                                <AccordionTrigger className="hover:no-underline text-left">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        {answer.isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                                                        <span className="flex-1">{answer.question.questionText}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-4 pl-10">
                                                    {!answer.isCorrect && userAnswerText && (
                                                        <div>
                                                            <p className="font-semibold mb-2">Your Answer:</p>
                                                            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                                                                <XCircle className="h-4 w-4 text-destructive" />
                                                                <p>{userAnswerText}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold mb-2">Correct Answer:</p>
                                                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            <p>{correctAnswerText}</p>
                                                        </div>
                                                    </div>
                                                    {answer.question.explanation && (
                                                        <Alert>
                                                            <Lightbulb className="h-4 w-4" />
                                                            <AlertTitle>Explanation</AlertTitle>
                                                            <AlertDescription>{answer.question.explanation}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    })}
                                </Accordion>
                            </CardContent>
                        </Card>
                        
                        <div className="text-center flex gap-4 justify-center">
                            <Button size="lg" onClick={restartTraining}>
                                <Repeat className="mr-2 h-4 w-4" /> Try Again
                            </Button>
                             <Button size="lg" asChild variant="outline">
                                <Link href="/training">
                                    <BookOpenCheck className="mr-2 h-4 w-4" /> Back to Sections
                                </Link>
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <Header title={`Training: ${sectionSlug.charAt(0).toUpperCase() + sectionSlug.slice(1)}`} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                 <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                            <Clock className="h-6 w-6" />
                            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </div>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mb-6 h-2" />

                    {currentQuestion && (
                        <Card>
                            <CardHeader>
                                {currentQuestion.questionText && 
                                    <CardTitle className="text-xl">{currentQuestion.questionText}</CardTitle>
                                }
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={selectedOptionId || ''}
                                    onValueChange={setSelectedOptionId}
                                >
                                    {currentQuestion.options.map((option) => (
                                        <div key={option.id} className="flex items-center space-x-3 p-4 rounded-lg border transition-all has-[:disabled]:opacity-70 has-[:disabled]:cursor-not-allowed">
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id} className="flex-1 text-base cursor-pointer">{option.text}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleNextQuestion} disabled={!selectedOptionId} className="w-full">
                                    {currentQuestionIndex === questions.length - 1 ? 'Finish Training' : 'Next Question'}
                                    <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                 </div>
            </main>
        </div>
    )
}
