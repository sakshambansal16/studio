'use client';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TicTacToeGame from '@/components/game/TicTacToeGame';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

function GameLoadingSkeleton() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 space-y-6">
            <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-primary/20 shadow-inner w-full aspect-square">
                    {[...Array(9)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-full rounded-lg" />
                    ))}
                </div>
                <div className="flex items-center justify-between w-full">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>
            <Skeleton className="h-24 w-full max-w-md" />
        </div>
    );
}

function GamePageContent() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <GameLoadingSkeleton />;
    }

    return (
        <Suspense fallback={<GameLoadingSkeleton />}>
            <TicTacToeGame />
        </Suspense>
    );
}

export default function GamePage() {
    return <GamePageContent />;
}
