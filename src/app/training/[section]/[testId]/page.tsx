
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { seedQuestions } from '@/lib/seed-data';
import type { Question, Result } from '@/lib/types';
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
import Link from 'next/link';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';

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
    const { user } = useUser();
    const firestore = useFirestore();

    const sectionSlug = typeof params.section === 'string' ? params.section : '';
    const testId = typeof params.testId === 'string' ? parseInt(params.testId, 10) : NaN;
    const config = sectionConfig[sectionSlug];

    const [isLoading] = useState(false);

    const questions = useMemo(() => {
        if (!config || isNaN(testId)) return [];
        const sectionQuestions = (seedQuestions as Question[]).filter(q => q.section === config.name);
        const startIndex = (testId - 1) * config.questionCount;
        const endIndex = startIndex + config.questionCount;
        return sectionQuestions.slice(startIndex, endIndex);
    }, [config, testId]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(config?.time ?? 0);

     useEffect(() => {
        if (!config || isFinished) return;

        if (timeLeft <= 0) {
            handleNextQuestion(true); // Force finish the test
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

    if (!config || isNaN(testId)) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Training Mode" />
                <main className="flex-1 flex items-center justify-center text-center p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invalid Test</CardTitle>
                            <CardDescription>
                                The test you are trying to access does not exist.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href={`/training/${sectionSlug}`}>Choose a Test</Link>
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
                                There are no questions available for this test yet. Check your `questions.json` file.
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

    const saveResult = (answers: UserAnswer[]) => {
        if (!user || !firestore) return;
    
        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalAnswered = answers.length;
    
        const resultData: Omit<Result, 'id'> = {
            userId: user.uid,
            sessionId: `training-${sectionSlug}-${testId}-${Date.now()}`,
            totalScore: correctCount,
            questionCount: totalAnswered,
            createdAt: new Date().toISOString(),
            globalCefrLevel: 'N/A', // Not calculated for training
            scores: [],
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
            type: 'training',
            testName: `Training: ${sectionSlug.charAt(0).toUpperCase() + sectionSlug.slice(1)} #${testId}`
        };
    
        const resultsCollection = collection(firestore, 'users', user.uid, 'results');
        addDocumentNonBlocking(resultsCollection, resultData);
    };
    
    const handleNextQuestion = (forceFinish = false) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
        
        const newAnswers = [...userAnswers, { question: currentQuestion, selectedOptionId, isCorrect }];
        setUserAnswers(newAnswers);
        
        if (forceFinish || currentQuestionIndex >= questions.length - 1) {
            setIsFinished(true);
            saveResult(newAnswers);
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOptionId(null);
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
                <Header title={`Results: ${sectionSlug.charAt(0).toUpperCase() + sectionSlug.slice(1)} - Test #${testId}`} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl">Training Complete!</CardTitle>
                                <CardDescription>
                                    You answered {totalAnswered} out of {questions.length} questions.
                                </CardDescription>
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
                                <Link href={`/training/${sectionSlug}`}>
                                    <BookOpenCheck className="mr-2 h-4 w-4" /> Back to Test List
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
            <Header title={`Training: ${sectionSlug.charAt(0).toUpperCase() + sectionSlug.slice(1)} - Test #${testId}`} />
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
                                {currentQuestion.audioSrc && (
                                    <audio controls className="w-full mt-4">
                                        <source src={currentQuestion.audioSrc} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={selectedOptionId || ''}
                                    onValueChange={setSelectedOptionId}
                                    className="space-y-3"
                                >
                                    {currentQuestion.options.map((option) => (
                                        <div key={option.id} className="flex items-center space-x-3 p-4 rounded-lg border transition-all has-[:disabled]:opacity-70 has-[:disabled]:cursor-not-allowed has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id} className="flex-1 text-base cursor-pointer">{option.text}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => handleNextQuestion(false)} disabled={!selectedOptionId} className="w-full text-lg py-6">
                                    {currentQuestionIndex === questions.length - 1 ? 'Finish Training' : 'Next Question'}
                                    <ArrowRight className="ml-2 h-5 w-5"/>
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                 </div>
            </main>
        </div>
    )
}
