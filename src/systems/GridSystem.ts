import { GRID_COLS, GRID_ROWS, GRID_ORIGIN_X, GRID_ORIGIN_Y, CELL_SIZE } from '../constants';
import type { GridCell } from '../types';
import type { Cat } from '../entities/Cat';

export class GridSystem {
  private cells: GridCell[][];

  constructor() {
    this.cells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      this.cells[row] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        this.cells[row][col] = { col, row, occupied: false, cat: null };
      }
    }
  }

  canPlace(col: number, row: number): boolean {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
    return !this.cells[row][col].occupied;
  }

  place(col: number, row: number, cat: Cat): void {
    this.cells[row][col].occupied = true;
    this.cells[row][col].cat = cat;
  }

  remove(col: number, row: number): void {
    this.cells[row][col].occupied = false;
    this.cells[row][col].cat = null;
  }

  /** Returns all living cats in a given row */
  getCatsInRow(row: number): Cat[] {
    return this.cells[row]
      .filter(c => c.cat !== null)
      .map(c => c.cat!);
  }

  /** Convert world pixel coords to grid col/row. Returns null if outside grid. */
  worldToGrid(x: number, y: number): { col: number; row: number } | null {
    const col = Math.floor((x - GRID_ORIGIN_X) / CELL_SIZE);
    const row = Math.floor((y - GRID_ORIGIN_Y) / CELL_SIZE);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
    return { col, row };
  }

  /** Convert grid col/row to world pixel center of the cell */
  gridToWorld(col: number, row: number): { x: number; y: number } {
    return {
      x: GRID_ORIGIN_X + col * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_ORIGIN_Y + row * CELL_SIZE + CELL_SIZE / 2,
    };
  }
}
