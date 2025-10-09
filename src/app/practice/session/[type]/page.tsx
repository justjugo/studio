
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { seedQuestions } from '@/lib/seed-data';
import type { Question, Result, UserAnswerForReview } from '@/lib/types';
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
import { useUser, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Helper function to shuffle an array
function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

// Mapping URL slug to test configuration
const testConfig = {
    written: {
        title: 'Grammaire & Lecture',
        sections: {
            'structure': 29,
            'reading': 18
        },
        time: (15 + 45) * 60, // 60 minutes total
    },
    full: {
        title: 'Test d\'entraînement complet',
        sections: {
            'listening': 29,
            'structure': 18,
            'reading': 29
        },
        time: (25 + 15 + 45) * 60, // 85 minutes total
    },
};

export default function PracticeSessionPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const testType = typeof params.type === 'string' && params.type in testConfig ? params.type as keyof typeof testConfig : null;
    const config = testType ? testConfig[testType] : null;

    const [isLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const questions = useMemo(() => {
        if (!config) return [];
        const allQuestions = seedQuestions as Question[];
        const difficultyLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        const questionsBySectionAndDifficulty: { [section: string]: { [difficulty: string]: Question[] } } = {};

        // Group questions by section and then by difficulty
        allQuestions.forEach(q => {
            if (!questionsBySectionAndDifficulty[q.section]) {
                questionsBySectionAndDifficulty[q.section] = {};
            }
            if (!questionsBySectionAndDifficulty[q.section][q.difficulty]) {
                questionsBySectionAndDifficulty[q.section][q.difficulty] = [];
            }
            questionsBySectionAndDifficulty[q.section][q.difficulty].push(q);
        });

        let selectedQuestions: Question[] = [];
        const sectionConfigs = config.sections;

        // For each section in the test config
        for (const section in sectionConfigs) {
            const totalQuestionsForSection = sectionConfigs[section as keyof typeof sectionConfigs];
            if (!totalQuestionsForSection) continue;

            const questionsForThisSection = questionsBySectionAndDifficulty[section];
            if (!questionsForThisSection) continue;

            const baseCountPerDifficulty = Math.floor(totalQuestionsForSection / difficultyLevels.length);
            let remainder = totalQuestionsForSection % difficultyLevels.length;

            const countsPerDifficulty: { [difficulty: string]: number } = {};
            difficultyLevels.forEach(level => {
                countsPerDifficulty[level] = baseCountPerDifficulty;
            });

            // Distribute the remainder randomly across difficulty levels
            const shuffledLevels = shuffle([...difficultyLevels]);
            for (let i = 0; i < remainder; i++) {
                countsPerDifficulty[shuffledLevels[i]]++;
            }

            // Select questions for the section based on the calculated counts for each difficulty
            for (const difficulty of difficultyLevels) {
                const count = countsPerDifficulty[difficulty];
                const availableQuestions = questionsForThisSection[difficulty] || [];
                if (availableQuestions.length > 0 && count > 0) {
                    selectedQuestions.push(...shuffle(availableQuestions).slice(0, count));
                }
            }
        }
        
        // Shuffle the final list of questions and assign unique IDs
        return shuffle(selectedQuestions).map((q, index) => ({ ...q, id: `q-${index}` }));

    }, [config]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserAnswerForReview[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(config?.time ?? 0);

     useEffect(() => {
        if (!config || isFinished || !isClient) return;

        if (timeLeft <= 0) {
            handleNextQuestion(true); // Force finish the test
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, config, isFinished, isClient]);


    if (isLoading) {
        return <Loading />;
    }

    if (!config) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Test d'entraînement" />
                <main className="flex-1 flex items-center justify-center text-center p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Type de test invalide</CardTitle>
                            <CardDescription>
                                Le test que vous essayez d'accéder n'existe pas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/practice">Choisir un test</Link>
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
                <Header title={`Pratique: ${config.title}`} />
                <main className="flex-1 flex items-center justify-center text-center p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aucune question trouvée</CardTitle>
                            <CardDescription>
                                Il n'y a pas encore de questions disponibles pour ce test.
                            </CardDescription>
                        </CardHeader>
                         <CardContent>
                            <Button asChild>
                                <Link href="/practice">Retour à la pratique</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const saveResult = (answers: UserAnswerForReview[]) => {
        if (!user || !firestore || !testType) return;
    
        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalAnswered = answers.length;
    
        const resultData: Omit<Result, 'id'> = {
            userId: user.uid,
            sessionId: `practice-${testType}-${Date.now()}`,
            totalScore: correctCount,
            questionCount: totalAnswered,
            createdAt: new Date().toISOString(),
            globalCefrLevel: 'N/A', // Not calculated for training
            scores: [],
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
            type: 'practice',
            testName: config.title,
            answers: answers,
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
    
    const restartTest = () => {
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
                <Header title={`Résultats: ${config.title}`} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl">Test terminé !</CardTitle>
                                <CardDescription>
                                    Vous avez répondu à {totalAnswered} sur {questions.length} questions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center space-y-4">
                                <div className="w-full max-w-sm space-y-2">
                                    <div className="flex justify-between font-medium">
                                    <span>Score global</span>
                                    <span>{correctCount} / {totalAnswered}</span>
                                    </div>
                                    <Progress value={scorePercentage} className="h-4" />
                                    <p className="text-right text-lg font-bold text-primary">{`${Math.round(scorePercentage)}%`}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Révisez vos réponses</CardTitle>
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
                                                            <p className="font-semibold mb-2">Votre réponse :</p>
                                                            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                                                                <XCircle className="h-4 w-4 text-destructive" />
                                                                <p>{userAnswerText}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold mb-2">Réponse correcte :</p>
                                                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            <p>{correctAnswerText}</p>
                                                        </div>
                                                    </div>
                                                    {answer.question.explanation && (
                                                        <Alert>
                                                            <Lightbulb className="h-4 w-4" />
                                                            <AlertTitle>Explication</AlertTitle>
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
                            <Button size="lg" onClick={restartTest}>
                                <Repeat className="mr-2 h-4 w-4" /> Réessayer
                            </Button>
                             <Button size="lg" asChild variant="outline">
                                <Link href="/practice">
                                    <BookOpenCheck className="mr-2 h-4 w-4" /> Retour aux tests
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
            <Header title={`Pratique: ${config.title}`} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                 <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                            <Clock className="h-6 w-6" />
                            {isClient ? (
                                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                            ) : (
                                <span>--:--</span>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Question {currentQuestionIndex + 1} sur {questions.length}
                        </div>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mb-6 h-2" />

                    {currentQuestion && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold mb-2 capitalize">{currentQuestion.section} Section</CardTitle>
                                {currentQuestion.questionText && 
                                    <CardDescription className="text-lg">{currentQuestion.questionText}</CardDescription>
                                }
                                {currentQuestion.audioSrc && (
                                    <audio controls className="w-full mt-4">
                                        <source src={currentQuestion.audioSrc} type="audio/mpeg" />
                                        Votre navigateur ne prend pas en charge l'élément audio.
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
                                    {currentQuestionIndex === questions.length - 1 ? 'Terminer le test' : 'Question suivante'}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                 </div>
            </main>
        </div>
    )
}
