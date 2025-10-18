
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
import type { Result } from '@/lib/types';

const getScoreColor = (score: number) => {
    if (score > 90) return 'text-purple-600';
    if (score > 70) return 'text-green-600';
    if (score > 40) return 'text-yellow-500';
    return 'text-destructive';
};

const getCecrlLevel = (scorePercentage: number) => {
  if (scorePercentage < 20) return 'A1';
  if (scorePercentage < 40) return 'A2';
  if (scorePercentage < 60) return 'B1';
  if (scorePercentage < 80) return 'B2';
  if (scorePercentage < 90) return 'C1';
  return 'C2';
};

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const resultsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'results');
  }, [user, firestore]);

  const { data: results, isLoading: isResultsLoading } = useCollection<Result>(resultsCollection);

  const userProgressHistory = useMemo(() => {
    if (!results) return [];
    return results.map(result => ({
      id: result.id,
      date: result.createdAt, 
      score: result.totalScore,
      totalQuestions: result.questionCount, 
      timeTaken: 0, // Not tracked yet
      testName: result.testName,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [results]);


  if (isUserLoading || isResultsLoading || !user) {
    return <Loading />;
  }

  const latestAttempt = userProgressHistory.length > 0 ? userProgressHistory[userProgressHistory.length - 1] : null;
  
  const averageScore =
    userProgressHistory.length > 0
      ? userProgressHistory.reduce(
          (acc, attempt) => acc + (attempt.score / attempt.totalQuestions),
          0
        ) / userProgressHistory.length
      : 0;

  const totalTests = userProgressHistory.length;
  
  const latestScorePercentage = latestAttempt ? Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100) : 0;
  const averageScorePercentage = Math.round(averageScore * 100);

  const latestCecrlLevel = getCecrlLevel(latestScorePercentage);
  const averageCecrlLevel = getCecrlLevel(averageScorePercentage);

  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Tableau de bord" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {userProgressHistory.length === 0 ? (
           <Card className="text-center p-8">
            <CardTitle>Bienvenue à la préparation TCF !</CardTitle>
            <CardDescription className="mt-2">
              Vous n'avez encore passé aucun test. Commencez par un test d'entraînement ou une formation pour voir vos progrès ici.
            </CardDescription>
            <div className="flex justify-center gap-4 mt-6">
               <Button asChild variant="secondary">
                <Link href="/training">
                  Aller à la formation
                </Link>
              </Button>
              <Button asChild>
                <Link href="/practice">
                  Commencer le test complet <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Dernier Score
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(latestScorePercentage)}`}>
                    {latestAttempt ? latestCecrlLevel : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    sur {latestAttempt ? latestAttempt.testName : ''}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Score Moyen
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(averageScorePercentage)}`}>{averageCecrlLevel}</div>
                  <p className="text-xs text-muted-foreground">
                    Sur toutes vos tentatives
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tests Passés
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTests}</div>
                  <p className="text-xs text-muted-foreground">
                    Continuez à vous entraîner !
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Temps Passé
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    --
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Suivi du temps bientôt disponible
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Commencez Votre Préparation</CardTitle>
                  <CardDescription>
                    Choisissez un mode pour commencer votre parcours de préparation au TCF.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Link href="/training" className="w-full">
                    <Button
                      variant="secondary"
                      className="w-full justify-between h-12 text-base"
                    >
                      Aller au mode Entraînement <ArrowRight />
                    </Button>
                  </Link>
                  <Link href="/practice" className="w-full">
                    <Button className="w-full justify-between h-12 text-base">
                      Commencer le test complet <ArrowRight />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Votre Progression</CardTitle>
                  <CardDescription>
                    Représentation visuelle de vos scores aux tests au fil du temps.
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