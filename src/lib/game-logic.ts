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

export function findBestMove(board: BoardState, difficulty: number, aiPlayer: Player): number {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const emptyCells = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[];

  if (emptyCells.length === 0) return -1;

  // Difficulty check: Lower difficulty means higher chance of a random move
  if (Math.random() > difficulty / 10) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  // 1. Check for a winning move for the AI
  const winningMove = findMove(board, aiPlayer);
  if (winningMove !== null) return winningMove;
  
  // 2. Check for a blocking move against the human
  const blockingMove = findMove(board, humanPlayer);
  if (blockingMove !== null) return blockingMove;

  // 3. Take the center if it's available
  if (emptyCells.includes(4)) return 4;
  
  // 4. Block opponent's fork opportunity (simplified)
  const corners = { '0': 8, '2': 6, '6': 2, '8': 0 };
  for(const corner in corners){
    if(board[parseInt(corner)] === humanPlayer && emptyCells.includes(corners[corner as keyof typeof corners]))
      return corners[corner as keyof typeof corners];
  }
  
  // 5. Take an empty corner
  const emptyCorners = [0, 2, 6, 8].filter(i => emptyCells.includes(i));
  if (emptyCorners.length > 0) return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];

  // 6. Take any remaining empty cell
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}
