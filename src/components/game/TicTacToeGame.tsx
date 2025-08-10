'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCw, MessageCircle } from 'lucide-react';

import { adjustDifficulty } from '@/ai/flows/ai-opponent-difficulty';
import { getAICommentary } from '@/ai/flows/ai-commentary';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import GameBoard from './GameBoard';
import GameStatus from './GameStatus';
import GameStats from './GameStats';
import { checkWinner, findBestMove } from '@/lib/game-logic';
import type { AgeMode, BoardState, GameMode, Player, Stats } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

export default function TicTacToeGame() {
  const searchParams = useSearchParams();
  const gameMode = useMemo(() => searchParams.get('mode') as GameMode | null, [searchParams]);
  const ageMode = useMemo(() => searchParams.get('age') as AgeMode | null, [searchParams]);
  const theme = useMemo(() => searchParams.get('theme') || 'jungle', [searchParams]);


  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winnerInfo, setWinnerInfo] = useState<{ winner: Player; line: number[] } | 'Draw' | null>(null);
  const [stats, setStats] = useState<Stats>({ X: 0, O: 0, draw: 0 });
  const [aiDifficulty, setAiDifficulty] = useState<number | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [aiCommentary, setAiCommentary] = useState<string>('');
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // cleanup previous theme
    document.body.classList.remove('theme-jungle', 'theme-ocean', 'theme-space');
    document.body.classList.add(`theme-${theme}`);
    
    // cleanup on component unmount
    return () => {
      document.body.classList.remove(`theme-${theme}`);
    };
  }, [theme]);

  const winner = useMemo(() => (winnerInfo === 'Draw' ? 'Draw' : winnerInfo?.winner ?? null), [winnerInfo]);
  const winningLine = useMemo(() => (winnerInfo === 'Draw' ? null : winnerInfo?.line ?? null), [winnerInfo]);
  const currentPlayer = isXNext ? 'X' : 'O';
  const isBoardDisabled = !!winner || isAiThinking;

  const statsKey = useMemo(() => {
    if (!gameMode) return null;
    return gameMode === 'single' ? `ttt_stats_${ageMode}` : 'ttt_stats_local';
  }, [gameMode, ageMode]);

  useEffect(() => {
    if (isMounted && statsKey) {
      try {
        const storedStats = localStorage.getItem(statsKey);
        if (storedStats) setStats(JSON.parse(storedStats));
      } catch (error) {
        console.error("Could not load stats.", error);
      }
    }
  }, [isMounted, statsKey]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinnerInfo(null);
    setShowWinnerDialog(false);
    setAiCommentary('');
  }, []);

  const fetchCommentary = useCallback(async (currentBoard: BoardState, player: Player, gameWinner: Player | 'Draw' | null) => {
    if (!gameMode) return;
    setIsCommentaryLoading(true);
    try {
      const result = await getAICommentary({
        board: currentBoard,
        currentPlayer: player,
        winner: gameWinner,
        gameMode: gameMode,
        ageMode: ageMode,
      });
      setAiCommentary(result.commentary);
    } catch (error) {
      console.error('Failed to get AI commentary:', error);
      setAiCommentary("I'm speechless!");
    } finally {
      setIsCommentaryLoading(false);
    }
  }, [gameMode, ageMode]);


  useEffect(() => {
    if (winner && statsKey) {
      setShowWinnerDialog(true);
      fetchCommentary(board, currentPlayer, winner);
      setStats(currentStats => {
        const newStats = { ...currentStats };
        if (winner === 'X') newStats.X += 1;
        else if (winner === 'O') newStats.O += 1;
        else if (winner === 'Draw') newStats.draw += 1;
        
        try {
          if (isMounted) localStorage.setItem(statsKey, JSON.stringify(newStats));
        } catch (error) {
          console.error("Could not save stats.", error);
        }
        return newStats;
      });
    }
  }, [winner, statsKey, isMounted, board, currentPlayer, fetchCommentary]);

  useEffect(() => {
    if (gameMode === 'single' && ageMode && aiDifficulty === null) {
      const getDifficulty = async () => {
        try {
          const result = await adjustDifficulty({ ageMode });
          setAiDifficulty(result.difficultyLevel);
        } catch (error) {
          console.error('Failed to get AI difficulty:', error);
          setAiDifficulty(5);
        }
      };
      getDifficulty();
    }
  }, [gameMode, ageMode, aiDifficulty]);
  
  const handleCellClick = useCallback((index: number) => {
    if (winnerInfo || board[index]) {
        return;
    }

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    const newWinnerInfo = checkWinner(newBoard);
    if (newWinnerInfo) {
      setWinnerInfo(newWinnerInfo);
    } else {
      setIsXNext(prev => !prev);
      if (gameMode !== 'single' || currentPlayer === 'O') {
        fetchCommentary(newBoard, !isXNext ? 'X' : 'O', null);
      }
    }
  }, [board, currentPlayer, winnerInfo, gameMode, fetchCommentary, isXNext]);

  useEffect(() => {
    if (gameMode === 'single' && currentPlayer === 'O' && !winner && aiDifficulty !== null) {
        setIsAiThinking(true);
        fetchCommentary(board, 'X', null);
        const timer = setTimeout(() => {
            const move = findBestMove(board, aiDifficulty);
            if (move !== -1) {
              handleCellClick(move);
            }
            setIsAiThinking(false);
        }, 1500);

        return () => clearTimeout(timer);
    }
  }, [gameMode, currentPlayer, winner, aiDifficulty, board, handleCellClick, fetchCommentary]);
  
  if (!isMounted || !gameMode) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <p className="mb-4">{!isMounted ? "Loading game..." : "Invalid game mode. Please select a mode from the home page."}</p>
            {isMounted && <Link href="/" passHref>
                <Button>Go Home</Button>
            </Link>}
        </div>
      )
  }

  return (
    <main className={cn("flex min-h-screen flex-col items-center justify-center bg-background p-4 space-y-6")}>
      <div className="flex flex-col items-center space-y-4 w-full max-w-md">
        <GameStatus winner={winner} currentPlayer={currentPlayer} gameMode={gameMode} ageMode={ageMode} isAiThinking={isAiThinking} aiDifficulty={aiDifficulty} />
        
        <div className="relative w-full max-w-md">
            <GameBoard board={board} onCellClick={handleCellClick} winningLine={winningLine} isBoardDisabled={isBoardDisabled} />
            {(aiCommentary || isCommentaryLoading) && (
              <div className="absolute -bottom-14 left-0 right-0 flex justify-center">
                  <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-lg text-sm text-card-foreground border border-border">
                      <MessageCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      {isCommentaryLoading ? <Skeleton className="h-5 w-32" /> : <p className="italic">"{aiCommentary}"</p>}
                  </div>
              </div>
            )}
        </div>


        <div className="flex items-center justify-between w-full pt-8">
            <Link href="/" passHref>
                <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/> New Game</Button>
            </Link>
            <Button onClick={resetGame}><RotateCw className="mr-2 h-4 w-4"/> Play Again</Button>
        </div>
      </div>
      <GameStats stats={stats} />
      <AlertDialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline text-2xl">
                      {winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                      {winner === 'Draw' ? "A hard-fought battle with no victor. Care for another round?" : "Congratulations on your glorious victory!"}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogAction onClick={resetGame}>Play Again</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
