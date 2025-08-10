export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardState = CellValue[];
export type GameMode = 'single' | 'local';
export type AgeMode = 'Child' | 'Teen' | 'Adult';
export interface Stats {
  X: number;
  O: number;
  draw: number;
}
