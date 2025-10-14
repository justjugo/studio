
'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Question, UserAnswerForReview } from '@/lib/types';

interface PracticeSessionSidebarProps {
    isFinished: boolean;
    items: (Question | UserAnswerForReview)[];
    currentQuestionIndex: number;
    goToQuestion: (index: number) => void;
}

export function PracticeSessionSidebar({
    isFinished,
    items,
    currentQuestionIndex,
    goToQuestion,
}: PracticeSessionSidebarProps) {
    const getQuestionType = (section: string) => {
        switch (section) {
            case 'listening':
                return '👂';
            case 'reading':
                return '📖';
            case 'structure':
                return '📝';
            default:
                return '';
        }
    };

    return (
        <Sidebar side="right">
            <SidebarContent>
                <SidebarHeader>
                    <CardTitle>Questions</CardTitle>
                </SidebarHeader>
                <SidebarMenu>
                    {items.map((item, index) => {
                        const question = isFinished
                            ? (item as UserAnswerForReview).question
                            : (item as Question);
                        const answer = isFinished ? (item as UserAnswerForReview) : null;

                        return (
                            <SidebarMenuItem key={index}>
                                <SidebarMenuButton
                                    onClick={() => goToQuestion(index)}
                                    isActive={index === currentQuestionIndex && !isFinished}
                                    className="flex justify-between items-center"
                                >
                                    <span className="flex items-center">
                                        <span className="mr-2">{getQuestionType(question.section)}</span>
                                        <span>Question {index + 1}</span>
                                    </span>
                                    {isFinished && answer && (
                                        answer.isCorrect ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        )
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
