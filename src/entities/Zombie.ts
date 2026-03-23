import Phaser from 'phaser';
import { TEX, ZOMBIE_HP, ZOMBIE_SPEED, ZOMBIE_MELEE_DPS, CELL_SIZE, GRID_ORIGIN_X } from '../constants';
import type { Cat } from './Cat';

export class Zombie extends Phaser.GameObjects.Container {
  readonly row: number;
  private hp: number;
  private maxHp: number;
  private blocked: boolean = false;
  private targetCat: Cat | null = null;
  private hpBar: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, row: number) {
    super(scene, x, y);
    this.row = row;
    this.hp = ZOMBIE_HP;
    this.maxHp = ZOMBIE_HP;

    this.sprite = scene.add.image(0, 0, TEX.ZOMBIE).setDisplaySize(CELL_SIZE - 10, CELL_SIZE - 10);
    this.hpBar = scene.add.graphics();

    this.add([this.sprite, this.hpBar]);
    scene.add.existing(this);
    this.setDepth(4);
    this.drawHpBar();
  }

  update(delta: number): void {
    if (this.blocked && this.targetCat) {
      if (this.targetCat.isDead()) {
        this.blocked = false;
        this.targetCat = null;
      } else {
        // Deal melee damage
        this.targetCat.takeDamage((ZOMBIE_MELEE_DPS * delta) / 1000);
      }
    } else {
      this.x -= (ZOMBIE_SPEED * delta) / 1000;
      // Gentle bobbing walk
      this.sprite.y = Math.sin(this.x * 0.05) * 3;
    }
  }

  blockOnCat(cat: Cat): void {
    this.blocked = true;
    this.targetCat = cat;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    this.drawHpBar();
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  /** Returns true if this zombie has crossed the home boundary */
  hasReachedHome(): boolean {
    return this.x < GRID_ORIGIN_X - CELL_SIZE;
  }

  private drawHpBar(): void {
    this.hpBar.clear();
    const bw = CELL_SIZE - 20;
    const bh = 7;
    const bx = -bw / 2;
    const by = CELL_SIZE / 2 - 14;
    const pct = this.hp / this.maxHp;

    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(bx, by, bw, bh);

    const color = pct > 0.5 ? 0x44cc44 : pct > 0.25 ? 0xffcc00 : 0xff3333;
    this.hpBar.fillStyle(color);
    this.hpBar.fillRect(bx, by, Math.round(bw * pct), bh);
  }
}
