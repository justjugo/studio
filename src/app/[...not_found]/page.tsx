
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  const notFoundImage = PlaceHolderImages.find((img) => img.id === '404');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardContent className="p-0">
          {notFoundImage && (
            <Image
              src={notFoundImage.imageUrl}
              alt={notFoundImage.description}
              width={600}
              height={400}
              className="w-full h-48 object-cover rounded-t-lg"
              data-ai-hint={notFoundImage.imageHint}
            />
          )}
          <div className="p-6">
            <h1 className="text-5xl font-extrabold font-headline text-primary">404</h1>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Page non trouvée
            </h2>
            <p className="mt-4 text-muted-foreground">
              Oups ! La page que vous cherchez n'existe pas. Elle a peut-être
              été déplacée ou supprimée.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
