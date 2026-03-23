import type { Cat } from './entities/Cat';

export interface GridCell {
  col: number;
  row: number;
  occupied: boolean;
  cat: Cat | null;
}

export interface SpawnPoint {
  x: number;
  y: number;
  row: number;
}
