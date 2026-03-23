import Phaser from 'phaser';
import { TEX, PROJECTILE_SPEED, CAT_PROJECTILE_DAMAGE } from '../constants';

export class Projectile extends Phaser.GameObjects.Image {
  readonly damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.PROJECTILE);
    scene.add.existing(this);
    this.setDepth(5);
    this.damage = CAT_PROJECTILE_DAMAGE;
  }

  update(delta: number): void {
    this.x += (PROJECTILE_SPEED * delta) / 1000;
  }

  isOffscreen(): boolean {
    return this.x > this.scene.scale.width + 50;
  }
}
