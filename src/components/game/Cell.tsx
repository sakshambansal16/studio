'use client'

import XIcon from './XIcon';
import OIcon from './OIcon';
import { cn } from '@/lib/utils';
import type { CellValue } from '@/lib/types';

interface CellProps {
  value: CellValue;
  onClick: () => void;
  isWinningCell: boolean;
  isBoardDisabled: boolean;
}

const Cell = ({ value, onClick, isWinningCell, isBoardDisabled }: CellProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isBoardDisabled || !!value}
      className={cn(
        "aspect-square w-full h-full rounded-lg bg-background/60 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg",
        "disabled:cursor-not-allowed",
        isWinningCell ? "bg-accent/30 scale-105" : "hover:bg-primary/20",
        !value && !isBoardDisabled ? "cursor-pointer" : ""
      )}
      aria-label={`Cell ${value ? `contains ${value}` : 'empty'}`}
    >
      {value && (
        <div className="w-1/2 h-1/2 animate-scale-in">
          {value === 'X' ? <XIcon className="text-chart-1" /> : <OIcon className="text-chart-2" />}
        </div>
      )}
    </button>
  );
};

export default Cell;
