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
    setIsSeeding(true);
    try {
      batchUploadNonBlocking(firestore, 'questions', seedQuestions);
      toast({
        title: 'Database Seeding Initiated',
        description: `Questions are being added to the database. This may take a moment.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'Could not add questions to the database.',
      });
    } finally {
        // Give feedback to the user, but this doesn't guarantee completion,
        // just that the non-blocking operation was started.
        setTimeout(() => setIsSeeding(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Admin Panel" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Use this section to manage your application's data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Seed Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    Populate the database with initial sample questions.
                  </p>
                </div>
                <Button onClick={handleSeedDatabase} disabled={isSeeding}>
                  {isSeeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" />
                       Seed Database
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

    