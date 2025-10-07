
'use client';

import { useMemo } from 'react';
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
import { CheckCircle2, ExternalLink, XCircle, Lightbulb, BookOpenText, Headphones, Puzzle } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Result } from '@/lib/types';
import Loading from '../loading';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const getCecrlLevel = (scorePercentage: number) => {
  if (scorePercentage < 20) return { level: 'A1', color: 'bg-red-500' };
  if (scorePercentage < 40) return { level: 'A2', color: 'bg-orange-500' };
  if (scorePercentage < 60) return { level: 'B1', color: 'bg-yellow-500 text-black' };
  if (scorePercentage < 80) return { level: 'B2', color: 'bg-green-500' };
  if (scorePercentage < 90) return { level: 'C1', color: 'bg-blue-500' };
  return { level: 'C2', color: 'bg-purple-500' };
};

const SectionResultCard = ({ title, icon, percentage, level, color }: { title: string, icon: React.ReactNode, percentage: number, level: string, color: string }) => (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </div>
        <Badge className={`px-3 py-1 text-md mb-2 ${color}`}>{level}</Badge>
        <div className="w-full">
            <Progress value={percentage} className="h-2" />
            <p className="text-right text-sm font-semibold text-primary mt-1">{`${Math.round(percentage)}%`}</p>
        </div>
    </div>
)

export default function ResultsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const resultsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'results');
  }, [user, firestore]);

  const { data: results, isLoading: isResultsLoading } = useCollection<Result>(resultsCollection);

  const sortedResults = useMemo(() => {
    if (!results) return [];
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [results]);

  const performanceMetrics = useMemo(() => {
    const recentResults = sortedResults.slice(0, 3);
    
    if (!recentResults || recentResults.length === 0) {
      return {
        overall: { correct: 0, total: 0 },
        listening: { correct: 0, total: 0 },
        structure: { correct: 0, total: 0 },
        reading: { correct: 0, total: 0 },
      };
    }

    const metrics = {
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
                metrics[section].total++;
                if (answer.isCorrect) {
                    metrics.overall.correct++;
                    metrics[section].correct++;
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

  if (isUserLoading || isResultsLoading) {
    return <Loading />;
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Test Results" />
        <main className="flex-1 flex items-center justify-center text-center p-4">
          <Card>
            <CardHeader>
              <CardTitle>No Results Yet</CardTitle>
              <CardDescription>
                You haven't completed any tests. Your results will appear here once you do.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/practice">Start a Test</Link>
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
      <Header title="Test Results" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Your Overall Performance</CardTitle>
               <CardDescription>Based on your {sortedResults.slice(0, 3).length} latest attempts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4 p-4 bg-secondary/30 rounded-lg">
                    <p className="text-xl font-semibold">Overall Estimated Level:</p>
                    <Badge className={`px-6 py-2 text-2xl font-bold ${overallCecrl.color}`}>{overallCecrl.level}</Badge>
                    <div className="w-full max-w-sm space-y-1">
                        <Progress value={overallPercentage} className="h-3" />
                        <p className="text-center text-sm font-medium text-muted-foreground">{`${performanceMetrics.overall.correct} / ${performanceMetrics.overall.total} correct`}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SectionResultCard title="Listening" icon={<Headphones className="h-6 w-6 text-primary" />} percentage={listeningPercentage} level={listeningCecrl.level} color={listeningCecrl.color} />
                    <SectionResultCard title="Grammar" icon={<Puzzle className="h-6 w-6 text-primary" />} percentage={structurePercentage} level={structureCecrl.level} color={structureCecrl.color} />
                    <SectionResultCard title="Reading" icon={<BookOpenText className="h-6 w-6 text-primary" />} percentage={readingPercentage} level={readingCecrl.level} color={readingCecrl.color} />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Your Last Test</CardTitle>
               <CardDescription>
                  Reviewing mistakes is key to progress. Here are the incorrect answers from your last test: <span className="font-semibold">{latestResult.testName}</span>
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
                            <p className="font-semibold mb-2">Your Answer:</p>
                            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <p>{userAnswer?.text || <span className="italic">You did not answer this question.</span>}</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold mb-2">Correct Answer:</p>
                            <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <p>{correctAnswer?.text}</p>
                            </div>
                          </div>
                           {item.question.explanation && (
                              <Alert>
                                  <Lightbulb className="h-4 w-4" />
                                  <AlertTitle>Explanation</AlertTitle>
                                  <AlertDescription>{item.question.explanation}</AlertDescription>
                              </Alert>
                           )}
                          {item.question.explanationVideoUrl && (
                            <Button variant="link" asChild className="p-0 h-auto">
                              <a href={item.question.explanationVideoUrl} target="_blank" rel="noopener noreferrer">
                                Watch explanation video
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
               ) : (
                <div className="text-center p-6 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Congratulations!</h3>
                    <p className="text-muted-foreground">You had no incorrect answers on your last test.</p>
                </div>
               )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
