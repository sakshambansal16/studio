import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Stats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface GameStatsProps {
    stats: Stats;
    onReset: () => void;
}

const GameStats = ({ stats, onReset }: GameStatsProps) => {
    return (
        <Card className="w-full max-w-md shadow-md bg-card">
            <CardHeader className='flex-row items-center justify-between'>
                <CardTitle className="font-headline text-xl">Game Statistics</CardTitle>
                <Button variant="ghost" size="sm" onClick={onReset} aria-label="Reset Statistics">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around text-center">
                    <div>
                        <p className="text-2xl font-bold text-chart-1">{stats.X}</p>
                        <p className="text-sm text-muted-foreground">Player X Wins</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.draw}</p>
                        <p className="text-sm text-muted-foreground">Draws</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-chart-2">{stats.O}</p>
                        <p className="text-sm text-muted-foreground">Player O Wins</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GameStats;
