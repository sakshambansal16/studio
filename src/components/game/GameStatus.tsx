import type { Player, AgeMode, GameMode } from '@/lib/types';
import { Bot, User, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface GameStatusProps {
    winner: Player | 'Draw' | null;
    currentPlayer: Player;
    gameMode: GameMode | null;
    ageMode: AgeMode | null;
    isAiThinking: boolean;
    aiDifficulty: number | null;
}

const GameStatus = ({ winner, currentPlayer, gameMode, ageMode, isAiThinking, aiDifficulty }: GameStatusProps) => {
    
    const getStatusText = () => {
        if (winner) {
            if (winner === 'Draw') return "It's a Draw!";
            return `Player ${winner} Wins!`;
        }
        if (isAiThinking) {
            return "AI is thinking...";
        }
        return `Player ${currentPlayer}'s Turn`;
    };

    const getModeText = () => {
        if (gameMode === 'local') return "Local Multiplayer";
        if (gameMode === 'single' && ageMode) return `Single Player: ${ageMode}`;
        return "Loading game...";
    }

    return (
        <div className="text-center p-4 rounded-lg bg-card w-full shadow-md">
            <h2 className="text-2xl font-bold font-headline text-primary-foreground">{getStatusText()}</h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
                {gameMode === 'single' ? <Bot className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                <span>{getModeText()}</span>
                {gameMode === 'single' && (
                  <>
                  <span className="text-xs">|</span>
                  {aiDifficulty === null ? <Skeleton className="h-4 w-20" /> : <Badge variant="secondary">Difficulty: {aiDifficulty}</Badge>}
                  </>
                )}
            </div>
        </div>
    );
};

export default GameStatus;
