import Phaser from 'phaser';
import { TEX, CELL_SIZE } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.makeCatTexture();
    this.makeZombieTexture();
    this.makeProjectileTexture();
    this.makeFishTexture();
    this.makeCellHoverTexture();

    this.scene.start('GameScene');
  }

  private makeCatTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = 80;
    const h = 80;

    // Body
    g.fillStyle(0xe8873a);
    g.fillRoundedRect(10, 20, w, h, 12);

    // Ears
    g.fillStyle(0xe8873a);
    g.fillTriangle(15, 22, 30, 22, 22, 4);   // left ear
    g.fillTriangle(60, 22, 75, 22, 68, 4);   // right ear

    // Inner ears
    g.fillStyle(0xf5b8a0);
    g.fillTriangle(18, 20, 28, 20, 23, 8);
    g.fillTriangle(62, 20, 72, 20, 67, 8);

    // Eyes
    g.fillStyle(0x222222);
    g.fillCircle(30, 42, 6);
    g.fillCircle(60, 42, 6);

    // Eye shine
    g.fillStyle(0xffffff);
    g.fillCircle(32, 40, 2);
    g.fillCircle(62, 40, 2);

    // Nose
    g.fillStyle(0xff9999);
    g.fillTriangle(43, 55, 47, 55, 45, 58);

    // Mouth
    g.lineStyle(1.5, 0x222222);
    g.strokeCircle(41, 60, 4);
    g.strokeCircle(49, 60, 4);

    // Whiskers
    g.lineStyle(1, 0x888888);
    g.lineBetween(10, 55, 38, 58);
    g.lineBetween(10, 62, 38, 60);
    g.lineBetween(52, 58, 80, 55);
    g.lineBetween(52, 60, 80, 62);

    g.generateTexture(TEX.CAT, CELL_SIZE, CELL_SIZE);
    g.destroy();
  }

  private makeZombieTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Body
    g.fillStyle(0x5a9a5a);
    g.fillRect(15, 20, 60, 70);

    // Head
    g.fillStyle(0x6ab86a);
    g.fillRect(20, 0, 50, 50);

    // Eyes (X eyes)
    g.lineStyle(3, 0x222222);
    g.lineBetween(28, 14, 36, 22);
    g.lineBetween(36, 14, 28, 22);
    g.lineBetween(53, 14, 61, 22);
    g.lineBetween(61, 14, 53, 22);

    // Mouth (jagged)
    g.lineStyle(2, 0x222222);
    g.lineBetween(30, 36, 35, 40);
    g.lineBetween(35, 40, 40, 34);
    g.lineBetween(40, 34, 45, 40);
    g.lineBetween(45, 40, 50, 34);
    g.lineBetween(50, 34, 55, 40);
    g.lineBetween(55, 40, 60, 36);

    // Outstretched arms
    g.fillStyle(0x5a9a5a);
    g.fillRect(0, 30, 15, 12);   // left arm
    g.fillRect(75, 30, 15, 12);  // right arm

    // Legs
    g.fillRect(18, 88, 22, 22);
    g.fillRect(48, 88, 22, 22);

    g.generateTexture(TEX.ZOMBIE, CELL_SIZE, CELL_SIZE);
    g.destroy();
  }

  private makeProjectileTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Hairball — fluffy yellow-grey circle
    g.fillStyle(0xd4c547);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0xb8aa3a);
    g.fillCircle(12, 12, 5);
    g.fillCircle(20, 10, 4);
    g.fillCircle(22, 18, 5);
    g.fillCircle(10, 20, 4);

    g.generateTexture(TEX.PROJECTILE, 32, 32);
    g.destroy();
  }

  private makeFishTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Body
    g.fillStyle(0x7ec8e3);
    g.fillEllipse(28, 20, 40, 24);

    // Tail
    g.fillStyle(0x5aafc9);
    g.fillTriangle(46, 10, 58, 20, 46, 30);

    // Scale shine
    g.fillStyle(0xaee8f5, 0.6);
    g.fillCircle(22, 17, 5);

    // Eye
    g.fillStyle(0x222222);
    g.fillCircle(14, 18, 3);
    g.fillStyle(0xffffff);
    g.fillCircle(15, 17, 1);

    g.generateTexture(TEX.FISH, 60, 40);
    g.destroy();
  }

  private makeCellHoverTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(3, 0xffffff, 0.6);
    g.strokeRect(2, 2, CELL_SIZE - 4, CELL_SIZE - 4);
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(2, 2, CELL_SIZE - 4, CELL_SIZE - 4);
    g.generateTexture(TEX.CELL_HOVER, CELL_SIZE, CELL_SIZE);
    g.destroy();
  }
}
