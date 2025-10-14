'use client';

import { useMemo } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy, DocumentData, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from 'lucide-react';

// Define the structure of a user document
interface User extends DocumentData {
  id: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

// Define the structure of a test session document
interface TestSession extends DocumentData {
  id: string;
  isCompleted: boolean;
  score: number;
  completedAt: string; // ISO string format for dates
}

interface UserProgressRowProps {
  user: User;
}

export function UserProgressRow({ user }: UserProgressRowProps) {
  const firestore = useFirestore();

  // Memoize the collection reference for the user's test sessions
  const testSessionsCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, `users/${user.id}/testSessions`);
  }, [firestore, user.id]);

  // Memoize the query to get completed test sessions, ordered by completion date
  const completedTestSessionsQuery = useMemo(() => {
    if (!testSessionsCollection) return null;
    const q = query(
      testSessionsCollection,
      where('isCompleted', '==', true),
      orderBy('completedAt', 'desc')
    ) as (Query<DocumentData> & {__memo?: boolean});
    
    q.__memo = true; // This line is the fix!

    return q;
  }, [testSessionsCollection]);

  // Fetch the data using the custom useCollection hook
  const { data: completedSessions, isLoading, error } = useCollection<TestSession>(completedTestSessionsQuery);

  // Calculate statistics once the data is available
  const stats = useMemo(() => {
    if (!completedSessions || completedSessions.length === 0) {
      return {
        testsTaken: 0,
        averageScore: 0,
        latestScore: 0,
      };
    }

    const testsTaken = completedSessions.length;
    const totalScore = completedSessions.reduce((sum, session) => sum + (session.score || 0), 0);
    const averageScore = testsTaken > 0 ? totalScore / testsTaken : 0;
    // The first item is the latest since we ordered by completedAt descending
    const latestScore = completedSessions[0]?.score || 0;

    return {
      testsTaken,
      averageScore: Math.round(averageScore),
      latestScore,
    };
  }, [completedSessions]);

  return (
    <TableRow data-testid={`user-row-${user.id}`}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>
              <UserIcon />
            </AvatarFallback>
          </Avatar>
          <span>{user.displayName || 'Utilisateur Anonyme'}</span>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>

      {isLoading ? (
        <TableCell colSpan={4} className="text-center">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </TableCell>
      ) : error ? (
        <TableCell colSpan={4} className="text-center text-destructive">
          Erreur lors du chargement des données
        </TableCell>
      ) : (
        <>
          <TableCell className="text-center">{stats.testsTaken}</TableCell>
          <TableCell className="text-center">{stats.averageScore}%</TableCell>
          <TableCell className="text-center">{stats.latestScore}%</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                <DropdownMenuItem disabled>Supprimer l'utilisateur</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
