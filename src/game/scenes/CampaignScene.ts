import Phaser from 'phaser';
import { CAMPAIGN_CHAPTERS, CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS, type CampaignMission } from '../../data/campaign';
import { campaignMissionById } from '../../domain/campaign';
import type { Locale } from '../../domain/types';
import { getPlatformLocale } from '../../platform/yandex';
import { CampaignStore } from '../campaignStore';
import { button } from '../ui';
import { addAtmosphere, addChip, addProgressBar, addSurface, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;

export class CampaignScene extends Phaser.Scene {
  private readonly campaign = new CampaignStore();
  private locale: Locale = 'en';
  private feedback: string | null = null;

  constructor() {
    super('campaign');
  }

  preload(): void {
    this.load.svg('campaign-estate-study', 'assets/campaign/campaign-estate-study.svg');
    this.load.svg('evidence-black-seal', 'assets/campaign/evidence-black-seal.svg');
    this.load.svg('evidence-ledger-fragment', 'assets/campaign/evidence-ledger-fragment.svg');
  }

  create(): void {
    this.locale = getPlatformLocale();
    this.render();
  }

  private render(): void {
    this.children.removeAll(true);
    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.warm, 980);
    this.add.image(952, 360, 'campaign-estate-study').setDisplaySize(620, 520).setAlpha(0.34);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x090b0e, 0.42).setOrigin(0);

    this.renderHeader();
    this.renderChapterRail();
    this.renderInvestigationWall();
    this.renderMissionPanel();
  }

  private renderHeader(): void {
    const save = this.campaign.snapshot;
    this.label(52, 30, this.locale === 'ru' ? 'ДЕЛО: ЧЁРНЫЙ РЕЕСТР' : 'CASE: THE BLACK LEDGER', 28, '#f0c969', 'bold');
    this.label(
      52,
      68,
      this.locale === 'ru'
        ? 'След исчезнувшего коллекционера Вейра проходит через обычные распродажи, частные сделки и закрытые аукционы.'
        : "The trail of vanished collector Veyr runs through ordinary clearances, private deals and invitation auctions.",
      13,
      '#aeb5c0',
    ).setWordWrapWidth(730);

    addChip(this, 870, 45, `${Math.floor(save.reputationXp)} REP`, VISUAL.rare, { width: 116, height: 30, filled: true, fontSize: 11 });
    addChip(this, 1000, 45, this.money(save.cash), VISUAL.success, { width: 132, height: 30, filled: true, fontSize: 11 });
    button(this, 1175, 50, this.locale === 'ru' ? 'Аукцион' : 'Auction', () => this.scene.start('auction'), {
      width: 150,
      height: 44,
      background: VISUAL.rare,
      accent: 0x8fc3ff,
      fontSize: 12,
    });
  }

  private renderChapterRail(): void {
    const completed = this.campaign.progress.completedMissionIds.length;
    const chapterOneDone = CAMPAIGN_MISSIONS.filter((m) => m.chapterId === 'first-flip').every((m) => this.campaign.progress.completedMissionIds.includes(m.id));
    const y = 126;
    CAMPAIGN_CHAPTERS.forEach((chapter, index) => {
      const x = 54 + index * 238;
      const active = index === 0 && !chapterOneDone;
      const locked = index > 0;
      const accent = active ? VISUAL.warm : locked ? 0x4d5661 : VISUAL.success;
      addSurface(this, x, y, 214, 82, { fill: VISUAL.panelDeep, accent, strokeAlpha: active ? 0.38 : 0.16, glowAlpha: active ? 0.02 : 0.006 });
      this.label(x + 14, y + 12, `0${chapter.order}`, 10, this.hex(accent), 'bold');
      this.label(x + 14, y + 29, chapter.title[this.locale].replace(/^.*—\s*/, ''), 13, '#f7f3e8', 'bold').setWordWrapWidth(178);
      this.label(x + 14, y + 57, locked ? (this.locale === 'ru' ? 'Закрыто' : 'Locked') : `${completed}/4`, 9, locked ? '#707985' : '#b9c0ca', 'bold');
    });
  }

  private renderInvestigationWall(): void {
    const progress = this.campaign.progress;
    addSurface(this, 52, 232, 510, 432, { fill: 0x17130f, accent: VISUAL.copper, strokeAlpha: 0.34, glowAlpha: 0.012 });
    this.label(74, 250, this.locale === 'ru' ? 'ДОСКА РАССЛЕДОВАНИЯ' : 'INVESTIGATION WALL', 13, '#d6a45f', 'bold');
    this.label(74, 274, this.locale === 'ru' ? 'Улики и связи, найденные в ходе кампании.' : 'Evidence and links recovered during the campaign.', 11, '#8f98a4');

    const evidence = CAMPAIGN_EVIDENCE.filter((entry) => progress.evidenceIds.includes(entry.id));
    if (evidence.length === 0) {
      this.add.rectangle(306, 446, 420, 242, 0x0e0d0b, 0.72).setStrokeStyle(1, 0x60452c, 0.35);
      this.label(142, 390, this.locale === 'ru' ? 'Пока только пустые нитки.' : 'Only loose threads so far.', 17, '#b4a184', 'bold');
      this.label(142, 428, this.locale === 'ru' ? 'Первая настоящая улика появится в третьем задании главы.' : 'The first hard piece of evidence appears in Chapter I mission three.', 12, '#7d7568').setWordWrapWidth(320);
    } else {
      evidence.slice(0, 2).forEach((entry, index) => {
        const y = 318 + index * 162;
        const texture = entry.artId;
        this.add.image(158, y + 69, texture).setDisplaySize(146, 112);
        this.label(250, y + 16, entry.title[this.locale], 15, '#f2e2bd', 'bold').setWordWrapWidth(278);
        this.label(250, y + 48, entry.description[this.locale], 11, '#aa9c82').setWordWrapWidth(274).setLineSpacing(3);
        this.add.line(250, y + 112, 0, 0, 230, 0, 0x8a2b2b, 0.45).setOrigin(0);
      });
    }
  }

  private renderMissionPanel(): void {
    const save = this.campaign.snapshot;
    const progress = save.campaign;
    const mission = campaignMissionById(CAMPAIGN_MISSIONS, progress.activeMissionId) ?? this.campaign.nextMission();

    addSurface(this, 586, 232, 642, 432, { fill: VISUAL.panelDeep, accent: VISUAL.warm, strokeAlpha: 0.28, glowAlpha: 0.014 });
    this.label(610, 250, this.locale === 'ru' ? 'ТЕКУЩЕЕ ДЕЛО' : 'CURRENT CASE', 11, VISUAL.faint, 'bold');

    if (!mission) {
      this.label(610, 304, this.locale === 'ru' ? 'Глава I завершена' : 'Chapter I complete', 28, '#f0c969', 'bold');
      this.label(610, 352, this.locale === 'ru' ? 'След ведёт дальше — к архивам поместья.' : 'The trail now leads deeper into the estate archives.', 14, '#b9c0ca').setWordWrapWidth(540);
      button(this, 906, 590, this.locale === 'ru' ? 'На аукцион' : 'Back to auction', () => this.scene.start('auction'), { width: 260, height: 52, background: VISUAL.rare });
      return;
    }

    const isActive = progress.activeMissionId === mission.id;
    const completedCount = CAMPAIGN_MISSIONS.filter((m) => m.chapterId === 'first-flip' && progress.completedMissionIds.includes(m.id)).length;
    this.label(610, 286, mission.title[this.locale], 25, '#f7f3e8', 'bold').setWordWrapWidth(500);
    addChip(this, 1102, 300, `${mission.order}/4`, VISUAL.warm, { width: 84, height: 28, filled: true, fontSize: 10 });
    this.label(610, 332, mission.briefing[this.locale], 13, '#aeb5c0').setWordWrapWidth(560).setLineSpacing(4);

    this.label(610, 412, this.locale === 'ru' ? 'ЦЕЛЬ' : 'OBJECTIVE', 10, '#d6a45f', 'bold');
    this.label(610, 434, mission.objective.description[this.locale], 15, '#f0e2c4', 'bold').setWordWrapWidth(550);
    addProgressBar(this, 610, 484, 556, completedCount / 4, VISUAL.warm);
    this.label(610, 498, this.locale === 'ru' ? `Глава I: ${completedCount}/4` : `Chapter I: ${completedCount}/4`, 10, VISUAL.faint, 'bold');
    this.label(610, 532, this.locale === 'ru' ? 'НАГРАДА' : 'REWARD', 9, VISUAL.faint, 'bold');
    this.label(610, 552, `${this.money(mission.rewardCash)}  ·  +${mission.rewardRep} REP`, 14, '#f0c969', 'bold');

    if (this.feedback) this.label(610, 616, this.feedback, 11, '#e9b949', 'bold').setWordWrapWidth(380);

    if (!isActive) {
      button(this, 1036, 588, this.locale === 'ru' ? 'Начать задание' : 'Start mission', () => {
        this.feedback = null;
        this.campaign.startMission(mission.id);
        this.render();
      }, { width: 260, height: 54, background: VISUAL.warm, accent: 0xffd260, foreground: '#111318' });
      return;
    }

    this.renderMissionActions(mission, save.auctionsPlayed, save.auctionsWon);
  }

  private renderMissionActions(mission: CampaignMission, auctionsPlayed: number, auctionsWon: number): void {
    if (mission.objective.type === 'play-auction') {
      if (auctionsPlayed > 0) {
        button(this, 1036, 588, this.locale === 'ru' ? 'Завершить задание' : 'Complete mission', () => this.complete(mission.id), { width: 260, height: 54, background: VISUAL.success });
      } else {
        button(this, 1036, 588, this.locale === 'ru' ? 'Идти на торги' : 'Go to auction', () => this.scene.start('auction'), { width: 260, height: 54, background: VISUAL.rare });
      }
      return;
    }

    if (mission.objective.type === 'win-auction') {
      if (auctionsWon > 0) {
        button(this, 1036, 588, this.locale === 'ru' ? 'Отчитаться Виктору' : 'Report to Victor', () => this.complete(mission.id), { width: 260, height: 54, background: VISUAL.success });
      } else {
        button(this, 1036, 588, this.locale === 'ru' ? 'Выиграть лот' : 'Win a lot', () => this.scene.start('auction'), { width: 260, height: 54, background: VISUAL.rare });
      }
      return;
    }

    if (mission.objective.type === 'keep-evidence') {
      this.add.image(1090, 418, 'evidence-black-seal').setDisplaySize(190, 125);
      button(this, 760, 600, this.locale === 'ru' ? 'Показать Виктору' : 'Show Victor', () => {
        this.campaign.chooseBranch('show-victor-black-seal', 'npc-0', { trust: 8, debt: 1 });
        this.complete(mission.id);
      }, { width: 230, height: 50, background: VISUAL.copper, accent: VISUAL.warm, fontSize: 11 });
      button(this, 1010, 600, this.locale === 'ru' ? 'Оставить в тайне' : 'Keep it private', () => {
        this.campaign.chooseBranch('hide-black-seal-from-victor', 'npc-0', { rivalry: 6 });
        this.complete(mission.id);
      }, { width: 230, height: 50, background: 0x29313b, accent: VISUAL.purple, fontSize: 11 });
      return;
    }

    if (mission.objective.type === 'select-evidence-lot') {
      const options = [
        { id: '12-A', good: false, hint: this.locale === 'ru' ? 'Фарфор · без архивной отметки' : 'Porcelain · no archive mark' },
        { id: '47-B', good: true, hint: this.locale === 'ru' ? 'Бумаги · чёрная печать' : 'Papers · black seal' },
        { id: '83-C', good: false, hint: this.locale === 'ru' ? 'Инструменты · складская бирка' : 'Tools · warehouse tag' },
      ];
      options.forEach((option, index) => {
        const x = 650 + index * 182;
        button(this, x + 78, 602, `${option.id}\n${option.hint}`, () => {
          if (option.good) {
            this.feedback = this.locale === 'ru' ? 'Совпадение найдено: 47-Б.' : 'Match found: 47-B.';
            this.complete(mission.id);
          } else {
            this.feedback = this.locale === 'ru' ? 'Не сходится с уликой. Попробуйте другой лот.' : 'It does not match the evidence. Try another lot.';
            this.render();
          }
        }, { width: 164, height: 64, background: option.good ? 0x3a3021 : 0x252b32, accent: option.good ? VISUAL.warm : 0x68717d, fontSize: 9 });
      });
    }
  }

  private complete(missionId: string): void {
    this.feedback = null;
    this.campaign.completeMission(missionId);
    this.render();
  }

  private label(x: number, y: number, value: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.add.text(x, y, value, { fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, fontStyle: style, color });
  }

  private money(value: number): string {
    return `${Math.round(value).toLocaleString(this.locale === 'ru' ? 'ru-RU' : 'en-US')} ₽`;
  }

  private hex(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
