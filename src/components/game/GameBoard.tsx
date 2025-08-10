import type { BoardState, Player } from '@/lib/types';
import Cell from './Cell';

interface GameBoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  winningLine: number[] | null;
  isBoardDisabled: boolean;
}

const GameBoard = ({ board, onCellClick, winningLine, isBoardDisabled }: GameBoardProps) => {
  return (
    <div className="relative w-full max-w-md aspect-square">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-primary/20 shadow-inner w-full h-full">
        {board.map((value, index) => (
          <Cell
            key={index}
            value={value}
            onClick={() => onCellClick(index)}
            isWinningCell={!!winningLine?.includes(index)}
            isBoardDisabled={isBoardDisabled}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
