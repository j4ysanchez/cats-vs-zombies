// Canvas
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

// Grid
export const GRID_COLS = 9;
export const GRID_ROWS = 5;
export const CELL_SIZE = 110;
export const GRID_ORIGIN_X = 180;
export const GRID_ORIGIN_Y = 65;

// UI sidebar
export const SIDEBAR_WIDTH = 170;

// Cat
export const CAT_COST = 100;
export const CAT_HP = 200;
export const CAT_ATTACK_INTERVAL = 1500; // ms
export const CAT_PROJECTILE_DAMAGE = 25;

// Zombie
export const ZOMBIE_HP = 100;
export const ZOMBIE_SPEED = 40; // px/s
export const ZOMBIE_MELEE_DPS = 15; // damage per second

// Projectile
export const PROJECTILE_SPEED = 400; // px/s

// Fish
export const FISH_VALUE = 25;
export const FISH_LIFESPAN = 8000; // ms
export const FISH_SPAWN_INTERVAL = 4000; // ms
export const FISH_STARTING_AMOUNT = 150;

// Waves
export const TOTAL_WAVES = 5;
export const WAVE_CONFIGS: WaveConfig[] = [
  { zombieCount: 3, spawnInterval: 4000, delayBefore: 5000 },
  { zombieCount: 5, spawnInterval: 3500, delayBefore: 10000 },
  { zombieCount: 7, spawnInterval: 3000, delayBefore: 10000 },
  { zombieCount: 9, spawnInterval: 2500, delayBefore: 10000 },
  { zombieCount: 12, spawnInterval: 2000, delayBefore: 10000 },
];

export interface WaveConfig {
  zombieCount: number;
  spawnInterval: number;
  delayBefore: number;
}

// Texture keys
export const TEX = {
  CAT: 'cat',
  ZOMBIE: 'zombie',
  PROJECTILE: 'projectile',
  FISH: 'fish',
  CELL_HOVER: 'cell_hover',
  CELL_OCCUPIED: 'cell_occupied',
} as const;

// Event names (emitted on scene's event emitter)
export const EVT = {
  FISH_COLLECTED: 'fish-collected',
  FISH_SPENT: 'fish-spent',
  CAT_PLACED: 'cat-placed',
  WAVE_START: 'wave-start',
  WAVE_COMPLETE: 'wave-complete',
  ALL_WAVES_COMPLETE: 'all-waves-complete',
  GAME_OVER: 'game-over',
  SELECT_CAT: 'select-cat',
} as const;
