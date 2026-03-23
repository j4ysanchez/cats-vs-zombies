import Phaser from 'phaser';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  GRID_ORIGIN_X, SIDEBAR_WIDTH,
  CAT_COST, TEX, EVT, TOTAL_WAVES,
} from '../constants';
import type { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private fishText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private catCardBg!: Phaser.GameObjects.Graphics;
  private catCardSelected: boolean = false;
  private waveBanner!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;
  }

  create(): void {
    this.drawHUD();
    this.drawCatCard();
    this.setupListeners();
  }

  // ── HUD ───────────────────────────────────────────────────────────────────

  private drawHUD(): void {
    // Top bar background
    const topBar = this.add.graphics();
    topBar.fillStyle(0x1a1a1a, 0.75);
    topBar.fillRect(GRID_ORIGIN_X, 0, CANVAS_WIDTH - GRID_ORIGIN_X, 55);

    // Fish icon (small emoji-style text) and count
    this.add.text(GRID_ORIGIN_X + 12, 10, '🐟', { fontSize: '28px' });
    this.fishText = this.add.text(GRID_ORIGIN_X + 50, 14, `${this.gameScene.getFishCount()}`, {
      fontSize: '22px',
      color: '#ffe066',
      fontStyle: 'bold',
    });

    // Wave counter (right side)
    this.waveText = this.add.text(CANVAS_WIDTH - 16, 14, `Wave 0 / ${TOTAL_WAVES}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    // Wave banner (center, fades in/out)
    this.waveBanner = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, '', {
      fontSize: '42px',
      color: '#ffdd44',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
  }

  private drawCatCard(): void {
    const cx = SIDEBAR_WIDTH / 2;
    const cardY = 200;
    const cardW = 120;
    const cardH = 140;

    this.catCardBg = this.add.graphics();
    this.renderCatCard(false);

    // Cat sprite on card
    this.add.image(cx, cardY - 20, TEX.CAT)
      .setDisplaySize(80, 80)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.toggleCatCard())
      .on('pointerover', () => {
        if (!this.catCardSelected) this.catCardBg.setAlpha(0.9);
      })
      .on('pointerout', () => {
        if (!this.catCardSelected) this.catCardBg.setAlpha(1);
      });

    // Cost label
    this.add.text(cx, cardY + 48, `🐟 ${CAT_COST}`, {
      fontSize: '16px',
      color: '#ffe066',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // "Cat" label
    this.add.text(cx, cardY + 68, 'Shooter Cat', {
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Sidebar title
    this.add.text(cx, 50, 'CATS', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 72, 'Select a cat\nthen click\nthe lawn', {
      fontSize: '11px',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);

    // Ignore card area — transparent hitbox so fish drops behind can still be clicked
    void cardW; void cardH;
  }

  private renderCatCard(selected: boolean): void {
    const cx = SIDEBAR_WIDTH / 2;
    const cardY = 200;
    const cardW = 120;
    const cardH = 140;

    this.catCardBg.clear();
    const affordable = this.gameScene.getFishCount() >= CAT_COST;

    if (selected) {
      this.catCardBg.lineStyle(3, 0xffdd44);
      this.catCardBg.fillStyle(0x5a8a2a, 0.95);
    } else if (!affordable) {
      this.catCardBg.lineStyle(2, 0x555555);
      this.catCardBg.fillStyle(0x333333, 0.85);
    } else {
      this.catCardBg.lineStyle(2, 0x88cc44);
      this.catCardBg.fillStyle(0x2a4a1a, 0.9);
    }
    this.catCardBg.fillRoundedRect(cx - cardW / 2, cardY - 80, cardW, cardH, 10);
    this.catCardBg.strokeRoundedRect(cx - cardW / 2, cardY - 80, cardW, cardH, 10);
  }

  private toggleCatCard(): void {
    const affordable = this.gameScene.getFishCount() >= CAT_COST;
    if (!affordable && !this.catCardSelected) return;

    this.catCardSelected = !this.catCardSelected;
    this.renderCatCard(this.catCardSelected);
    this.gameScene.events.emit(EVT.SELECT_CAT, this.catCardSelected);
  }

  // ── Event listeners ────────────────────────────────────────────────────────

  private setupListeners(): void {
    const gs = this.gameScene;

    gs.events.on(EVT.FISH_COLLECTED, (count: number) => {
      this.fishText.setText(String(count));
      this.renderCatCard(this.catCardSelected);
    });

    gs.events.on(EVT.FISH_SPENT, (count: number) => {
      this.fishText.setText(String(count));
      this.renderCatCard(this.catCardSelected);
    });

    gs.events.on(EVT.CAT_PLACED, (count: number) => {
      this.fishText.setText(String(count));
      this.catCardSelected = false;
      this.renderCatCard(false);
    });

    gs.events.on(EVT.WAVE_START, (wave: number) => {
      this.waveText.setText(`Wave ${wave} / ${TOTAL_WAVES}`);
      this.showBanner(`Wave ${wave}!`);
    });

    gs.events.on(EVT.ALL_WAVES_COMPLETE, () => {
      this.showEndScreen(true);
    });

    gs.events.on(EVT.GAME_OVER, () => {
      this.showEndScreen(false);
    });
  }

  // ── Overlays ───────────────────────────────────────────────────────────────

  private showBanner(text: string): void {
    this.waveBanner.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.waveBanner,
      alpha: 0,
      delay: 1500,
      duration: 600,
    });
  }

  private showEndScreen(win: boolean): void {
    // Dim overlay
    const overlay = this.add.graphics().setDepth(30);
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    if (win) {
      this.add.text(cx, cy - 80, '🎉 You Win! 🎉', {
        fontSize: '56px',
        color: '#ffdd44',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      }).setOrigin(0.5).setDepth(31);

      this.add.text(cx, cy - 10, 'All waves survived!\nYour cats defended the home!', {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5).setDepth(31);
    } else {
      this.add.text(cx, cy - 80, '💀 Game Over 💀', {
        fontSize: '56px',
        color: '#ff4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      }).setOrigin(0.5).setDepth(31);

      this.add.text(cx, cy - 10, 'The zombies broke through!', {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5).setDepth(31);
    }

    // Restart button
    const btnBg = this.add.graphics().setDepth(31);
    btnBg.fillStyle(0x4a8a2a);
    btnBg.fillRoundedRect(cx - 100, cy + 60, 200, 50, 10);
    btnBg.lineStyle(2, 0x88cc44);
    btnBg.strokeRoundedRect(cx - 100, cy + 60, 200, 50, 10);

    const btnText = this.add.text(cx, cy + 85, 'Play Again', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(32).setInteractive({ cursor: 'pointer' });

    btnText.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });

    btnText.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x6ab83a);
      btnBg.fillRoundedRect(cx - 100, cy + 60, 200, 50, 10);
    });

    btnText.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x4a8a2a);
      btnBg.fillRoundedRect(cx - 100, cy + 60, 200, 50, 10);
    });
  }
}
