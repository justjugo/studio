
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { batchUploadNonBlocking } from '@/firebase/non-blocking-updates';
import { seedQuestions } from '@/lib/seed-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';

export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Firestore non disponible',
        description: 'Veuillez réessayer plus tard.',
      });
      return;
    }
    setIsSeeding(true);
    try {
      // The type assertion is safe because seedQuestions now comes from a JSON file
      // that matches the expected structure.
      batchUploadNonBlocking(firestore, 'questions', seedQuestions);
      toast({
        title: 'Peuplement de la base de données initié',
        description: `Les questions sont en cours d'ajout. Cela peut prendre un moment.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Le peuplement a échoué',
        description: 'Impossible d\'ajouter les questions à la base de données.',
      });
    } finally {
        // Give feedback to the user, but this doesn't guarantee completion,
        // just that the non-blocking operation was started.
        setTimeout(() => setIsSeeding(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Panneau d'administration" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Gestion de la base de données</CardTitle>
              <CardDescription>
                Utilisez cette section pour gérer les données de votre application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Peupler les questions</h4>
                  <p className="text-sm text-muted-foreground">
                    Remplissez la base de données avec des questions d'exemple.
                  </p>
                </div>
                <Button onClick={handleSeedDatabase} disabled={isSeeding}>
                  {isSeeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Peuplement...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" />
                       Peupler la base de données
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
