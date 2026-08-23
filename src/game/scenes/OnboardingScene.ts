import Phaser from 'phaser';
import { t, type CopyKey } from '../../i18n';
import { getPlatformLocale, markGameReady } from '../../platform/yandex';
import type { Locale } from '../../domain/types';
import { preloadArt } from '../art';
import { GameStore } from '../store';
import { button } from '../ui';

interface OnboardingPage {
  title: CopyKey;
  body: CopyKey;
}

const PAGES: OnboardingPage[] = [
  { title: 'onboardingAuctionTitle', body: 'onboardingAuctionBody' },
  { title: 'onboardingFindsTitle', body: 'onboardingFindsBody' },
  { title: 'onboardingProgressTitle', body: 'onboardingProgressBody' },
];

export class OnboardingScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';
  private pageIndex = 0;

  constructor() {
    super('onboarding');
  }

  preload(): void {
    preloadArt(this);
  }

  create(): void {
    this.locale = getPlatformLocale();
    if (this.store.snapshot.onboardingComplete) {
      this.scene.start('auction');
      return;
    }

    this.pageIndex = 0;
    this.renderPage();
    markGameReady();
  }

  private renderPage(): void {
    const page = PAGES[this.pageIndex] ?? PAGES[0]!;
    this.children.removeAll(true);
    this.add.rectangle(640, 360, 1280, 720, 0x101216);
    this.add.rectangle(640, 360, 890, 500, 0x15181e).setStrokeStyle(1, 0xffffff, 0.1);

    this.centerLabel(640, 165, t(this.locale, 'title'), 25, '#e9b949', 'bold');
    this.centerLabel(640, 235, t(this.locale, page.title), 36, '#f7f8fa', 'bold');
    this.add.text(640, 310, t(this.locale, page.body), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#c8cdd5',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: 690 },
    }).setOrigin(0.5, 0);

    PAGES.forEach((_, index) => {
      this.add.circle(610 + index * 30, 495, 5, index === this.pageIndex ? 0xe9b949 : 0x3a4049);
    });

    const finalPage = this.pageIndex === PAGES.length - 1;
    button(this, 640, 565, finalPage ? t(this.locale, 'onboardingStart') : t(this.locale, 'onboardingNext'), () => {
      if (finalPage) {
        this.store.completeOnboarding();
        this.scene.start('auction');
        return;
      }

      this.pageIndex += 1;
      this.renderPage();
    }, { width: 280, height: 60 });
  }

  private centerLabel(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: style,
      color,
      align: 'center',
    }).setOrigin(0.5);
  }
}
