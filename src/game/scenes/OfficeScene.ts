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
import { addAtmosphere, addChip, addProgressBar, addSurface, VISUAL } from '../visual';

type OfficeTab = 'contracts' | 'upgrades' | 'achievements' | 'stats' | 'history' | 'settings';

const WIDTH = 1280;
const HEIGHT = 720;
const HISTORY_PAGE_SIZE = 5;
const ACHIEVEMENT_PAGE_SIZE = 8;

export class OfficeScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';
  private tab: OfficeTab = 'contracts';
  private historyPage = 0;
  private achievementPage = 0;

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
    const accent = this.tabAccent(this.tab);
    addAtmosphere(this, WIDTH, HEIGHT, accent, 1030);
    // The Office sits in a real working room: desk edge, lamp pool and brass filing rail.
    this.add.ellipse(1020, 232, 430, 330, VISUAL.warm, 0.026);
    this.add.rectangle(0, 650, WIDTH, 70, VISUAL.wood, 0.2).setOrigin(0);
    this.add.rectangle(0, 648, WIDTH, 3, VISUAL.brass, 0.22).setOrigin(0);
    this.add.rectangle(30, 188, 1220, 8, VISUAL.leather, 0.2).setOrigin(0);
    this.renderHeader(accent);
    this.renderTabs();
    addSurface(this, 54, 198, 1172, 478, {
      fill: VISUAL.panelDeep,
      accent,
      strokeAlpha: 0.18,
      glowAlpha: 0.012,
      shadowAlpha: 0.3,
    });

    switch (this.tab) {
      case 'contracts': this.renderContracts(); break;
      case 'upgrades': this.renderUpgrades(); break;
      case 'achievements': this.renderAchievements(); break;
      case 'stats': this.renderStats(); break;
      case 'history': this.renderHistory(); break;
      case 'settings': this.renderSettings(); break;
    }
  }

  private renderHeader(accent: number): void {
    const save = this.store.snapshot;
    addSurface(this, 48, 24, 280, 88, {
      fill: VISUAL.panelDeep,
      accent,
      strokeAlpha: 0.3,
      glowAlpha: 0.018,
    });
    this.label(70, 40, t(this.locale, 'office'), 29, VISUAL.text, 'bold');
    this.label(70, 78, t(this.locale, 'officeSubtitle'), 13, VISUAL.muted).setWordWrapWidth(230);

    this.headerMetric(590, 28, t(this.locale, 'cash'), this.money(save.cash), VISUAL.success);
    this.headerMetric(750, 28, t(this.locale, 'reputation'), `${Math.floor(save.reputationXp)} REP`, VISUAL.rare);
    this.headerMetric(910, 28, t(this.locale, 'collection'), String(new Set(save.collection).size), VISUAL.purple);

    button(this, 1132, 68, t(this.locale, 'backToCollection'), () => this.scene.start('collection'), {
      width: 188,
      height: 48,
      background: VISUAL.rare,
      accent: 0x8fc3ff,
      fontSize: 13,
    });

    this.add.rectangle(54, 122, 1172, 1, accent, 0.16).setOrigin(0);
  }

  private headerMetric(x: number, y: number, title: string, value: string, accent: number): void {
    addSurface(this, x, y, 142, 72, {
      fill: VISUAL.panel,
      accent,
      strokeAlpha: 0.24,
      glowAlpha: 0.012,
      shadowAlpha: 0.18,
      topLine: false,
    });
    this.label(x + 14, y + 12, title.toUpperCase(), 8, VISUAL.faint, 'bold');
    this.add.circle(x + 18, y + 49, 7, accent, 0.9);
    this.label(x + 32, y + 37, value, 15, VISUAL.text, 'bold').setWordWrapWidth(96);
  }

  private renderTabs(): void {
    const tabs: Array<{ id: OfficeTab; key: 'contracts' | 'upgrades' | 'achievements' | 'stats' | 'history' | 'settings'; accent: number }> = [
      { id: 'contracts', key: 'contracts', accent: VISUAL.warm },
      { id: 'upgrades', key: 'upgrades', accent: VISUAL.copper },
      { id: 'achievements', key: 'achievements', accent: VISUAL.purple },
      { id: 'stats', key: 'stats', accent: VISUAL.rare },
      { id: 'history', key: 'history', accent: VISUAL.success },
      { id: 'settings', key: 'settings', accent: 0x7f8996 },
    ];

    tabs.forEach((tab, index) => {
      const selected = this.tab === tab.id;
      button(this, 145 + index * 198, 157, t(this.locale, tab.key), () => {
        this.tab = tab.id;
        this.render();
      }, {
        width: 178,
        height: 44,
        background: selected ? tab.accent : VISUAL.steel,
        accent: tab.accent,
        foreground: selected && (tab.accent === VISUAL.warm || tab.accent === VISUAL.copper || tab.accent === VISUAL.rare)
          ? '#101216'
          : VISUAL.text,
        hitSlop: 8,
        fontSize: 12,
      });
    });
  }

  private renderContracts(): void {
    const save = this.store.snapshot;
    const dayKey = save.contractDayKey ?? localDayKey();
    const contracts = dailyContractsForDay(dayKey);
    const rewardLevel = save.businessUpgrades.contractsDesk;

    this.sectionHeader(
      t(this.locale, 'dailyContracts'),
      t(this.locale, 'contractsResetDaily'),
      VISUAL.warm,
    );

    contracts.forEach((contract, index) => {
      const x = 78 + index * 380;
      const y = 288;
      const progress = Math.min(contract.target, save.contractProgress[contract.id] ?? 0);
      const complete = progress >= contract.target;
      const claimed = save.claimedContractRewards.includes(contract.id);
      const reward = contractRewardValue(contract.reward, rewardLevel);
      const accent = claimed ? VISUAL.success : complete ? VISUAL.warm : 0x6f7884;

      addSurface(this, x, y, 344, 330, {
        fill: VISUAL.panel,
        accent,
        strokeAlpha: complete || claimed ? 0.38 : 0.14,
        glowAlpha: complete ? 0.024 : 0.008,
      });
      this.add.circle(x + 30, y + 32, 13, accent, 0.18).setStrokeStyle(1, accent, 0.55);
      this.centerLabel(x + 30, y + 32, String(index + 1), 11, this.hexColor(accent), 'bold');
      addChip(
        this,
        x + 273,
        y + 30,
        claimed ? t(this.locale, 'claimed') : complete ? t(this.locale, 'progress') : `${Math.floor(progress)}/${contract.target}`,
        accent,
        { width: 108, height: 26, filled: complete || claimed, fontSize: 9 },
      );

      this.label(x + 22, y + 62, contract.title[this.locale], 20, VISUAL.text, 'bold').setWordWrapWidth(296);
      this.label(x + 22, y + 101, contract.description[this.locale], 13, '#aeb5c0').setWordWrapWidth(296).setLineSpacing(3);

      const ratio = contract.target > 0 ? Phaser.Math.Clamp(progress / contract.target, 0, 1) : 0;
      this.label(x + 22, y + 178, `${t(this.locale, 'progress')}: ${Math.floor(progress)}/${contract.target}`, 12, complete ? '#78dfa0' : '#d7dbe2', 'bold');
      addProgressBar(this, x + 22, y + 207, 300, ratio, complete ? VISUAL.success : VISUAL.warm);

      this.label(x + 22, y + 232, t(this.locale, 'cashReward', { amount: this.money(reward) }), 16, '#f0c969', 'bold');
      this.label(x + 22, y + 260, this.locale === 'ru' ? 'Контрактное бюро' : 'Contracts desk', 9, VISUAL.faint, 'bold');

      if (claimed) {
        this.centerLabel(x + 172, y + 298, t(this.locale, 'claimed'), 15, '#78dfa0', 'bold');
      } else {
        button(this, x + 172, y + 298, t(this.locale, 'claimReward'), () => {
          this.store.claimDailyContractReward(contract.id);
          this.render();
        }, {
          width: 232,
          height: 46,
          disabled: !complete,
          background: complete ? VISUAL.success : VISUAL.steel,
          accent: complete ? VISUAL.success : 0x69717c,
          fontSize: 13,
        });
      }
    });
  }

  private renderUpgrades(): void {
    const save = this.store.snapshot;
    this.sectionHeader(t(this.locale, 'businessUpgrades'), t(this.locale, 'officeHint'), VISUAL.copper);

    BUSINESS_UPGRADE_ORDER.forEach((id, index) => {
      const definition = BUSINESS_UPGRADES[id];
      const level = save.businessUpgrades[id];
      const cost = nextUpgradeCost(definition.costs, level);
      const effect = definition.effects[Math.min(level, definition.effects.length - 1)] ?? definition.effects[0]!;
      const x = 78 + index * 380;
      const y = 288;
      const maxed = cost === null;
      const accent = maxed ? VISUAL.warm : [VISUAL.rare, VISUAL.copper, VISUAL.purple][index] ?? VISUAL.copper;

      addSurface(this, x, y, 344, 330, {
        fill: VISUAL.panel,
        accent,
        strokeAlpha: maxed ? 0.42 : 0.18,
        glowAlpha: maxed ? 0.026 : 0.01,
      });
      this.add.circle(x + 40, y + 42, 23, accent, 0.14).setStrokeStyle(2, accent, 0.48);
      this.centerLabel(x + 40, y + 42, `${level}`, 20, this.hexColor(accent), 'bold');
      addChip(this, x + 272, y + 36, t(this.locale, 'upgradeLevel', { level }), accent, {
        width: 112,
        height: 28,
        filled: maxed,
        fontSize: 9,
      });

      this.label(x + 22, y + 78, definition.title[this.locale], 20, VISUAL.text, 'bold').setWordWrapWidth(296);
      this.label(x + 22, y + 116, definition.description[this.locale], 13, '#aeb5c0').setWordWrapWidth(296).setLineSpacing(3);

      this.label(x + 22, y + 196, this.locale === 'ru' ? 'ТЕКУЩИЙ ЭФФЕКТ' : 'CURRENT EFFECT', 9, VISUAL.faint, 'bold');
      this.label(x + 22, y + 216, effect[this.locale], 14, '#d7dbe2', 'bold').setWordWrapWidth(296);

      if (maxed) {
        addChip(this, x + 172, y + 296, t(this.locale, 'maxLevel'), VISUAL.warm, {
          width: 210,
          height: 42,
          filled: true,
          fontSize: 13,
        });
      } else {
        button(this, x + 172, y + 296, t(this.locale, 'buyUpgrade', { amount: this.money(cost) }), () => {
          this.store.buyBusinessUpgrade(id);
          this.render();
        }, {
          width: 254,
          height: 48,
          disabled: save.cash < cost,
          background: accent,
          accent,
          fontSize: 12,
        });
      }
    });
  }

  private renderAchievements(): void {
    const save = this.store.snapshot;
    const pageCount = Math.max(1, Math.ceil(ACHIEVEMENTS.length / ACHIEVEMENT_PAGE_SIZE));
    this.achievementPage = Phaser.Math.Clamp(this.achievementPage, 0, pageCount - 1);
    const start = this.achievementPage * ACHIEVEMENT_PAGE_SIZE;
    const achievements = ACHIEVEMENTS.slice(start, start + ACHIEVEMENT_PAGE_SIZE);

    this.sectionHeader(
      t(this.locale, 'achievements'),
      this.locale === 'ru' ? 'Долгосрочные цели дилера и награды за прогресс.' : 'Long-term dealer milestones and progression rewards.',
      VISUAL.purple,
    );

    achievements.forEach((achievement, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 82 + column * 568;
      const y = 282 + row * 82;
      const value = achievementMetricValue(save, achievement.metric);
      const progress = Math.min(value, achievement.target);
      const ratio = achievement.target > 0 ? Phaser.Math.Clamp(progress / achievement.target, 0, 1) : 0;
      const complete = value >= achievement.target;
      const claimed = save.claimedAchievements.includes(achievement.id);
      const accent = claimed ? VISUAL.success : complete ? VISUAL.warm : VISUAL.purple;
      const displayIndex = start + index + 1;

      addSurface(this, x, y, 538, 74, {
        fill: VISUAL.panel,
        accent,
        strokeAlpha: claimed || complete ? 0.34 : 0.13,
        glowAlpha: complete ? 0.018 : 0.006,
        shadowAlpha: 0.2,
      });
      this.add.circle(x + 29, y + 37, 16, accent, 0.13).setStrokeStyle(1, accent, 0.46);
      this.centerLabel(x + 29, y + 37, claimed ? '✓' : String(displayIndex), 11, this.hexColor(accent), 'bold');
      this.label(x + 58, y + 9, achievement.title[this.locale], 15, VISUAL.text, 'bold').setWordWrapWidth(238);
      this.label(x + 58, y + 33, achievement.description[this.locale], 10, VISUAL.muted).setWordWrapWidth(238);
      addProgressBar(this, x + 315, y + 18, 98, ratio, accent);
      this.label(x + 315, y + 30, `${Math.floor(progress)}/${achievement.target}`, 10, complete ? '#78dfa0' : '#b7bdc6', 'bold');
      this.label(x + 315, y + 51, `+${this.money(achievement.reward)}`, 11, '#f0c969', 'bold');

      if (claimed) {
        addChip(this, x + 474, y + 37, t(this.locale, 'claimed'), VISUAL.success, { width: 98, height: 28, filled: true, fontSize: 9 });
      } else {
        button(this, x + 472, y + 37, t(this.locale, 'claimReward'), () => {
          this.store.claimAchievement(achievement.id);
          this.render();
        }, {
          width: 102,
          height: 32,
          disabled: !complete,
          hitSlop: 7,
          background: complete ? VISUAL.warm : VISUAL.steel,
          accent,
          fontSize: 9,
        });
      }
    });

    if (pageCount > 1) {
      button(this, 510, 636, t(this.locale, 'previousPage'), () => {
        this.achievementPage = Math.max(0, this.achievementPage - 1);
        this.render();
      }, { width: 160, height: 34, background: VISUAL.steel, disabled: this.achievementPage === 0, fontSize: 10 });
      this.centerLabel(640, 636, `${this.achievementPage + 1}/${pageCount}`, 11, '#aeb5c0', 'bold');
      button(this, 770, 636, t(this.locale, 'nextPage'), () => {
        this.achievementPage = Math.min(pageCount - 1, this.achievementPage + 1);
        this.render();
      }, { width: 160, height: 34, background: VISUAL.steel, disabled: this.achievementPage >= pageCount - 1, fontSize: 10 });
    }
  }

  private renderStats(): void {
    const save = this.store.snapshot;
    const uniqueFinds = new Set(save.collection).size;
    const winRate = save.auctionsPlayed > 0 ? Math.round((save.auctionsWon / save.auctionsPlayed) * 100) : 0;
    const stats: Array<{ label: string; value: string; accent: number }> = [
      { label: t(this.locale, 'statAuctionsPlayed'), value: String(Math.floor(save.auctionsPlayed)), accent: VISUAL.warm },
      { label: t(this.locale, 'statAuctionsWon'), value: String(Math.floor(save.auctionsWon)), accent: VISUAL.success },
      { label: t(this.locale, 'statWinRate'), value: `${winRate}%`, accent: VISUAL.rare },
      { label: t(this.locale, 'statLifetimeSales'), value: this.money(save.lifetimeSales), accent: VISUAL.copper },
      { label: t(this.locale, 'statHighestCash'), value: this.money(save.highestCash), accent: VISUAL.warm },
      { label: t(this.locale, 'statUniqueFinds'), value: String(uniqueFinds), accent: VISUAL.purple },
      { label: t(this.locale, 'statClaimedSets'), value: `${save.claimedSetRewards.length}/${COLLECTION_SETS.length}`, accent: VISUAL.success },
      { label: t(this.locale, 'statReputation'), value: `${Math.floor(save.reputationXp)} REP`, accent: VISUAL.rare },
    ];

    this.sectionHeader(
      t(this.locale, 'stats'),
      this.locale === 'ru' ? 'Сводка всей карьеры охотника за лотами.' : 'A career snapshot of your auction-hunting business.',
      VISUAL.rare,
    );

    stats.forEach((stat, index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);
      const x = 78 + column * 284;
      const y = 286 + row * 160;
      addSurface(this, x, y, 252, 128, {
        fill: VISUAL.panel,
        accent: stat.accent,
        strokeAlpha: 0.2,
        glowAlpha: 0.012,
      });
      this.add.circle(x + 29, y + 28, 10, stat.accent, 0.82);
      this.label(x + 49, y + 18, stat.label.toUpperCase(), 9, VISUAL.faint, 'bold').setWordWrapWidth(174);
      this.label(x + 20, y + 58, stat.value, 27, VISUAL.text, 'bold').setWordWrapWidth(210);
      this.add.rectangle(x + 20, y + 105, 212, 2, stat.accent, 0.28).setOrigin(0);
    });
  }

  private renderHistory(): void {
    const history = this.store.snapshot.auctionHistory;
    const pageCount = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
    this.historyPage = Phaser.Math.Clamp(this.historyPage, 0, pageCount - 1);
    const start = this.historyPage * HISTORY_PAGE_SIZE;
    const entries = history.slice(start, start + HISTORY_PAGE_SIZE);

    this.sectionHeader(t(this.locale, 'recentAuctions'), t(this.locale, 'historyHint'), VISUAL.success);

    if (entries.length === 0) {
      addSurface(this, 318, 330, 644, 180, { fill: VISUAL.panel, accent: VISUAL.success, strokeAlpha: 0.12 });
      this.centerLabel(640, 390, t(this.locale, 'historyEmpty'), 18, VISUAL.muted);
      this.centerLabel(640, 430, this.locale === 'ru' ? 'Здесь появится память о твоих торгах.' : 'Your auction memory will appear here.', 12, VISUAL.faint);
      return;
    }

    entries.forEach((entry, index) => {
      const y = 286 + index * 62;
      const lot = LOTS.find((candidate) => candidate.id === entry.lotId);
      const modifier = entry.modifierId
        ? LOT_MODIFIERS.find((candidate) => candidate.id === entry.modifierId)
        : undefined;
      const won = entry.outcome === 'won';
      const accent = won ? VISUAL.success : 0x7b8490;
      const status = won ? t(this.locale, 'historyWon') : t(this.locale, 'historyPassed');
      const result = won
        ? `${t(this.locale, 'historyResult')}: ${this.signedMoney(entry.estimatedResult)}`
        : `${t(this.locale, 'currentBid')}: ${this.money(entry.finalBid)}`;
      const lotName = lot?.name[this.locale] ?? entry.lotId;
      const modifierSuffix = modifier ? ` · ★ ${modifier.name[this.locale]}` : '';

      addSurface(this, 82, y, 1116, 52, {
        fill: VISUAL.panel,
        accent,
        strokeAlpha: 0.15,
        shadowAlpha: 0.12,
        topLine: false,
      });
      this.add.circle(103, y + 26, 6, accent, 0.9);
      this.label(119, y + 8, `${lotName}${modifierSuffix}`, 14, VISUAL.text, 'bold').setWordWrapWidth(416);
      addChip(this, 600, y + 26, status, accent, { width: 104, height: 26, filled: won, fontSize: 9 });
      this.label(675, y + 9, result, 13, won && entry.estimatedResult < 0 ? '#ff8d85' : won ? '#78dfa0' : '#d7dbe2', 'bold');
      const flags = [entry.daily ? t(this.locale, 'historyDaily') : '', this.formatHistoryDate(entry.occurredAt)].filter(Boolean).join(' · ');
      this.label(1174, y + 8, flags, 10, VISUAL.faint).setOrigin(1, 0);
      if (won) {
        this.label(675, y + 29, `${t(this.locale, 'paid')}: ${this.money(entry.finalBid)} · ${t(this.locale, 'sales')}: ${this.money(entry.sales)}`, 10, VISUAL.muted);
      }
    });

    if (pageCount > 1) {
      button(this, 510, 628, t(this.locale, 'previousPage'), () => {
        this.historyPage = Math.max(0, this.historyPage - 1);
        this.render();
      }, { width: 170, height: 40, background: VISUAL.steel, disabled: this.historyPage === 0, fontSize: 11 });
      this.centerLabel(640, 628, t(this.locale, 'historyPage', { current: this.historyPage + 1, total: pageCount }), 12, '#aeb5c0');
      button(this, 770, 628, t(this.locale, 'nextPage'), () => {
        this.historyPage = Math.min(pageCount - 1, this.historyPage + 1);
        this.render();
      }, { width: 170, height: 40, background: VISUAL.steel, disabled: this.historyPage >= pageCount - 1, fontSize: 11 });
    }
  }

  private renderSettings(): void {
    const preferences = loadAccessibilityPreferences();
    const rows: Array<{
      key: AccessibilityPreferenceKey;
      title: 'soundFeedback' | 'reducedMotion' | 'highContrast';
      description: 'soundFeedbackDesc' | 'reducedMotionDesc' | 'highContrastDesc';
      accent: number;
    }> = [
      { key: 'soundFeedback', title: 'soundFeedback', description: 'soundFeedbackDesc', accent: VISUAL.warm },
      { key: 'reducedMotion', title: 'reducedMotion', description: 'reducedMotionDesc', accent: VISUAL.rare },
      { key: 'highContrast', title: 'highContrast', description: 'highContrastDesc', accent: VISUAL.purple },
    ];

    this.sectionHeader(t(this.locale, 'accessibilitySettings'), t(this.locale, 'accessibilityLocalHint'), 0x7f8996);

    rows.forEach((row, index) => {
      const y = 296 + index * 106;
      const enabled = preferences[row.key];
      const accent = enabled ? row.accent : 0x69717c;
      addSurface(this, 82, y, 1116, 88, {
        fill: VISUAL.panel,
        accent,
        strokeAlpha: enabled ? 0.26 : 0.12,
        glowAlpha: enabled ? 0.012 : 0.004,
      });
      this.add.circle(112, y + 44, 16, accent, 0.12).setStrokeStyle(1, accent, 0.45);
      this.centerLabel(112, y + 44, enabled ? '✓' : '—', 13, this.hexColor(accent), 'bold');
      this.label(145, y + 16, t(this.locale, row.title), 17, VISUAL.text, 'bold');
      this.label(145, y + 44, t(this.locale, row.description), 12, VISUAL.muted).setWordWrapWidth(700);
      addChip(
        this,
        932,
        y + 44,
        enabled ? t(this.locale, 'enabled') : t(this.locale, 'disabled'),
        accent,
        { width: 120, height: 30, filled: enabled, fontSize: 10 },
      );
      button(this, 1085, y + 44, enabled ? t(this.locale, 'disabled') : t(this.locale, 'enabled'), () => {
        setAccessibilityPreference(row.key, !enabled);
        this.render();
      }, {
        width: 174,
        height: 42,
        background: enabled ? VISUAL.steel : row.accent,
        accent: row.accent,
        fontSize: 11,
      });
    });
  }

  private sectionHeader(title: string, subtitle: string, accent: number): void {
    this.add.rectangle(82, 220, 5, 48, accent, 0.9).setOrigin(0);
    this.label(102, 216, title, 23, VISUAL.text, 'bold');
    this.label(102, 250, subtitle, 12, VISUAL.muted).setWordWrapWidth(960);
  }

  private tabAccent(tab: OfficeTab): number {
    switch (tab) {
      case 'contracts': return VISUAL.warm;
      case 'upgrades': return VISUAL.copper;
      case 'achievements': return VISUAL.purple;
      case 'stats': return VISUAL.rare;
      case 'history': return VISUAL.success;
      case 'settings': return 0x7f8996;
    }
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

  private hexColor(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
