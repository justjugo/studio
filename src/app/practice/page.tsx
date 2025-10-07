import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookOpenText, Clock, Headphones, Puzzle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PracticePage() {
  const practiceImage = PlaceHolderImages.find(img => img.id === 'practice-test');
  
  return (
    <div className="flex flex-col h-full">
      <Header title="Practice Test" />
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
              <h1 className="text-4xl md:text-5xl font-bold font-headline">TCF Full Practice Test</h1>
              <p className="mt-2 text-lg md:text-xl">Simulate real exam conditions</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Instructions</CardTitle>
              <CardDescription>Read the following instructions carefully before you begin the test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Test Structure</h3>
                <ul className="grid gap-4 md:grid-cols-3">
                  <li className="flex items-start gap-3">
                    <Headphones className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Listening Comprehension</h4>
                      <p className="text-sm text-muted-foreground">29 questions, ~25 minutes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Puzzle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Mastery of Language Structures</h4>
                      <p className="text-sm text-muted-foreground">18 questions, 15 minutes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <BookOpenText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Reading Comprehension</h4>
                      <p className="text-sm text-muted-foreground">29 questions, 45 minutes</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Time Limit</h4>
                  <p className="text-sm text-muted-foreground">
                    The total test duration is approximately 1 hour and 25 minutes. A timer will be displayed at the top. The test will automatically submit when the time is up.
                  </p>
                </div>
              </div>
              <div className="text-center pt-4">
                <Button size="lg" asChild>
                  {/* This would link to the actual test page, e.g., /practice/test */}
                  <Link href="/results"> 
                    Start Practice Test <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">(This will start a mock test and show the results page)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
