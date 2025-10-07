
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookOpenText, Headphones, Puzzle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const sections = [
  {
    name: 'Listening Comprehension',
    slug: 'listening',
    icon: <Headphones className="h-10 w-10 text-primary" />,
    description: "Hone your ability to understand spoken French.",
    imageId: 'listening'
  },
  {
    name: 'Language Structures',
    slug: 'structure',
    icon: <Puzzle className="h-10 w-10 text-primary" />,
    description: "Master grammar, vocabulary, and syntax.",
    imageId: 'structure'
  },
  {
    name: 'Reading Comprehension',
    slug: 'reading',
    icon: <BookOpenText className="h-10 w-10 text-primary" />,
    description: "Improve your skills in understanding written texts.",
    imageId: 'reading'
  },
];

export default function TrainingPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Training Mode" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Choose a Section to Practice</h2>
            <p className="text-muted-foreground mt-2">Practice questions at your own pace without any time limits.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => {
              const image = PlaceHolderImages.find(img => img.id === section.imageId);
              return (
                <Link key={section.slug} href={`/training/${section.slug}`}>
                  <Card className="group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
                    {image && (
                       <div className="overflow-hidden aspect-video">
                         <Image
                           src={image.imageUrl}
                           alt={image.description}
                           width={600}
                           height={400}
                           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                           data-ai-hint={image.imageHint}
                         />
                       </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-start gap-4">
                        {section.icon}
                        <span>{section.name}</span>
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-end">
                       <div className="flex items-center text-sm font-semibold text-primary">
                          Start Training
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                       </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
