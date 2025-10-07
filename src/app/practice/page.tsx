
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookOpenText, Clock, Headphones, Puzzle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PracticePage() {
  const practiceImage = PlaceHolderImages.find(img => img.id === 'practice-test');
  
  return (
    <div className="flex flex-col h-full">
      <Header title="Test d'entraînement" />
      <main className="flex-1 overflow-y-auto">
        <div className="relative h-48 md:h-64">
          {practiceImage && (
            <Image
              src={practiceImage.imageUrl}
              alt={practiceImage.description}
              fill
              className="object-cover"
              data-ai-hint={practiceImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <h1 className="text-4xl md:text-5xl font-bold font-headline">Choisissez votre test d'entraînement</h1>
              <p className="mt-2 text-lg md:text-xl">Simulez les conditions réelles de l'examen</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Test d'entraînement complet</CardTitle>
                <CardDescription>Les trois sections obligatoires.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Headphones className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Compréhension orale (25 min)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Puzzle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Structures de la langue (15 min)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BookOpenText className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Compréhension écrite (45 min)</span>
                  </li>
                </ul>
                 <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg text-sm">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Durée totale:</span> ~1 heure 25 minutes
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button size="lg" asChild className="w-full">
                  <Link href="/practice/session/full"> 
                    Commencer le test complet <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Grammaire & Lecture</CardTitle>
                <CardDescription>Concentrez-vous sur les compétences écrites.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Puzzle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Structures de la langue (15 min)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BookOpenText className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Compréhension écrite (45 min)</span>
                  </li>
                </ul>
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg text-sm">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                   <div>
                    <span className="font-semibold">Durée totale:</span> ~1 heure
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" asChild className="w-full">
                  <Link href="/practice/session/written"> 
                    Commencer le test écrit <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
