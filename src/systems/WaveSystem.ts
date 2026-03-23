import Phaser from 'phaser';
import {
  WAVE_CONFIGS, TOTAL_WAVES,
  GRID_ROWS, GRID_ORIGIN_Y, CELL_SIZE,
  CANVAS_WIDTH, EVT,
} from '../constants';
import { Zombie } from '../entities/Zombie';

type WaveState = 'waiting' | 'spawning' | 'clearing' | 'done';

export class WaveSystem {
  private scene: Phaser.Scene;
  private zombies: Zombie[];
  private currentWave: number = 0;
  private state: WaveState = 'waiting';
  private stateTimer: number = 0;
  private spawnTimer: number = 0;
  private zombiesLeftToSpawn: number = 0;

  constructor(scene: Phaser.Scene, zombies: Zombie[]) {
    this.scene = scene;
    this.zombies = zombies;
  }

  get waveNumber(): number {
    return this.currentWave;
  }

  get isDone(): boolean {
    return this.state === 'done';
  }

  update(delta: number): void {
    switch (this.state) {
      case 'waiting':
        this.stateTimer += delta;
        const delay = this.currentWave === 0
          ? WAVE_CONFIGS[0].delayBefore
          : WAVE_CONFIGS[this.currentWave].delayBefore;
        if (this.stateTimer >= delay) {
          this.startWave();
        }
        break;

      case 'spawning':
        this.spawnTimer += delta;
        const cfg = WAVE_CONFIGS[this.currentWave - 1];
        if (this.spawnTimer >= cfg.spawnInterval && this.zombiesLeftToSpawn > 0) {
          this.spawnTimer = 0;
          this.spawnZombie();
          this.zombiesLeftToSpawn--;
          if (this.zombiesLeftToSpawn === 0) {
            this.state = 'clearing';
          }
        }
        break;

      case 'clearing':
        // Wait for all zombies from this wave to die
        if (this.zombies.length === 0) {
          this.scene.events.emit(EVT.WAVE_COMPLETE, this.currentWave);
          if (this.currentWave >= TOTAL_WAVES) {
            this.state = 'done';
            this.scene.events.emit(EVT.ALL_WAVES_COMPLETE);
          } else {
            this.state = 'waiting';
            this.stateTimer = 0;
          }
        }
        break;

      case 'done':
        break;
    }
  }

  private startWave(): void {
    this.currentWave++;
    this.state = 'spawning';
    this.spawnTimer = 0;
    this.zombiesLeftToSpawn = WAVE_CONFIGS[this.currentWave - 1].zombieCount;
    // Spawn first zombie immediately
    this.spawnZombie();
    this.zombiesLeftToSpawn--;
    if (this.zombiesLeftToSpawn === 0) {
      this.state = 'clearing';
    }
    this.scene.events.emit(EVT.WAVE_START, this.currentWave);
  }

  private spawnZombie(): void {
    const row = Phaser.Math.Between(0, GRID_ROWS - 1);
    const y = GRID_ORIGIN_Y + row * CELL_SIZE + CELL_SIZE / 2;
    const zombie = new Zombie(this.scene, CANVAS_WIDTH + CELL_SIZE / 2, y, row);
    this.zombies.push(zombie);
  }
}
