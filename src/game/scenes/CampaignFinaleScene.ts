import Phaser from 'phaser';
import { acquireFinaleLot, createFinaleState, FINALE_LOTS, finaleReady, remainingFinaleBudget, resolveCampaignEpilogue, type FinaleState } from '../../domain/campaignFinale';
import { getPlatformLocale } from '../../platform/yandex';
import { CampaignStore } from '../campaignStore';
import { button } from '../ui';
import { addAtmosphere, addSurface, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;

const LABELS: Record<string, { ru: string; en: string; detailRu: string; detailEn: string }> = {
  'veyr-master-ledger': { ru: 'Главный реестр', en: 'Master Ledger', detailRu: 'Доказательство · ключ к происхождению', detailEn: 'Evidence · provenance key' },
  'veyr-portrait-case': { ru: 'Портретный кофр', en: 'Portrait Case', detailRu: 'Дорогой лот · чистая маржа', detailEn: 'High-value lot · pure margin' },
  'veyr-cipher-cabinet': { ru: 'Шифровальный шкаф', en: 'Cipher Cabinet', detailRu: 'Доказательство · последние страницы', detailEn: 'Evidence · final pages' },
  'veyr-chronometer': { ru: 'Хронометр Вейра', en: "Veyr's Chronometer", detailRu: 'Редкость · максимальная перепродажа', detailEn: 'Rarity · maximum resale' },
};

export class CampaignFinaleScene extends Phaser.Scene {
  private readonly campaign = new CampaignStore();
  private locale: 'ru' | 'en' = 'en';
  private state: FinaleState = createFinaleState();
  private resolved = false;

  constructor() {
    super('campaign-finale');
  }

  preload(): void {
    this.load.svg('campaign-veyr-estate', 'assets/campaign/campaign-veyr-estate.svg');
    this.load.svg('veyr-master-ledger', 'assets/campaign/veyr-master-ledger.svg');
    this.load.svg('veyr-portrait-case', 'assets/campaign/veyr-portrait-case.svg');
    this.load.svg('veyr-cipher-cabinet', 'assets/campaign/veyr-cipher-cabinet.svg');
    this.load.svg('veyr-chronometer', 'assets/campaign/veyr-chronometer.svg');
  }

  create(): void {
    this.locale = getPlatformLocale();
    const save = this.campaign.snapshot;
    if (save.campaign.completed && save.campaign.epilogueId) {
      this.renderEpilogue(save.campaign.epilogueId);
      return;
    }
    if (save.campaign.activeMissionId !== 'lost-collection-finale') {
      this.scene.start('campaign');
      return;
    }
    this.restoreAttempt();
    this.renderAuction();
  }

  private restoreAttempt(): void {
    const choices = new Set(this.campaign.progress.branchChoiceIds);
    let state = createFinaleState();
    for (const lot of FINALE_LOTS) {
      if (!choices.has(`finale-pick:${lot.id}`)) continue;
      const result = acquireFinaleLot(state, lot);
      if (result.ok) state = result.state;
    }
    this.state = state;
  }

  private renderAuction(): void {
    this.children.removeAll(true);
    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.warm, 1100);
    this.add.image(640, 360, 'campaign-veyr-estate').setDisplaySize(1280, 720).setAlpha(0.72);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x07090c, 0.52).setOrigin(0);
    this.add.text(52, 34, this.locale === 'ru' ? 'ГЛАВА V · ПОТЕРЯННАЯ КОЛЛЕКЦИЯ' : 'CHAPTER V · THE LOST COLLECTION', {
      fontFamily: 'Arial, sans-serif', fontSize: '26px', fontStyle: 'bold', color: '#f0c969',
    });
    this.add.text(52, 74, this.locale === 'ru'
      ? 'Четыре последних лота. Один общий бюджет. Купить всё невозможно.'
      : 'Four final lots. One shared budget. You cannot buy everything.', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#bdc4cf',
    });
    this.add.text(1035, 45, `${this.locale === 'ru' ? 'БЮДЖЕТ' : 'BUDGET'}\n${remainingFinaleBudget(this.state).toLocaleString()} ₽`, {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#63d28d', align: 'right',
    }).setOrigin(1, 0);

    FINALE_LOTS.forEach((lot, index) => this.renderLot(lot, index));

    const ready = finaleReady(this.state);
    this.add.text(52, 650, ready
      ? (this.locale === 'ru' ? 'Можно закрыть торги сейчас. Остальные лоты уйдут соперникам.' : 'You can close the auction now. Remaining lots go to rivals.')
      : (this.locale === 'ru' ? 'Нужно выбрать минимум два лота.' : 'Choose at least two lots before resolving the finale.'), {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: ready ? '#e9b949' : '#8f98a4',
    });
    button(this, 1090, 660, this.locale === 'ru' ? 'Закрыть финал' : 'Resolve finale', () => this.resolve(), {
      width: 260, height: 52, disabled: !ready, background: ready ? VISUAL.warm : 0x333941, accent: 0xffd260, foreground: ready ? '#111318' : '#7b838d', fontSize: 11,
    });
    button(this, 820, 660, this.locale === 'ru' ? 'Сбросить выбор' : 'Reset picks', () => {
      this.campaign.resetBranchChoices('finale-pick:');
      this.state = createFinaleState();
      this.renderAuction();
    }, { width: 210, height: 42, background: 0x2b3036, accent: 0x6c7681, fontSize: 10 });
  }

  private renderLot(lot: (typeof FINALE_LOTS)[number], index: number): void {
    const x = 52 + index * 300;
    const y = 150;
    const picked = this.state.acquiredLotIds.includes(lot.id);
    const affordable = this.state.spent + lot.price <= this.state.budget;
    addSurface(this, x, y, 276, 438, { fill: picked ? 0x2b2419 : 0x15191e, accent: picked ? VISUAL.warm : (lot.kind === 'evidence' ? VISUAL.copper : VISUAL.rare), strokeAlpha: picked ? 0.65 : 0.28, glowAlpha: picked ? 0.024 : 0.008 });
    this.add.image(x + 138, y + 112, lot.id).setDisplaySize(225, 148);
    const copy = LABELS[lot.id]!;
    this.add.text(x + 18, y + 210, this.locale === 'ru' ? copy.ru : copy.en, { fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#f7f3e8' }).setWordWrapWidth(240);
    this.add.text(x + 18, y + 252, this.locale === 'ru' ? copy.detailRu : copy.detailEn, { fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#9da6b1' }).setWordWrapWidth(236);
    this.add.text(x + 18, y + 302, `${lot.price.toLocaleString()} ₽`, { fontFamily: 'Arial, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#e9b949' });
    this.add.text(x + 18, y + 334, lot.kind === 'evidence'
      ? (this.locale === 'ru' ? 'СЮЖЕТ / ДОКАЗАТЕЛЬСТВО' : 'STORY / EVIDENCE')
      : (this.locale === 'ru' ? 'ЦЕННОСТЬ / ПРИБЫЛЬ' : 'VALUE / PROFIT'), { fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: lot.kind === 'evidence' ? '#d6a45f' : '#8fc3ff' });
    button(this, x + 138, y + 394, picked ? (this.locale === 'ru' ? 'Выбрано' : 'Acquired') : (this.locale === 'ru' ? 'Забрать лот' : 'Acquire lot'), () => {
      if (picked || !affordable) return;
      const result = acquireFinaleLot(this.state, lot);
      if (!result.ok) return;
      this.state = result.state;
      this.campaign.chooseBranch(`finale-pick:${lot.id}`);
      this.renderAuction();
    }, { width: 230, height: 46, disabled: picked || !affordable, background: picked ? 0x4c4128 : 0x2d3945, accent: picked ? VISUAL.warm : VISUAL.rare, fontSize: 10 });
  }

  private resolve(): void {
    if (!finaleReady(this.state) || this.resolved) return;
    this.resolved = true;
    const epilogueId = resolveCampaignEpilogue(this.state, this.campaign.progress);
    this.campaign.finishCampaign(epilogueId, this.state.acquiredLotIds);
    this.renderEpilogue(epilogueId);
  }

  private renderEpilogue(epilogueId: string): void {
    this.children.removeAll(true);
    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.warm, 1100);
    this.add.image(640, 360, 'campaign-veyr-estate').setDisplaySize(1280, 720).setAlpha(0.48);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x07090c, 0.66).setOrigin(0);
    const copy = this.epilogueCopy(epilogueId);
    this.add.text(640, 150, this.locale === 'ru' ? 'ДЕЛО ЗАКРЫТО' : 'CASE CLOSED', { fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#d6a45f' }).setOrigin(0.5);
    this.add.text(640, 205, copy.title, { fontFamily: 'Georgia, serif', fontSize: '36px', fontStyle: 'bold', color: '#f0c969', align: 'center' }).setOrigin(0.5);
    this.add.text(640, 282, copy.body, { fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#c0c7d0', align: 'center', lineSpacing: 7, wordWrap: { width: 720 } }).setOrigin(0.5, 0);
    this.add.text(640, 480, this.locale === 'ru' ? '+5 000 ₽  ·  +300 REP\nEndless Dealer Career открыт. Экономика, коллекция и P8-системы сохранены.' : '+5,000 ₽  ·  +300 REP\nEndless Dealer Career unlocked. Economy, collection and P8 systems remain intact.', { fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#63d28d', align: 'center', lineSpacing: 5 }).setOrigin(0.5);
    button(this, 640, 592, this.locale === 'ru' ? 'Продолжить карьеру' : 'Continue Dealer Career', () => this.scene.start('auction'), { width: 330, height: 58, background: VISUAL.warm, accent: 0xffd260, foreground: '#111318', fontSize: 12 });
  }

  private epilogueCopy(id: string): { title: string; body: string } {
    if (id === 'shared-truth') return this.locale === 'ru'
      ? { title: 'Истина разделена', body: 'Вы восстановили обе ключевые части реестра и не сожгли все мосты. История коллекции Вейра становится общей валютой доверия, а не товаром одного дилера.' }
      : { title: 'The Shared Truth', body: "You recovered both key ledger pieces without burning every bridge. Veyr's history becomes shared leverage rather than one dealer's private commodity." };
    if (id === 'ledger-restored') return this.locale === 'ru'
      ? { title: 'Реестр восстановлен', body: 'Обе доказательные части у вас. Вы можете восстановить происхождение коллекции почти целиком, но дорога к этому стоила союзов.' }
      : { title: 'The Ledger Restored', body: 'Both evidence pieces are yours. The collection can be reconstructed almost completely, though the path cost you alliances.' };
    if (id === 'dealer-king') return this.locale === 'ru'
      ? { title: 'Король сделки', body: 'Вы выбрали самые ликвидные сокровища и позволили истории уйти другим. В финансовом смысле это лучший вечер вашей карьеры.' }
      : { title: 'Dealer King', body: 'You took the most liquid treasures and let the historical record pass to others. Financially, it is the strongest night of your career.' };
    return this.locale === 'ru'
      ? { title: 'Незаконченный реестр', body: 'Вы вынесли достаточно, чтобы доказать существование коллекции, но не достаточно, чтобы закрыть все пробелы. Некоторые страницы останутся предметом слухов.' }
      : { title: 'The Unfinished Ledger', body: 'You recovered enough to prove the collection existed, but not enough to close every gap. Some pages remain dealer folklore.' };
  }
}
