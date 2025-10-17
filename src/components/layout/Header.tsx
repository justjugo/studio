
'use client';

import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelRightClose, Sparkles } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useUser } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export function Header({ title, showSidebarToggle = true, showChatButton = true }: { title: string, showSidebarToggle?: boolean, showChatButton?: boolean }) {
    const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [isPaidUser, setIsPaidUser] = useState(false);
    const [isRoleLoading, setIsRoleLoading] = useState(true);

    const isSidebarOpen = isMobile ? openMobile : open;

    useEffect(() => {
        if (isUserLoading) {
            setIsRoleLoading(true);
            return;
        }
        
        if (!user) {
            setIsPaidUser(false);
            setIsRoleLoading(false);
            return;
        }

        const checkUserRole = async () => {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().role === 'paiduser') {
                    setIsPaidUser(true);
                } else {
                    setIsPaidUser(false);
                }
            } catch (error) {
                console.error("Error checking user role:", error);
                setIsPaidUser(false);
            } finally {
                setIsRoleLoading(false);
            }
        };

        checkUserRole();
    }, [user, isUserLoading]);

    // Determine the correct href based on paid status and loading state
    const chatLinkHref = isRoleLoading || !isPaidUser 
        ? '/premium' 
        : 'https://n8n-m1ji.onrender.com/webhook/2f8b8ccc-f4bb-4822-8cc4-f59d79856b0a/chat';

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-4">
                {showSidebarToggle && (
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isSidebarOpen ? (
                            <PanelLeftClose className="h-6 w-6" />
                        ) : (
                            <PanelRightClose className="h-6 w-6" />
                        )}
                        <span className="sr-only">Toggle main sidebar</span>
                    </Button>
                )}
                <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
            </div>
            {showChatButton && (
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" className="border-2 border-purple-500/50 text-purple-600 hover:bg-purple-500/10 hover:text-purple-600 hover:no-underline shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow">
                        <Link href={chatLinkHref} target={isPaidUser ? "_blank" : "_self"} className="flex items-center gap-2 px-4 py-2">
                            <Sparkles className="h-5 w-5" />
                            <span className="text-base font-semibold">Discuter avec le professeure  </span>
                        </Link>
                    </Button>
                </div>
            )}
        </header>
    )
}
