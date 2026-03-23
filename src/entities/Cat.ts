import Phaser from 'phaser';
import {
  TEX, CAT_HP, CAT_ATTACK_INTERVAL, CELL_SIZE,
} from '../constants';
import { Projectile } from './Projectile';

export class Cat extends Phaser.GameObjects.Container {
  readonly gridCol: number;
  readonly gridRow: number;
  private hp: number;
  private maxHp: number;
  private attackTimer: number = 0;
  private hpBar: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, col: number, row: number) {
    super(scene, x, y);
    this.gridCol = col;
    this.gridRow = row;
    this.hp = CAT_HP;
    this.maxHp = CAT_HP;

    this.sprite = scene.add.image(0, 0, TEX.CAT).setDisplaySize(CELL_SIZE - 10, CELL_SIZE - 10);
    this.hpBar = scene.add.graphics();

    this.add([this.sprite, this.hpBar]);
    scene.add.existing(this);
    this.setDepth(3);
    this.drawHpBar();
  }

  update(delta: number, projectiles: Projectile[], zombieInLane: boolean): void {
    if (!zombieInLane) return;

    this.attackTimer += delta;
    if (this.attackTimer >= CAT_ATTACK_INTERVAL) {
      this.attackTimer = 0;
      this.shoot(projectiles);
    }
  }

  private shoot(projectiles: Projectile[]): void {
    const p = new Projectile(this.scene, this.x + CELL_SIZE / 2, this.y);
    projectiles.push(p);

    // Little punch animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.15,
      scaleY: 0.9,
      duration: 80,
      yoyo: true,
    });
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    this.drawHpBar();

    // Flash red
    this.scene.tweens.add({
      targets: this.sprite,
      tint: { from: 0xff4444, to: 0xffffff } as unknown as number,
      duration: 150,
    });
  }

  isDead(): boolean {
    return this.hp <= 0;
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
