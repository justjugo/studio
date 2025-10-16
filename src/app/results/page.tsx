
'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ExternalLink, XCircle, Lightbulb, BookOpenText, Headphones, Puzzle, MessageSquareWarning, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Result, UserAnswerForReview } from '@/lib/types';
import Loading from '../loading';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const getScoreColor = (score: number) => {
    if (score > 90) return { text: 'text-purple-600', bg: 'bg-purple-600', badge: 'bg-purple-600' };
    if (score > 70) return { text: 'text-green-600', bg: 'bg-green-600', badge: 'bg-green-600' };
    if (score > 40) return { text: 'text-yellow-500', bg: 'bg-yellow-500', badge: 'bg-yellow-500 text-black' };
    return { text: 'text-destructive', bg: 'bg-destructive', badge: 'bg-red-500' };
};

const getCecrlLevel = (scorePercentage: number) => {
  if (scorePercentage < 20) return 'A1';
  if (scorePercentage < 40) return 'A2';
  if (scorePercentage < 60) return 'B1';
  if (scorePercentage < 80) return 'B2';
  if (scorePercentage < 90) return 'C1';
  return 'C2';
};

const SectionResultCard = ({ title, icon, percentage, level, color }: { title: string, icon: React.ReactNode, percentage: number, level: string, color: string }) => (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </div>
        <Badge className={`px-3 py-1 text-md mb-2 ${color}`}>{level}</Badge>
        <div className="w-full">
            <Progress value={percentage} className="h-2" indicatorClassName={getScoreColor(percentage).bg} />
            <p className={`text-right text-sm font-semibold ${getScoreColor(percentage).text} mt-1`}>{`${Math.round(percentage)}%`}</p>
        </div>
    </div>
)

export default function ResultsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [reportingItems, setReportingItems] = useState<number[]>([]);
  const [reportedItems, setReportedItems] = useState<number[]>([]);
  const [aiFeedback, setAiFeedback] = useState<{ [key: number]: string }>({});

  const resultsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'results');
  }, [user, firestore]);

  const { data: results, isLoading: isResultsLoading } = useCollection<Result>(resultsCollection);

  const sortedResults = useMemo(() => {
    if (!results) return [];
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [results]);

    const handleReportError = async (item: UserAnswerForReview, index: number) => {
        setReportingItems(prev => [...prev, index]);
        const userAnswer = item.question.options.find(o => o.id === item.selectedOptionId);
        const correctAnswer = item.question.options.find(o => o.id === item.question.correctOptionId);

        const payload = {
            question: item.question.questionText,
            userAnswer: userAnswer?.text || 'No answer provided',
            correctAnswer: correctAnswer?.text,
            explanation: item.question.explanation
        };

        try {
            const response = await fetch('https://n8n-m1ji.onrender.com/webhook/2483479c-d8b9-472f-8be5-16afb425ffd0', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const aiExplanation = await response.text();
                if (aiExplanation) {
                    setAiFeedback(prev => ({...prev, [index]: aiExplanation}));
                }
                setReportedItems(prev => [...prev, index]);
            } else {
                console.error('Failed to report error. Status:', response.status, response.statusText);
                alert('There was an issue sending the report. Please check the console for details. This may be a CORS issue from the server.');
            }
        } catch (error) {
            console.error('Error reporting issue:', error);
            alert('An unexpected error occurred. This might be due to a network issue or a CORS policy. Please check the browser console for more information.');
        } finally {
            setReportingItems(prev => prev.filter(i => i !== index));
        }
    };

  const performanceMetrics = useMemo(() => {
    const recentResults = sortedResults.slice(0, 1);
    
    if (!recentResults || recentResults.length === 0) {
      return {
        overall: { correct: 0, total: 0 },
        listening: { correct: 0, total: 0 },
        structure: { correct: 0, total: 0 },
        reading: { correct: 0, total: 0 },
      };
    }

    const metrics: {
        [key: string]: { correct: number; total: number; };
        overall: { correct: number; total: number; };
        listening: { correct: number; total: number; };
        structure: { correct: number; total: number; };
        reading: { correct: number; total: number; };
    } = {
      overall: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
      structure: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
    };

    for (const result of recentResults) {
        if (result.answers) {
            for (const answer of result.answers) {
                const section = answer.question.section;
                metrics.overall.total++;
                if (metrics[section]) {
                    metrics[section].total++;
                }
                if (answer.isCorrect) {
                    metrics.overall.correct++;
                    if (metrics[section]) {
                        metrics[section].correct++;
                    }
                }
            }
        }
    }
    
    return metrics;
  }, [sortedResults]);
  
  const getPercentage = (correct: number, total: number) => {
    return total > 0 ? (correct / total) * 100 : 0;
  };

  const overallPercentage = getPercentage(performanceMetrics.overall.correct, performanceMetrics.overall.total);
  const listeningPercentage = getPercentage(performanceMetrics.listening.correct, performanceMetrics.listening.total);
  const structurePercentage = getPercentage(performanceMetrics.structure.correct, performanceMetrics.structure.total);
  const readingPercentage = getPercentage(performanceMetrics.reading.correct, performanceMetrics.reading.total);

  const overallCecrl = getCecrlLevel(overallPercentage);
  const listeningCecrl = getCecrlLevel(listeningPercentage);
  const structureCecrl = getCecrlLevel(structurePercentage);
  const readingCecrl = getCecrlLevel(readingPercentage);

  const overallColor = getScoreColor(overallPercentage);
  const listeningColor = getScoreColor(listeningPercentage);
  const structureColor = getScoreColor(structurePercentage);
  const readingColor = getScoreColor(readingPercentage);

  if (isUserLoading || isResultsLoading) {
    return <Loading />;
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Résultats des tests" />
        <main className="flex-1 flex items-center justify-center text-center p-4">
          <Card>
            <CardHeader>
              <CardTitle>Aucun résultat pour le moment</CardTitle>
              <CardDescription>
                Vous n\'avez terminé aucun test. Vos résultats apparaîtront ici une fois que vous l\'aurez fait.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/practice">Commencer un test</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const latestResult = sortedResults[0];
  const incorrectAnswers = (latestResult?.answers || []).filter(a => !a.isCorrect);

  return (
    <div className="flex flex-col h-full">
      <Header title="Résultats des tests" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Votre performance globale</CardTitle>
               <CardDescription>Basé sur votre dernière tentative.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4 p-4 bg-secondary/30 rounded-lg">
                    <p className="text-xl font-semibold">Niveau global estimé :</p>
                    <Badge className={`px-6 py-2 text-2xl font-bold ${overallColor.badge}`}>{overallCecrl}</Badge>
                    <div className="w-full max-w-sm space-y-1">
                        <Progress value={overallPercentage} className="h-3" indicatorClassName={overallColor.bg} />
                        <p className={`text-center text-sm font-medium ${overallColor.text}`}>{`${performanceMetrics.overall.correct} / ${performanceMetrics.overall.total} correctes`}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SectionResultCard title="Écoute" icon={<Headphones className="h-6 w-6 text-primary" />} percentage={listeningPercentage} level={listeningCecrl} color={listeningColor.badge} />
                    <SectionResultCard title="Grammaire" icon={<Puzzle className="h-6 w-6 text-primary" />} percentage={structurePercentage} level={structureCecrl} color={structureColor.badge} />
                    <SectionResultCard title="Lecture" icon={<BookOpenText className="h-6 w-6 text-primary" />} percentage={readingPercentage} level={readingCecrl} color={readingColor.badge} />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Révisez votre dernier test</CardTitle>
               <CardDescription>
                  Passer en revue les erreurs est la clé du progrès. Voici les réponses incorrectes de votre dernier test : <span className="font-semibold">{latestResult.testName}</span>
               </CardDescription>
            </CardHeader>
            <CardContent>
               {incorrectAnswers.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {incorrectAnswers.map((item, index) => {
                    const userAnswer = item.question.options.find(
                      (o) => o.id === item.selectedOptionId
                    );
                    const correctAnswer = item.question.options.find(
                      (o) => o.id === item.question.correctOptionId
                    );
                    return (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="hover:no-underline text-left">
                          <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                            <span className="flex-1">{item.question.questionText}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pl-10">
                          <div>
                            <p className="font-semibold mb-2">Votre réponse :</p>
                            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <p>{userAnswer?.text || <span className="italic">Vous n\'avez pas répondu à cette question.</span>}</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold mb-2">Réponse correcte :</p>
                            <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <p>{correctAnswer?.text}</p>
                            </div>
                          </div>
                           {item.question.explanation && (
                              <Alert className="border-blue-500/50">
                                  <Lightbulb className="h-4 w-4 text-blue-500" />
                                  <AlertTitle className="text-blue-600">Explication</AlertTitle>
                                  <AlertDescription>{item.question.explanation}</AlertDescription>
                              </Alert>
                           )}
                          {item.question.explanationVideoUrl && (
                            <Button variant="link" asChild className="p-0 h-auto">
                              <a href={item.question.explanationVideoUrl} target="_blank" rel="noopener noreferrer">
                                Regarder la vidéo d\'explication
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {item.question.section === 'structure' && (
                            <div className="space-y-2 pt-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                                    onClick={() => handleReportError(item, index)}
                                    disabled={reportingItems.includes(index) || reportedItems.includes(index)}
                                >
                                    {reportingItems.includes(index) ? (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                            Analyse en cours...
                                        </>
                                    ) : reportedItems.includes(index) ? (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Rapport envoyé!
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquareWarning className="mr-2 h-4 w-4" />
                                            Correction par l'IA
                                        </>
                                    )}
                                </Button>
                                {aiFeedback[index] && (
                                     <Alert className="border-purple-500/50">
                                        <Sparkles className="h-4 w-4 text-purple-500" />
                                        <AlertTitle className="text-purple-600">Correction de l'IA</AlertTitle>
                                        <AlertDescription>{aiFeedback[index]}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
               ) : (
                <div className="text-center p-6 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Félicitations !</h3>
                    <p className="text-muted-foreground">Vous n\'avez eu aucune réponse incorrecte lors de votre dernier test.</p>
                </div>
               )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/">Retour au tableau de bord</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
