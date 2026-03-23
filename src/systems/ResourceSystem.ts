import Phaser from 'phaser';
import {
  FISH_STARTING_AMOUNT, FISH_SPAWN_INTERVAL,
  GRID_ROWS, GRID_ORIGIN_X, GRID_ORIGIN_Y, CELL_SIZE,
  EVT,
} from '../constants';
import { Fish } from '../entities/Fish';

export class ResourceSystem {
  private scene: Phaser.Scene;
  private fish: number;
  private drops: Fish[] = [];
  private spawnTimer: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.fish = FISH_STARTING_AMOUNT;
  }

  get fishCount(): number {
    return this.fish;
  }

  canAfford(cost: number): boolean {
    return this.fish >= cost;
  }

  spend(amount: number): void {
    this.fish = Math.max(0, this.fish - amount);
    this.scene.events.emit(EVT.FISH_SPENT, this.fish);
  }

  collect(amount: number): void {
    this.fish += amount;
    this.scene.events.emit(EVT.FISH_COLLECTED, this.fish);
  }

  update(delta: number): void {
    this.spawnTimer += delta;
    if (this.spawnTimer >= FISH_SPAWN_INTERVAL) {
      this.spawnTimer = 0;
      this.spawnFishDrop();
    }

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      if (drop.collected) {
        this.drops.splice(i, 1);
        continue;
      }
      const expired = drop.update(delta);
      if (expired) {
        drop.destroy();
        this.drops.splice(i, 1);
      }
    }
  }

  private spawnFishDrop(): void {
    const row = Phaser.Math.Between(0, GRID_ROWS - 1);
    const col = Phaser.Math.Between(0, 3);
    const x = GRID_ORIGIN_X + col * CELL_SIZE + CELL_SIZE / 2;
    const y = GRID_ORIGIN_Y + row * CELL_SIZE + CELL_SIZE / 2;

    const drop = new Fish(this.scene, x, y);
    drop.on('pointerdown', () => {
      if (!drop.collected) {
        drop.collect();
        this.collect(drop.value);
      }
    });
    this.drops.push(drop);
  }
}
