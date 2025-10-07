
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
import { CheckCircle2, ExternalLink, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Result, UserAnswerForReview } from '@/lib/types';
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
  
  const totalScoreSum = results.reduce((sum, result) => sum + result.totalScore, 0);
  const totalQuestionSum = results.reduce((sum, result) => sum + result.questionCount, 0);
  const averagePercentage = totalQuestionSum > 0 ? (totalScoreSum / totalQuestionSum) * 100 : 0;
  
  const cecrl = getCecrlLevel(averagePercentage);

  return (
    <div className="flex flex-col h-full">
      <Header title="Test Results" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Your Overall Performance</CardTitle>
               <CardDescription>Based on all your {results.length} attempts.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-xl">Estimated Level:</p>
                <Badge
                  className={`px-4 py-2 text-xl text-primary-foreground ${cecrl.color}`}
                >
                  {cecrl.level}
                </Badge>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Average Score</span>
                </div>
                <Progress value={averagePercentage} className="h-4" />
                <p className="text-right text-lg font-bold text-primary">{`${Math.round(averagePercentage)}%`}</p>
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
