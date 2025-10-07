'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userProgress } from '@/lib/tcf-data';
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

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <Loading />;
  }

  const latestAttempt = userProgress.history[userProgress.history.length - 1];
  const averageScore =
    userProgress.history.length > 0
      ? userProgress.history.reduce(
          (acc, attempt) => acc + attempt.score / attempt.totalQuestions,
          0
        ) / userProgress.history.length
      : 0;

  const totalTests = userProgress.history.length;

  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
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
                <ProgressChart data={userProgress.history} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
