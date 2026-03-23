import Phaser from 'phaser';
import { TEX, FISH_VALUE, FISH_LIFESPAN } from '../constants';

export class Fish extends Phaser.GameObjects.Container {
  readonly value: number = FISH_VALUE;
  private age: number = 0;
  private sprite: Phaser.GameObjects.Image;
  private _collected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y - 40);
    this.sprite = scene.add.image(0, 0, TEX.FISH);
    this.add(this.sprite);
    scene.add.existing(this);
    this.setDepth(6);
    this.setSize(60, 40);
    this.setInteractive();

    // Drop tween
    scene.tweens.add({
      targets: this,
      y: y,
      duration: 400,
      ease: 'Bounce.Out',
    });

    // Gentle float
    scene.tweens.add({
      targets: this.sprite,
      y: 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  update(delta: number): boolean {
    this.age += delta;
    // Fade out in last 2 seconds
    const remaining = FISH_LIFESPAN - this.age;
    if (remaining < 2000) {
      this.setAlpha(Math.max(0, remaining / 2000));
    }
    return this.age >= FISH_LIFESPAN;
  }

  collect(): void {
    this._collected = true;
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 250,
      onComplete: () => this.destroy(),
    });
  }

  get collected(): boolean {
    return this._collected;
  }
}
