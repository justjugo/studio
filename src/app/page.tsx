'use client';

import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressChart from '@/components/ProgressChart';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import Loading from './loading';
import { collection } from 'firebase/firestore';
import type { Result, TestAttempt } from '@/lib/types';


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const resultsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'results');
  }, [user, firestore]);

  const { data: results, isLoading: isResultsLoading } = useCollection<Result>(resultsCollection);

  const userProgressHistory = useMemo(() => {
    if (!results) return [];
    // Transform Firestore `Result` documents into `TestAttempt` objects
    // This is a placeholder transformation. You might need to adjust it
    // based on the actual structure of your `Result` documents.
    return results.map(result => ({
      id: result.id,
      date: result.createdAt, 
      score: result.totalScore,
      // Assuming a fixed total number of questions for now
      totalQuestions: 76, 
      // Placeholder for timeTaken, as it's not in the Result entity
      timeTaken: 4500, 
      sections: {
        // Placeholder for sections, as this requires more complex data fetching
        listening: { score: 0, total: 29 },
        reading: { score: 0, total: 29 },
        structure: { score: 0, total: 18 },
      },
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [results]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isResultsLoading || !user) {
    return <Loading />;
  }

  const latestAttempt = userProgressHistory.length > 0 ? userProgressHistory[userProgressHistory.length - 1] : null;
  
  const averageScore =
    userProgressHistory.length > 0
      ? userProgressHistory.reduce(
          (acc, attempt) => acc + attempt.score / attempt.totalQuestions,
          0
        ) / userProgressHistory.length
      : 0;

  const totalTests = userProgressHistory.length;

  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {userProgressHistory.length === 0 ? (
           <Card className="text-center p-8">
            <CardTitle>Welcome to TCF Prep!</CardTitle>
            <CardDescription className="mt-2">
              You haven't taken any tests yet. Start with a practice test to see your progress here.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link href="/practice">
                Start Full Practice Test <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Latest Score
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestAttempt ? `${Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100)}%` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    on {latestAttempt ? new Date(latestAttempt.date).toLocaleDateString() : 'No tests taken'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Score
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(averageScore * 100)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Across all your attempts
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tests Taken
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTests}</div>
                  <p className="text-xs text-muted-foreground">
                    Keep practicing!
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestAttempt ? `${Math.floor(latestAttempt.timeTaken / 60)}m ${latestAttempt.timeTaken % 60}s` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    On your last test
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Start Your Prep</CardTitle>
                  <CardDescription>
                    Choose a mode to begin your TCF preparation journey.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Link href="/training" className="w-full">
                    <Button
                      variant="secondary"
                      className="w-full justify-between h-12 text-base"
                    >
                      Go to Training Mode <ArrowRight />
                    </Button>
                  </Link>
                  <Link href="/practice" className="w-full">
                    <Button className="w-full justify-between h-12 text-base">
                      Start Full Practice Test <ArrowRight />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                  <CardDescription>
                    Visual representation of your test scores over time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressChart data={userProgressHistory} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
