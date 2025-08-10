import type { BoardState, Player } from './types';

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function checkWinner(board: BoardState): { winner: Player; line: number[] } | 'Draw' | null {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, line: combo };
    }
  }
  if (board.every(cell => cell !== null)) {
    return 'Draw';
  }
  return null;
}

const findMove = (board: BoardState, player: Player): number | null => {
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const tempBoard = [...board];
      tempBoard[i] = player;
      const result = checkWinner(tempBoard);
      if (typeof result === 'object' && result?.winner === player) {
        return i;
      }
    }
  }
  return null;
}

export function findBestMove(board: BoardState, difficulty: number): number {
  const emptyCells = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[];

  if (Math.random() > difficulty / 10) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  const winningMove = findMove(board, 'O');
  if (winningMove !== null) return winningMove;
  
  const blockingMove = findMove(board, 'X');
  if (blockingMove !== null) return blockingMove;

  if (emptyCells.includes(4)) return 4;
  
  const corners = { '0': 8, '2': 6, '6': 2, '8': 0 };
  for(const corner in corners){
    if(board[parseInt(corner)] === 'X' && emptyCells.includes(corners[corner as keyof typeof corners]))
      return corners[corner as keyof typeof corners];
  }
  
  const emptyCorners = [0, 2, 6, 8].filter(i => emptyCells.includes(i));
  if (emptyCorners.length > 0) return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];

  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}
