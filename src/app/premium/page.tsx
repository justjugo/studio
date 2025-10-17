
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PremiumPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-4xl">
                <h1 className="text-4xl font-bold text-center mb-8">Passez à Premium</h1>
                <p className="text-center text-muted-foreground mb-12">Choisissez le plan qui vous convient pour atteindre vos objectifs.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Free Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gratuit</CardTitle>
                            <CardDescription>Pour commencer</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                            <ul className="space-y-2">
                                <li className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                    <span>Passer le test complet une fois tous les 7 jours</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                    <span>Passer un entraînement par section toutes les 24h</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" disabled>Votre plan actuel</Button>
                        </CardFooter>
                    </Card>

                    {/* Premium Plan */}
                    <Card className="border-purple-500 shadow-lg shadow-purple-500/10">
                        <CardHeader>
                            <CardTitle>Premium</CardTitle>
                            <CardDescription>Pour des résultats optimaux</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                             <p className="text-4xl font-bold">1000 DA<span className="text-lg font-normal text-muted-foreground">/mois</span></p>
                            <ul className="space-y-2 mt-4">
                                <li className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                    <span className="font-semibold">Discuter avec le professeur</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                    <span>Correction des questions incorrectes avec des <span className="font-semibold">conseils personnalisés</span></span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                    <span><span className="font-semibold">Accès illimité</span> pour le passage des tests et des entraînements</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                                <Link href="https://wa.me/213795230581" target="_blank" rel="noopener noreferrer">Contacter par WhatsApp</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
