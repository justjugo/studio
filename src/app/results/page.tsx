import { Header } from '@/components/layout/Header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { questions, userProgress } from '@/lib/tcf-data';
import { CheckCircle2, Circle, ExternalLink, XCircle } from 'lucide-react';
import Link from 'next/link';

const getCecrlLevel = (scorePercentage: number) => {
  if (scorePercentage < 20) return { level: 'A1', color: 'bg-red-500' };
  if (scorePercentage < 40) return { level: 'A2', color: 'bg-orange-500' };
  if (scorePercentage < 60) return { level: 'B1', color: 'bg-yellow-500' };
  if (scorePercentage < 80) return { level: 'B2', color: 'bg-green-500' };
  if (scorePercentage < 90) return { level: 'C1', color: 'bg-blue-500' };
  return { level: 'C2', color: 'bg-purple-500' };
};

export default function ResultsPage() {
  // Using the last attempt as mock data for this page
  const result = userProgress.history[userProgress.history.length - 1];
  const scorePercentage = (result.score / result.totalQuestions) * 100;
  const cecrl = getCecrlLevel(scorePercentage);

  // Mocking incorrect answers
  const incorrectAnswers = questions.slice(0, 5).map((q, i) => ({
    question: q,
    userAnswerId: q.options[(i + 1) % q.options.length].id,
  }));

  return (
    <div className="flex flex-col h-full">
      <Header title="Test Results" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Your Performance</CardTitle>
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
                  <span>Overall Score</span>
                  <span>
                    {result.score} / {result.totalQuestions}
                  </span>
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
                {incorrectAnswers.map((item, index) => {
                  const userAnswer = item.question.options.find(
                    (o) => o.id === item.userAnswerId
                  );
                  const correctAnswer = item.question.options.find(
                    (o) => o.id === item.question.correctOptionId
                  );
                  return (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                           <XCircle className="h-5 w-5 text-destructive" />
                          <span className="text-left flex-1">{item.question.questionText}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pl-8">
                        <div>
                          <p className="font-semibold mb-2">Your Answer:</p>
                          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <p>{userAnswer?.text}</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold mb-2">Correct Answer:</p>
                          <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">
                             <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p>{correctAnswer?.text}</p>
                          </div>
                        </div>
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
