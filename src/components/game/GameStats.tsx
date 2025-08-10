import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Stats } from '@/lib/types';

interface GameStatsProps {
    stats: Stats;
}

const GameStats = ({ stats }: GameStatsProps) => {
    return (
        <Card className="w-full max-w-md shadow-md bg-card">
            <CardHeader>
                <CardTitle className="text-center font-headline text-xl">Game Statistics</CardTitle>
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
