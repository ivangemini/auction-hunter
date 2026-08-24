import Phaser from 'phaser';
import { LOTS } from '../../data/catalog';
import { COLLECTION_SETS } from '../../data/collections';
import { localDayKey } from '../../data/daily';
import { LOT_MODIFIERS } from '../../data/lotModifiers';
import {
  ACHIEVEMENTS,
  BUSINESS_UPGRADE_ORDER,
  BUSINESS_UPGRADES,
  dailyContractsForDay,
} from '../../data/meta';
import {
  achievementMetricValue,
  contractRewardValue,
  nextUpgradeCost,
} from '../../domain/meta';
import type { Locale } from '../../domain/types';
import { t } from '../../i18n';
import { getPlatformLocale } from '../../platform/yandex';
import {
  applyAccessibilityPreferences,
  loadAccessibilityPreferences,
  setAccessibilityPreference,
  type AccessibilityPreferenceKey,
} from '../preferences';
import { GameStore } from '../store';
import { button } from '../ui';

type OfficeTab = 'contracts' | 'upgrades' | 'achievements' | 'stats' | 'history' | 'settings';

const WIDTH = 1280;
const HEIGHT = 720;
const HISTORY_PAGE_SIZE = 5;

export class OfficeScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';
  private tab: OfficeTab = 'contracts';
  private historyPage = 0;

  constructor() {
    super('office');
  }

  create(): void {
    this.locale = getPlatformLocale();
    this.store.prepareDailyContracts();
    applyAccessibilityPreferences();
    this.render();
  }

  private render(): void {
    this.children.removeAll(true);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x101216);
    this.add.rectangle(1060, HEIGHT / 2, 440, HEIGHT, 0xe9b949, 0.018);
    this.add.rectangle(WIDTH / 2, 116, WIDTH - 120, 1, 0x2b3038);

    const save = this.store.snapshot;
    this.label(70, 40, t(this.locale, 'office'), 30, '#f7f8fa', 'bold');
    this.label(70, 78, t(this.locale, 'officeSubtitle'), 15, '#737b88');
    this.label(760, 44, `${t(this.locale, 'cash')}: ${this.money(save.cash)}`, 18, '#63d28d', 'bold');
    this.label(940, 44, `${t(this.locale, 'reputation')}: ${Math.floor(save.reputationXp)} REP`, 18, '#61a8ff', 'bold');

    button(this, 1110, 72, t(this.locale, 'backToCollection'), () => this.scene.start('collection'), {
      width: 220,
      height: 46,
      background: 0x61a8ff,
    });

    this.renderTabs();
    this.add.rectangle(640, 445, 1140, 470, 0x15181e, 1).setStrokeStyle(1, 0xffffff, 0.08);

    switch (this.tab) {
      case 'contracts': this.renderContracts(); break;
      case 'upgrades': this.renderUpgrades(); break;
      case 'achievements': this.renderAchievements(); break;
      case 'stats': this.renderStats(); break;
      case 'history': this.renderHistory(); break;
      case 'settings': this.renderSettings(); break;
    }
  }

  private renderTabs(): void {
    const tabs: Array<{ id: OfficeTab; key: 'contracts' | 'upgrades' | 'achievements' | 'stats' | 'history' | 'settings' }> = [
      { id: 'contracts', key: 'contracts' },
      { id: 'upgrades', key: 'upgrades' },
      { id: 'achievements', key: 'achievements' },
      { id: 'stats', key: 'stats' },
      { id: 'history', key: 'history' },
      { id: 'settings', key: 'settings' },
    ];

    tabs.forEach((tab, index) => {
      const selected = this.tab === tab.id;
      button(this, 145 + index * 198, 151, t(this.locale, tab.key), () => {
        this.tab = tab.id;
        this.render();
      }, {
        width: 178,
        height: 44,
        background: selected ? 0xe9b949 : 0x2c313a,
        hitSlop: 8,
      });
    });
  }

  private renderContracts(): void {
    const save = this.store.snapshot;
    const dayKey = save.contractDayKey ?? localDayKey();
    const contracts = dailyContractsForDay(dayKey);
    const rewardLevel = save.businessUpgrades.contractsDesk;

    this.label(100, 225, t(this.locale, 'dailyContracts'), 24, '#f7f8fa', 'bold');
    this.label(100, 258, t(this.locale, 'contractsResetDaily'), 14, '#737b88');

    contracts.forEach((contract, index) => {
      const x = 100 + index * 370;
      const y = 300;
      const progress = Math.min(contract.target, save.contractProgress[contract.id] ?? 0);
      const complete = progress >= contract.target;
      const claimed = save.claimedContractRewards.includes(contract.id);
      const reward = contractRewardValue(contract.reward, rewardLevel);

      this.add.rectangle(x, y, 340, 285, 0x1a1e25, 1).setOrigin(0).setStrokeStyle(1, complete ? 0x63d28d : 0xffffff, complete ? 0.45 : 0.08);
      this.label(x + 22, y + 20, contract.title[this.locale], 21, '#f7f8fa', 'bold').setWordWrapWidth(296);
      this.label(x + 22, y + 58, contract.description[this.locale], 15, '#aeb5c0').setWordWrapWidth(296).setLineSpacing(3);

      this.label(x + 22, y + 125, `${t(this.locale, 'progress')}: ${Math.floor(progress)}/${contract.target}`, 15, complete ? '#63d28d' : '#d7dbe2', 'bold');
      const ratio = contract.target > 0 ? Phaser.Math.Clamp(progress / contract.target, 0, 1) : 0;
      this.add.rectangle(x + 22, y + 158, 296, 10, 0x2b3038).setOrigin(0, 0.5);
      this.add.rectangle(x + 22, y + 158, 296 * ratio, 10, complete ? 0x63d28d : 0xe9b949).setOrigin(0, 0.5);
      this.label(x + 22, y + 180, t(this.locale, 'cashReward', { amount: this.money(reward) }), 16, '#e9b949', 'bold');

      if (claimed) {
        this.centerLabel(x + 170, y + 244, t(this.locale, 'claimed'), 16, '#63d28d', 'bold');
      } else {
        button(this, x + 170, y + 244, t(this.locale, 'claimReward'), () => {
          this.store.claimDailyContractReward(contract.id);
          this.render();
        }, { width: 220, height: 48, disabled: !complete });
      }
    });
  }

  private renderUpgrades(): void {
    const save = this.store.snapshot;
    this.label(100, 225, t(this.locale, 'businessUpgrades'), 24, '#f7f8fa', 'bold');
    this.label(100, 258, t(this.locale, 'officeHint'), 14, '#737b88');

    BUSINESS_UPGRADE_ORDER.forEach((id, index) => {
      const definition = BUSINESS_UPGRADES[id];
      const level = save.businessUpgrades[id];
      const cost = nextUpgradeCost(definition.costs, level);
      const effect = definition.effects[Math.min(level, definition.effects.length - 1)] ?? definition.effects[0]!;
      const x = 100 + index * 370;
      const y = 300;

      this.add.rectangle(x, y, 340, 285, 0x1a1e25, 1).setOrigin(0).setStrokeStyle(1, level >= 3 ? 0xe9b949 : 0xffffff, level >= 3 ? 0.45 : 0.08);
      this.label(x + 22, y + 20, definition.title[this.locale], 21, '#f7f8fa', 'bold').setWordWrapWidth(296);
      this.label(x + 22, y + 58, definition.description[this.locale], 14, '#aeb5c0').setWordWrapWidth(296).setLineSpacing(3);
      this.label(x + 22, y + 130, t(this.locale, 'upgradeLevel', { level }), 15, '#61a8ff', 'bold');
      this.label(x + 22, y + 160, effect[this.locale], 15, '#d7dbe2', 'bold').setWordWrapWidth(296);

      if (cost === null) {
        this.centerLabel(x + 170, y + 244, t(this.locale, 'maxLevel'), 16, '#e9b949', 'bold');
      } else {
        button(this, x + 170, y + 244, t(this.locale, 'buyUpgrade', { amount: this.money(cost) }), () => {
          this.store.buyBusinessUpgrade(id);
          this.render();
        }, { width: 250, height: 48, disabled: save.cash < cost });
      }
    });
  }

  private renderAchievements(): void {
    const save = this.store.snapshot;
    this.label(100, 220, t(this.locale, 'achievements'), 24, '#f7f8fa', 'bold');

    ACHIEVEMENTS.forEach((achievement, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 95 + column * 565;
      const y = 260 + row * 92;
      const value = achievementMetricValue(save, achievement.metric);
      const progress = Math.min(value, achievement.target);
      const complete = value >= achievement.target;
      const claimed = save.claimedAchievements.includes(achievement.id);

      this.add.rectangle(x, y, 535, 82, 0x1a1e25, 1).setOrigin(0).setStrokeStyle(1, claimed ? 0x63d28d : complete ? 0xe9b949 : 0xffffff, claimed || complete ? 0.38 : 0.07);
      this.label(x + 18, y + 13, achievement.title[this.locale], 17, '#f7f8fa', 'bold');
      this.label(x + 18, y + 40, achievement.description[this.locale], 13, '#8b93a1').setWordWrapWidth(275);
      this.label(x + 315, y + 14, `${Math.floor(progress)}/${achievement.target}`, 14, complete ? '#63d28d' : '#aeb5c0', 'bold');
      this.label(x + 315, y + 40, `+${this.money(achievement.reward)}`, 14, '#e9b949', 'bold');

      if (claimed) {
        this.label(x + 430, y + 32, t(this.locale, 'claimed'), 13, '#63d28d', 'bold');
      } else {
        button(this, x + 455, y + 42, t(this.locale, 'claimReward'), () => {
          this.store.claimAchievement(achievement.id);
          this.render();
        }, { width: 130, height: 38, disabled: !complete, hitSlop: 7 });
      }
    });
  }

  private renderStats(): void {
    const save = this.store.snapshot;
    const uniqueFinds = new Set(save.collection).size;
    const winRate = save.auctionsPlayed > 0 ? Math.round((save.auctionsWon / save.auctionsPlayed) * 100) : 0;
    const stats: Array<{ label: string; value: string }> = [
      { label: t(this.locale, 'statAuctionsPlayed'), value: String(Math.floor(save.auctionsPlayed)) },
      { label: t(this.locale, 'statAuctionsWon'), value: String(Math.floor(save.auctionsWon)) },
      { label: t(this.locale, 'statWinRate'), value: `${winRate}%` },
      { label: t(this.locale, 'statLifetimeSales'), value: this.money(save.lifetimeSales) },
      { label: t(this.locale, 'statHighestCash'), value: this.money(save.highestCash) },
      { label: t(this.locale, 'statUniqueFinds'), value: String(uniqueFinds) },
      { label: t(this.locale, 'statClaimedSets'), value: `${save.claimedSetRewards.length}/${COLLECTION_SETS.length}` },
      { label: t(this.locale, 'statReputation'), value: `${Math.floor(save.reputationXp)} REP` },
    ];

    this.label(100, 220, t(this.locale, 'stats'), 24, '#f7f8fa', 'bold');
    stats.forEach((stat, index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);
      const x = 100 + column * 275;
      const y = 275 + row * 170;
      this.add.rectangle(x, y, 245, 135, 0x1a1e25, 1).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.08);
      this.label(x + 20, y + 22, stat.label.toUpperCase(), 12, '#737b88').setWordWrapWidth(205);
      this.label(x + 20, y + 65, stat.value, 28, '#f7f8fa', 'bold').setWordWrapWidth(205);
    });
  }

  private renderHistory(): void {
    const history = this.store.snapshot.auctionHistory;
    const pageCount = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
    this.historyPage = Phaser.Math.Clamp(this.historyPage, 0, pageCount - 1);
    const start = this.historyPage * HISTORY_PAGE_SIZE;
    const entries = history.slice(start, start + HISTORY_PAGE_SIZE);

    this.label(100, 220, t(this.locale, 'recentAuctions'), 24, '#f7f8fa', 'bold');
    this.label(100, 253, t(this.locale, 'historyHint'), 14, '#737b88');

    if (entries.length === 0) {
      this.centerLabel(640, 410, t(this.locale, 'historyEmpty'), 18, '#8b93a1');
      return;
    }

    entries.forEach((entry, index) => {
      const y = 285 + index * 60;
      const lot = LOTS.find((candidate) => candidate.id === entry.lotId);
      const modifier = entry.modifierId
        ? LOT_MODIFIERS.find((candidate) => candidate.id === entry.modifierId)
        : undefined;
      const won = entry.outcome === 'won';
      const status = won ? t(this.locale, 'historyWon') : t(this.locale, 'historyPassed');
      const statusColor = won ? '#63d28d' : '#aeb5c0';
      const result = won
        ? `${t(this.locale, 'historyResult')}: ${this.signedMoney(entry.estimatedResult)}`
        : `${t(this.locale, 'currentBid')}: ${this.money(entry.finalBid)}`;
      const lotName = lot?.name[this.locale] ?? entry.lotId;
      const modifierSuffix = modifier ? ` · ★ ${modifier.name[this.locale]}` : '';

      this.add.rectangle(100, y, 1080, 50, 0x1a1e25, 1).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.07);
      this.label(118, y + 9, `${lotName}${modifierSuffix}`, 15, '#f7f8fa', 'bold').setWordWrapWidth(430);
      this.label(575, y + 9, status, 14, statusColor, 'bold');
      this.label(705, y + 9, result, 14, won && entry.estimatedResult < 0 ? '#ff8d85' : won ? '#63d28d' : '#d7dbe2', 'bold');
      const flags = [entry.daily ? t(this.locale, 'historyDaily') : '', this.formatHistoryDate(entry.occurredAt)].filter(Boolean).join(' · ');
      this.label(1160, y + 9, flags, 12, '#737b88').setOrigin(1, 0);
      if (won) {
        this.label(705, y + 29, `${t(this.locale, 'paid')}: ${this.money(entry.finalBid)} · ${t(this.locale, 'sales')}: ${this.money(entry.sales)}`, 11, '#8b93a1');
      }
    });

    if (pageCount > 1) {
      button(this, 510, 610, t(this.locale, 'previousPage'), () => {
        this.historyPage = Math.max(0, this.historyPage - 1);
        this.render();
      }, { width: 170, height: 42, background: 0x2c313a, disabled: this.historyPage === 0 });
      this.centerLabel(640, 610, t(this.locale, 'historyPage', { current: this.historyPage + 1, total: pageCount }), 13, '#aeb5c0');
      button(this, 770, 610, t(this.locale, 'nextPage'), () => {
        this.historyPage = Math.min(pageCount - 1, this.historyPage + 1);
        this.render();
      }, { width: 170, height: 42, background: 0x2c313a, disabled: this.historyPage >= pageCount - 1 });
    }
  }

  private renderSettings(): void {
    const preferences = loadAccessibilityPreferences();
    const rows: Array<{
      key: AccessibilityPreferenceKey;
      title: 'soundFeedback' | 'reducedMotion' | 'highContrast';
      description: 'soundFeedbackDesc' | 'reducedMotionDesc' | 'highContrastDesc';
    }> = [
      { key: 'soundFeedback', title: 'soundFeedback', description: 'soundFeedbackDesc' },
      { key: 'reducedMotion', title: 'reducedMotion', description: 'reducedMotionDesc' },
      { key: 'highContrast', title: 'highContrast', description: 'highContrastDesc' },
    ];

    this.label(100, 220, t(this.locale, 'accessibilitySettings'), 24, '#f7f8fa', 'bold');
    this.label(100, 253, t(this.locale, 'accessibilityLocalHint'), 14, '#737b88');

    rows.forEach((row, index) => {
      const y = 295 + index * 100;
      const enabled = preferences[row.key];
      this.add.rectangle(100, y, 1080, 82, 0x1a1e25, 1).setOrigin(0).setStrokeStyle(1, enabled ? 0x63d28d : 0xffffff, enabled ? 0.25 : 0.07);
      this.label(125, y + 16, t(this.locale, row.title), 18, '#f7f8fa', 'bold');
      this.label(125, y + 45, t(this.locale, row.description), 13, '#8b93a1').setWordWrapWidth(700);
      button(this, 1040, y + 41, enabled ? t(this.locale, 'enabled') : t(this.locale, 'disabled'), () => {
        setAccessibilityPreference(row.key, !enabled);
        this.render();
      }, {
        width: 190,
        height: 46,
        background: enabled ? 0x3f7a5a : 0x2c313a,
      });
    });
  }

  private label(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: style,
      color,
    });
  }

  private centerLabel(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.label(x, y, text, size, color, style).setOrigin(0.5);
  }

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }

  private signedMoney(value: number): string {
    return `${value >= 0 ? '+' : ''}${this.money(value)}`;
  }

  private formatHistoryDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
