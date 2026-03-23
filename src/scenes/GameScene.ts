import Phaser from 'phaser';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  GRID_COLS, GRID_ROWS, CELL_SIZE, GRID_ORIGIN_X, GRID_ORIGIN_Y,
  CAT_COST, TEX, EVT, TOTAL_WAVES,
} from '../constants';
import { GridSystem } from '../systems/GridSystem';
import { ResourceSystem } from '../systems/ResourceSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { Cat } from '../entities/Cat';
import { Zombie } from '../entities/Zombie';
import { Projectile } from '../entities/Projectile';

export class GameScene extends Phaser.Scene {
  private grid!: GridSystem;
  private resources!: ResourceSystem;
  private waves!: WaveSystem;

  private cats: Cat[] = [];
  private zombies: Zombie[] = [];
  private projectiles: Projectile[] = [];

  private hoverCell: Phaser.GameObjects.Image | null = null;
  private catSelected: boolean = false;
  private gameActive: boolean = true;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.cats = [];
    this.zombies = [];
    this.projectiles = [];
    this.gameActive = true;
    this.catSelected = false;

    this.grid = new GridSystem();
    this.resources = new ResourceSystem(this);
    this.waves = new WaveSystem(this, this.zombies);

    this.drawBackground();
    this.drawGrid();
    this.setupHover();
    this.setupInput();
    this.setupEvents();

    // Launch HUD on top
    this.scene.launch('UIScene', { gameScene: this });
  }

  update(_time: number, delta: number): void {
    if (!this.gameActive) return;

    this.resources.update(delta);
    this.waves.update(delta);

    this.updateZombies(delta);
    this.updateCats(delta);
    this.updateProjectiles(delta);
    this.checkCollisions();
  }

  // ── Public API for UIScene ──────────────────────────────────────────────

  getCatSelected(): boolean { return this.catSelected; }
  getFishCount(): number { return this.resources.fishCount; }

  selectCat(selected: boolean): void {
    this.catSelected = selected;
    if (!selected && this.hoverCell) this.hoverCell.setVisible(false);
  }

  // ── Drawing ─────────────────────────────────────────────────────────────

  private drawBackground(): void {
    // Sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x5da87e, 0x5da87e, 1);
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.setDepth(0);

    // Sidebar background
    bg.fillStyle(0x4a3728, 0.9);
    bg.fillRect(0, 0, GRID_ORIGIN_X - 5, CANVAS_HEIGHT);

    // Bottom dirt strip
    bg.fillStyle(0x6b4226);
    bg.fillRect(0, GRID_ORIGIN_Y + GRID_ROWS * CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  private drawGrid(): void {
    const g = this.add.graphics();
    g.setDepth(1);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = GRID_ORIGIN_X + col * CELL_SIZE;
        const y = GRID_ORIGIN_Y + row * CELL_SIZE;

        // Alternating cell shading
        const shade = (row + col) % 2 === 0 ? 0x6aad50 : 0x5d9e45;
        g.fillStyle(shade, 1);
        g.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        g.lineStyle(1, 0x3d7a2a, 0.5);
        g.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    // Danger line on left edge of grid
    const g2 = this.add.graphics();
    g2.setDepth(2);
    g2.lineStyle(3, 0xff3333, 0.8);
    g2.lineBetween(GRID_ORIGIN_X, GRID_ORIGIN_Y, GRID_ORIGIN_X, GRID_ORIGIN_Y + GRID_ROWS * CELL_SIZE);
  }

  private setupHover(): void {
    this.hoverCell = this.add.image(0, 0, TEX.CELL_HOVER).setVisible(false).setDepth(2).setOrigin(0, 0);
  }

  // ── Input ────────────────────────────────────────────────────────────────

  private setupInput(): void {
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (!this.catSelected || !this.gameActive) {
        this.hoverCell?.setVisible(false);
        return;
      }
      const cell = this.grid.worldToGrid(ptr.x, ptr.y);
      if (cell && this.grid.canPlace(cell.col, cell.row)) {
        const px = GRID_ORIGIN_X + cell.col * CELL_SIZE;
        const py = GRID_ORIGIN_Y + cell.row * CELL_SIZE;
        this.hoverCell?.setPosition(px, py).setVisible(true);
      } else {
        this.hoverCell?.setVisible(false);
      }
    });

    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (!this.gameActive) return;
      this.tryPlaceCat(ptr.x, ptr.y);
    });
  }

  private tryPlaceCat(worldX: number, worldY: number): void {
    if (!this.catSelected) return;
    const cell = this.grid.worldToGrid(worldX, worldY);
    if (!cell) return;
    if (!this.grid.canPlace(cell.col, cell.row)) return;
    if (!this.resources.canAfford(CAT_COST)) return;

    const pos = this.grid.gridToWorld(cell.col, cell.row);
    const cat = new Cat(this, pos.x, pos.y, cell.col, cell.row);
    this.grid.place(cell.col, cell.row, cat);
    this.cats.push(cat);
    this.resources.spend(CAT_COST);
    this.events.emit(EVT.CAT_PLACED, this.resources.fishCount);
    this.hoverCell?.setVisible(false);
  }

  // ── Update helpers ────────────────────────────────────────────────────────

  private updateZombies(delta: number): void {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      z.update(delta);

      if (z.hasReachedHome()) {
        this.triggerGameOver();
        return;
      }

      if (z.isDead()) {
        z.destroy();
        this.zombies.splice(i, 1);
      }
    }
  }

  private updateCats(delta: number): void {
    for (let i = this.cats.length - 1; i >= 0; i--) {
      const cat = this.cats[i];
      const zombieInLane = this.zombies.some(z => z.row === cat.gridRow);
      cat.update(delta, this.projectiles, zombieInLane);

      if (cat.isDead()) {
        this.grid.remove(cat.gridCol, cat.gridRow);
        cat.destroy();
        this.cats.splice(i, 1);
      }
    }
  }

  private updateProjectiles(delta: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(delta);
      if (p.isOffscreen()) {
        p.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private checkCollisions(): void {
    for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
      const p = this.projectiles[pi];
      // Find the cat that fired this projectile (same row)
      // Projectiles travel rightward so they hit zombies to the right
      for (let zi = this.zombies.length - 1; zi >= 0; zi--) {
        const z = this.zombies[zi];
        // Rough row-based lane check using Y position
        const sameLane = Math.abs(p.y - z.y) < CELL_SIZE * 0.6;
        const hit = sameLane && Math.abs(p.x - z.x) < CELL_SIZE * 0.5;
        if (hit) {
          z.takeDamage(p.damage);
          p.destroy();
          this.projectiles.splice(pi, 1);
          break;
        }
      }
    }

    // Zombie-cat blocking: when a zombie reaches a cat's column, stop and attack
    for (const z of this.zombies) {
      const catsInRow = this.grid.getCatsInRow(z.row);
      for (const cat of catsInRow) {
        const catX = this.grid.gridToWorld(cat.gridCol, cat.gridRow).x;
        if (z.x <= catX + CELL_SIZE * 0.5 && z.x >= catX - CELL_SIZE * 0.1) {
          z.blockOnCat(cat);
          break;
        }
      }
    }
  }

  // ── Events ────────────────────────────────────────────────────────────────

  private setupEvents(): void {
    this.events.on(EVT.SELECT_CAT, (selected: boolean) => {
      this.selectCat(selected);
    });
  }

  private triggerGameOver(): void {
    if (!this.gameActive) return;
    this.gameActive = false;
    this.events.emit(EVT.GAME_OVER);
    // Screen shake
    this.cameras.main.shake(500, 0.015);
  }

  // ── Public getters for UIScene ────────────────────────────────────────────

  getCurrentWave(): number { return this.waves.waveNumber; }
  getTotalWaves(): number { return TOTAL_WAVES; }
}
