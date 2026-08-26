import Phaser from 'phaser';
import { CAMPAIGN_CHAPTERS, CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS, type CampaignMission } from '../../data/campaign';
import { campaignMissionAvailable, campaignMissionById } from '../../domain/campaign';
import {
  bestClosedCircleSponsor,
  closedCirclePreviewComplete,
  closedCircleSponsorOptions,
  createClosedCirclePreview,
  inspectClosedCircleItem,
  resolveClosedCircleSealedBid,
} from '../../domain/campaignClosedCircle';
import {
  buyLinkedBudgetOffer,
  createLinkedBudgetState,
  linkedBudgetMissionComplete,
  linkedBudgetRemaining,
  type LinkedBudgetOffer,
} from '../../domain/campaignLinkedBudget';
import {
  evaluateCounterfeitSelection,
  resolveFinaleRoute,
  resolveProxyBidAllocation,
  resolveRestorationTrace,
  type FinaleRouteId,
} from '../../domain/campaignMidgame';
import type { Locale } from '../../domain/types';
import { getPlatformLocale } from '../../platform/yandex';
import { CampaignStore } from '../campaignStore';
import { button } from '../ui';
import { addAtmosphere, addChip, addProgressBar, addSurface, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;
const CHAPTER_TWO_OFFERS: readonly LinkedBudgetOffer[] = [
  { id: 'decorative-decoy', price: 2600, target: false },
  { id: 'estate-ledger-box', price: 3100, target: true },
  { id: 'estate-photo-box', price: 2800, target: true },
];
const CLOSED_CIRCLE_PREVIEW_ITEMS = [
  { id: 'silver-mask', clueStrength: 1, linkedToVeyr: false },
  { id: 'ledger-frame', clueStrength: 3, linkedToVeyr: true },
  { id: 'bronze-clock', clueStrength: 1, linkedToVeyr: false },
  { id: 'ivory-catalogue', clueStrength: 3, linkedToVeyr: true },
  { id: 'lacquer-box', clueStrength: 2, linkedToVeyr: false },
] as const;
const COUNTERFEIT_OPTIONS = [
  { id: 'folder-17', ru: 'Папка 17\nстарая бумага · чёрный воск', en: 'Folder 17\naged paper · black wax' },
  { id: 'blue-certificate', ru: 'Синий сертификат\nновая бумага · верный штамп', en: 'Blue certificate\nnew paper · correct stamp' },
  { id: 'wax-card-c', ru: 'Карточка C\nчёрный воск · микрометка C-17', en: 'Card C\nblack wax · C-17 micro-mark' },
  { id: 'linen-folder', ru: 'Льняная папка\nстарая бумага · красный воск', en: 'Linen folder\naged paper · red wax' },
] as const;

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
    this.load.svg('private-invitation', 'assets/campaign/private-invitation.svg');
    this.load.svg('provenance-folder', 'assets/campaign/provenance-folder.svg');
    this.load.svg('closed-circle-room', 'assets/campaign/closed-circle-room.svg');
    this.load.svg('sealed-bid-card', 'assets/campaign/sealed-bid-card.svg');
    this.load.svg('circle-sponsor-token', 'assets/campaign/circle-sponsor-token.svg');
    this.load.svg('evidence-restored-serial', 'assets/campaign/evidence-restored-serial.svg');
    this.load.svg('campaign-records-basement', 'assets/campaign/campaign-records-basement.svg');
    this.load.svg('dealer-proxy-sheet', 'assets/campaign/dealer-proxy-sheet.svg');
    this.load.svg('counterfeit-table', 'assets/campaign/counterfeit-table.svg');
    this.load.svg('final-route-map', 'assets/campaign/final-route-map.svg');
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
    this.label(52, 68, this.locale === 'ru'
      ? 'След исчезнувшего коллекционера Вейра проходит через распродажи, сделки и закрытые аукционы.'
      : "The trail of vanished collector Veyr runs through clearances, deals and invitation auctions.", 13, '#aeb5c0').setWordWrapWidth(730);
    addChip(this, 870, 45, `${Math.floor(save.reputationXp)} REP`, VISUAL.rare, { width: 116, height: 30, filled: true, fontSize: 11 });
    addChip(this, 1000, 45, this.money(save.cash), VISUAL.success, { width: 132, height: 30, filled: true, fontSize: 11 });
    button(this, 1175, 50, this.locale === 'ru' ? 'Аукцион' : 'Auction', () => this.scene.start('auction'), {
      width: 150, height: 44, background: VISUAL.rare, accent: 0x8fc3ff, fontSize: 12,
    });
  }

  private renderChapterRail(): void {
    const progress = this.campaign.progress;
    const y = 126;
    CAMPAIGN_CHAPTERS.forEach((chapter, index) => {
      const chapterMissions = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === chapter.id);
      const completed = chapterMissions.filter((mission) => progress.completedMissionIds.includes(mission.id)).length;
      const first = chapterMissions[0];
      const authored = chapterMissions.length > 0;
      const unlocked = authored && Boolean(first && (
        progress.completedMissionIds.includes(first.id)
        || campaignMissionAvailable(first, progress)
        || progress.activeMissionId === first.id
      ));
      const active = unlocked && completed < chapterMissions.length;
      const accent = active ? VISUAL.warm : completed > 0 && completed === chapterMissions.length ? VISUAL.success : 0x4d5661;
      const x = 54 + index * 238;
      addSurface(this, x, y, 214, 82, { fill: VISUAL.panelDeep, accent, strokeAlpha: active ? 0.38 : 0.16, glowAlpha: active ? 0.02 : 0.006 });
      this.label(x + 14, y + 12, `0${chapter.order}`, 10, this.hex(accent), 'bold');
      this.label(x + 14, y + 29, chapter.title[this.locale].replace(/^.*—\s*/, ''), 13, '#f7f3e8', 'bold').setWordWrapWidth(178);
      this.label(x + 14, y + 57, unlocked ? `${completed}/${chapterMissions.length}` : (this.locale === 'ru' ? 'Закрыто' : 'Locked'), 9, unlocked ? '#b9c0ca' : '#707985', 'bold');
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
      this.label(142, 428, this.locale === 'ru' ? 'Первая настоящая улика появится в третьем задании.' : 'The first hard evidence appears in mission three.', 12, '#7d7568').setWordWrapWidth(320);
      return;
    }

    evidence.slice(-2).forEach((entry, index) => {
      const y = 318 + index * 162;
      this.add.image(158, y + 69, entry.artId).setDisplaySize(146, 112);
      this.label(250, y + 16, entry.title[this.locale], 15, '#f2e2bd', 'bold').setWordWrapWidth(278);
      this.label(250, y + 48, entry.description[this.locale], 11, '#aa9c82').setWordWrapWidth(274).setLineSpacing(3);
      this.add.line(250, y + 112, 0, 0, 230, 0, 0x8a2b2b, 0.45).setOrigin(0);
    });
  }

  private renderMissionPanel(): void {
    const save = this.campaign.snapshot;
    const progress = save.campaign;
    const mission = campaignMissionById(CAMPAIGN_MISSIONS, progress.activeMissionId) ?? this.campaign.nextMission();
    addSurface(this, 586, 232, 642, 432, { fill: VISUAL.panelDeep, accent: VISUAL.warm, strokeAlpha: 0.28, glowAlpha: 0.014 });
    this.label(610, 250, this.locale === 'ru' ? 'ТЕКУЩЕЕ ДЕЛО' : 'CURRENT CASE', 11, VISUAL.faint, 'bold');

    if (!mission) {
      const completed = progress.completed;
      this.label(610, 304, completed
        ? (this.locale === 'ru' ? 'Кампания завершена' : 'Campaign complete')
        : (this.locale === 'ru' ? 'Доступные главы завершены' : 'Available chapters complete'), 27, '#f0c969', 'bold');
      this.label(610, 352, completed
        ? (this.locale === 'ru' ? 'Чёрный реестр закрыт. Системный endgame остаётся доступен без сброса прогресса.' : 'The Black Ledger is closed. Systemic endgame remains available without resetting progress.')
        : (this.locale === 'ru' ? 'Новые главы продолжат тот же сохранённый след.' : 'New chapters will continue from this same persistent trail.'), 14, '#b9c0ca').setWordWrapWidth(540);
      return;
    }

    const chapterMissions = CAMPAIGN_MISSIONS.filter((m) => m.chapterId === mission.chapterId);
    const completedCount = chapterMissions.filter((m) => progress.completedMissionIds.includes(m.id)).length;
    const isActive = progress.activeMissionId === mission.id;
    this.label(610, 286, mission.title[this.locale], 25, '#f7f3e8', 'bold').setWordWrapWidth(500);
    addChip(this, 1102, 300, `${mission.order}/${chapterMissions.length}`, VISUAL.warm, { width: 84, height: 28, filled: true, fontSize: 10 });
    this.label(610, 332, mission.briefing[this.locale], 13, '#aeb5c0').setWordWrapWidth(560).setLineSpacing(4);
    this.label(610, 412, this.locale === 'ru' ? 'ЦЕЛЬ' : 'OBJECTIVE', 10, '#d6a45f', 'bold');
    this.label(610, 434, mission.objective.description[this.locale], 15, '#f0e2c4', 'bold').setWordWrapWidth(550);
    addProgressBar(this, 610, 484, 556, completedCount / Math.max(1, chapterMissions.length), VISUAL.warm);
    this.label(610, 498, `${CAMPAIGN_CHAPTERS.find((c) => c.id === mission.chapterId)?.title[this.locale] ?? ''}: ${completedCount}/${chapterMissions.length}`, 10, VISUAL.faint, 'bold');
    this.label(610, 532, this.locale === 'ru' ? 'НАГРАДА' : 'REWARD', 9, VISUAL.faint, 'bold');
    this.label(610, 552, mission.rewardCash || mission.rewardRep ? `${this.money(mission.rewardCash)}  ·  +${mission.rewardRep} REP` : (this.locale === 'ru' ? 'Награда выдаётся после финального аукциона' : 'Reward resolves after the final auction'), 14, '#f0c969', 'bold');
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
    const progress = this.campaign.progress;
    const playedBaseline = progress.missionBaselineAuctionsPlayed[mission.id] ?? auctionsPlayed;
    const wonBaseline = progress.missionBaselineAuctionsWon[mission.id] ?? auctionsWon;

    if (mission.objective.type === 'play-auction') {
      const target = mission.objective.target ?? 1;
      const gained = Math.max(0, auctionsPlayed - playedBaseline);
      if (gained >= target) this.completeButton(mission.id);
      else this.auctionButton(`${this.locale === 'ru' ? 'После старта' : 'Since start'}: ${gained}/${target}`);
      return;
    }
    if (mission.objective.type === 'win-auction') {
      const target = mission.objective.target ?? 1;
      const gained = Math.max(0, auctionsWon - wonBaseline);
      if (gained >= target) this.completeButton(mission.id, this.locale === 'ru' ? 'Закрыть задание' : 'Close mission');
      else this.auctionButton(`${this.locale === 'ru' ? 'Побед после старта' : 'Wins since start'}: ${gained}/${target}`);
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
      this.renderEvidenceLotChoice(mission);
      return;
    }
    if (mission.objective.type === 'linked-budget') {
      this.renderLinkedBudgetMission(mission);
      return;
    }
    if (mission.objective.type === 'appraise-evidence') {
      this.renderForgeryMission(mission);
      return;
    }
    if (mission.objective.type === 'restoration-trace') {
      this.renderRestorationTraceMission(mission);
      return;
    }
    if (mission.objective.type === 'track-rival') {
      this.renderDealerLeakMission(mission);
      return;
    }
    if (mission.objective.type === 'branch-choice') {
      this.renderDealerAllyMission(mission);
      return;
    }
    if (mission.objective.type === 'negotiate') {
      this.renderMiraNegotiation(mission);
      return;
    }
    if (mission.objective.type === 'proxy-bid') {
      this.renderProxyBidMission(mission);
      return;
    }
    if (mission.objective.type === 'rival-deal') {
      this.renderAntonDealMission(mission);
      return;
    }
    if (mission.objective.type === 'limited-preview') {
      this.renderClosedCirclePreview(mission);
      return;
    }
    if (mission.objective.type === 'sealed-bid') {
      this.renderClosedCircleSealedBid(mission);
      return;
    }
    if (mission.objective.type === 'relationship-gate') {
      this.renderClosedCircleSponsor(mission);
      return;
    }
    if (mission.objective.type === 'counterfeit-table') {
      this.renderCounterfeitTable(mission);
      return;
    }
    if (mission.objective.type === 'route-plan') {
      this.renderFinaleRoute(mission);
      return;
    }
    if (mission.objective.type === 'finale-prep') {
      this.renderFinalePrep(mission);
      return;
    }
    if (mission.objective.type === 'finale') this.renderFinaleMission();
  }

  private renderEvidenceLotChoice(mission: CampaignMission): void {
    const options = mission.id === 'estate-paper-trail'
      ? [
        { id: '31-C', good: false, hint: this.locale === 'ru' ? 'Сервиз · новая этикетка' : 'China · recent label' },
        { id: '47-B/2', good: true, hint: this.locale === 'ru' ? 'Фотоархив · та же нумерация' : 'Photo archive · matching number' },
        { id: '66-A', good: false, hint: this.locale === 'ru' ? 'Часы · без архивной связи' : 'Watches · no archive link' },
      ]
      : mission.id === 'dealer-war-address'
        ? [
          { id: 'NORTH-8', good: false, hint: this.locale === 'ru' ? 'идеальная печать' : 'perfect print' },
          { id: 'YARD-17', good: true, hint: this.locale === 'ru' ? 'сдвоенная точка в рамке' : 'double-dot frame defect' },
          { id: 'HALL-4', good: false, hint: this.locale === 'ru' ? 'другой картон' : 'different card stock' },
        ]
        : mission.id === 'closed-circle-ledger-room'
          ? [
            { id: 'B-12', good: false, hint: this.locale === 'ru' ? 'буква не совпадает с жетоном' : 'letter conflicts with token' },
            { id: 'C-17', good: true, hint: this.locale === 'ru' ? 'код + список + жетон' : 'code + list + token' },
            { id: 'C-71', good: false, hint: this.locale === 'ru' ? 'цифры переставлены' : 'digits reversed' },
          ]
          : [
            { id: '12-A', good: false, hint: this.locale === 'ru' ? 'Фарфор · без архивной отметки' : 'Porcelain · no archive mark' },
            { id: '47-B', good: true, hint: this.locale === 'ru' ? 'Бумаги · чёрная печать' : 'Papers · black seal' },
            { id: '83-C', good: false, hint: this.locale === 'ru' ? 'Инструменты · складская бирка' : 'Tools · warehouse tag' },
          ];
    options.forEach((option, index) => {
      const x = 650 + index * 182;
      button(this, x + 78, 602, `${option.id}\n${option.hint}`, () => {
        if (option.good) this.complete(mission.id);
        else {
          this.feedback = this.locale === 'ru' ? 'Улика не сходится. Цена ошибки — потерянное время, не скрытый штраф.' : 'The clue does not match. The cost is time, not a hidden penalty.';
          this.render();
        }
      }, { width: 164, height: 64, background: option.good ? 0x3a3021 : 0x252b32, accent: option.good ? VISUAL.warm : 0x68717d, fontSize: 9 });
    });
  }

  private renderLinkedBudgetMission(mission: CampaignMission): void {
    const budget = mission.objective.budget ?? 6200;
    let state = createLinkedBudgetState(budget);
    const choices = new Set(this.campaign.progress.branchChoiceIds);
    for (const offer of CHAPTER_TWO_OFFERS) {
      if (!choices.has(`linked-buy:${offer.id}`)) continue;
      const decision = buyLinkedBudgetOffer(state, offer);
      if (decision.ok) state = decision.state;
    }
    const required = mission.objective.targetIds ?? [];
    if (linkedBudgetMissionComplete(state, required)) {
      this.label(610, 582, `${this.locale === 'ru' ? 'Потрачено' : 'Spent'}: ${this.money(state.spent)} / ${this.money(budget)}`, 11, '#63d28d', 'bold');
      this.completeButton(mission.id);
      return;
    }

    const remaining = linkedBudgetRemaining(state);
    const requiredRemainingCost = CHAPTER_TWO_OFFERS
      .filter((offer) => required.includes(offer.id) && !choices.has(`linked-buy:${offer.id}`))
      .reduce((sum, offer) => sum + offer.price, 0);
    const deadEnd = requiredRemainingCost > remaining;

    this.label(610, 578, `${this.locale === 'ru' ? 'Остаток бюджета' : 'Budget left'}: ${this.money(remaining)}`, 11, deadEnd ? '#ff8d85' : '#e9b949', 'bold');
    const labels: Record<string, string> = this.locale === 'ru'
      ? { 'decorative-decoy': 'Витринный набор\n2 600 ₽', 'estate-ledger-box': 'Архивная коробка\n3 100 ₽', 'estate-photo-box': 'Фото-коробка\n2 800 ₽' }
      : { 'decorative-decoy': 'Display set\n2,600 ₽', 'estate-ledger-box': 'Archive box\n3,100 ₽', 'estate-photo-box': 'Photo box\n2,800 ₽' };
    CHAPTER_TWO_OFFERS.forEach((offer, index) => {
      const bought = choices.has(`linked-buy:${offer.id}`);
      const affordable = state.spent + offer.price <= budget;
      button(this, 690 + index * 182, 624, bought ? (this.locale === 'ru' ? 'Куплено' : 'Bought') : labels[offer.id]!, () => {
        if (bought || !affordable) return;
        this.campaign.chooseBranch(`linked-buy:${offer.id}`);
        this.render();
      }, { width: 166, height: 60, disabled: bought || !affordable, background: offer.target ? 0x3a3021 : 0x342932, accent: offer.target ? VISUAL.warm : VISUAL.purple, fontSize: 9 });
    });

    if (deadEnd) {
      this.label(610, 598, this.locale === 'ru' ? 'Бюджета уже не хватает на обе целевые коробки.' : 'The remaining budget can no longer cover both target boxes.', 9, '#ff8d85', 'bold').setWordWrapWidth(360);
      button(this, 1110, 576, this.locale === 'ru' ? 'Начать заново' : 'Reset attempt', () => {
        this.campaign.resetBranchChoices('linked-buy:');
        this.feedback = null;
        this.render();
      }, { width: 190, height: 34, background: 0x4a2b2b, accent: 0xc35d54, fontSize: 9 });
    }
  }

  private renderForgeryMission(mission: CampaignMission): void {
    this.add.image(1090, 420, 'provenance-folder').setDisplaySize(195, 118);
    this.label(610, 576, this.locale === 'ru' ? 'Сравните бумагу, печать и чернила с найденной уликой.' : 'Compare paper stock, seal and ink against the recovered evidence.', 10, VISUAL.faint).setWordWrapWidth(400);
    button(this, 758, 624, this.locale === 'ru' ? 'Документ настоящий' : 'Document is genuine', () => {
      this.feedback = this.locale === 'ru' ? 'Не сходится: бумага слишком новая, а штамп повторяет форму, но не материал.' : 'Mismatch: the paper is too new and the stamp copies the shape, not the material.';
      this.render();
    }, { width: 250, height: 54, background: 0x29313b, accent: 0x68717d, fontSize: 10 });
    button(this, 1030, 624, this.locale === 'ru' ? 'Это подделка' : 'It is forged', () => this.complete(mission.id), { width: 250, height: 54, background: 0x543127, accent: VISUAL.warm, fontSize: 10 });
  }

  private renderRestorationTraceMission(mission: CampaignMission): void {
    this.add.image(1090, 420, 'evidence-restored-serial').setDisplaySize(195, 118);
    this.label(610, 570, this.locale === 'ru' ? 'Пыль закрывает номер. Сохранить патину важнее, чем сделать металл блестящим.' : 'Dust hides the serial. Preserving patina matters more than making the brass shine.', 10, VISUAL.faint).setWordWrapWidth(400);
    const methods = [
      { id: 'dry-brush' as const, ru: 'Сухая кисть', en: 'Dry brush' },
      { id: 'solvent-wash' as const, ru: 'Растворитель', en: 'Solvent wash' },
      { id: 'abrasive-polish' as const, ru: 'Абразивная полировка', en: 'Abrasive polish' },
    ];
    methods.forEach((method, index) => {
      button(this, 710 + index * 202, 624, this.locale === 'ru' ? method.ru : method.en, () => {
        const result = resolveRestorationTrace(method.id);
        if (result.revealedSerial && result.preservedEvidence) {
          this.campaign.chooseBranch(`restoration-trace:${method.id}`);
          this.complete(mission.id);
          return;
        }
        this.feedback = result.preservedEvidence
          ? (this.locale === 'ru' ? 'Патина цела, но растворитель не проявил слабую гравировку. Попробуйте менее влажный метод.' : 'The patina survives, but the wash does not reveal the faint engraving. Try a drier method.')
          : (this.locale === 'ru' ? 'Полировка сняла верхний слой вместе со следом. Это тренировочная попытка — выберите безопаснее.' : 'Polishing removes the surface along with the trace. This practice attempt resets — choose a safer method.');
        this.render();
      }, { width: 184, height: 52, background: method.id === 'dry-brush' ? 0x3a3021 : 0x29313b, accent: method.id === 'dry-brush' ? VISUAL.warm : 0x68717d, fontSize: 9 });
    });
  }

  private renderMiraNegotiation(mission: CampaignMission): void {
    const cash = this.campaign.snapshot.cash;
    this.add.image(1090, 420, 'private-invitation').setDisplaySize(195, 118);
    this.label(610, 574, this.locale === 'ru' ? 'Выбор сохранится и позже изменит помощь или давление Миры.' : "This choice persists and will later alter Mira's help or pressure.", 10, VISUAL.faint).setWordWrapWidth(390);
    button(this, 706, 624, this.locale === 'ru' ? 'Заплатить 1 200 ₽' : 'Pay 1,200 ₽', () => {
      if (!this.campaign.payBranchChoice('mira-paid-cash', 1200, 'npc-1', { trust: 6, debt: -4 })) {
        this.feedback = this.locale === 'ru' ? 'Недостаточно денег для этой сделки.' : 'Not enough cash for this deal.';
        this.render();
        return;
      }
      this.complete(mission.id);
    }, { width: 190, height: 54, disabled: cash < 1200, background: 0x3b3020, accent: VISUAL.warm, fontSize: 9 });
    button(this, 910, 624, this.locale === 'ru' ? 'Пообещать услугу' : 'Owe a favor', () => {
      this.campaign.chooseBranch('mira-owed-favor', 'npc-1', { trust: 3, debt: 12 });
      this.complete(mission.id);
    }, { width: 190, height: 54, background: 0x302843, accent: VISUAL.purple, fontSize: 9 });
    button(this, 1114, 624, this.locale === 'ru' ? 'Отказаться' : 'Refuse', () => {
      this.campaign.chooseBranch('mira-refused', 'npc-1', { rivalry: 7 });
      this.complete(mission.id);
    }, { width: 190, height: 54, background: 0x302a2a, accent: 0xc35d54, fontSize: 9 });
  }

  private renderDealerLeakMission(mission: CampaignMission): void {
    this.add.image(1090, 420, 'private-invitation').setDisplaySize(195, 118);
    this.label(610, 574, this.locale === 'ru' ? 'Кто проявил знание, которого у обычного участника ещё не могло быть?' : 'Who showed knowledge that an ordinary attendee could not have had yet?', 10, VISUAL.faint).setWordWrapWidth(390);
    const options = [
      { id: 'npc-0', name: this.locale === 'ru' ? 'Виктор' : 'Victor', good: false },
      { id: 'npc-1', name: this.locale === 'ru' ? 'Мира' : 'Mira', good: false },
      { id: 'npc-2', name: this.locale === 'ru' ? 'Антон' : 'Anton', good: true },
    ];
    options.forEach((option, index) => {
      button(this, 710 + index * 202, 624, option.name, () => {
        if (!option.good) {
          this.feedback = this.locale === 'ru' ? 'Не сходится со временем прибытия. Смотрите, кто пришёл до общей рассылки.' : 'The arrival timing does not fit. Look for who came before the general notice.';
          this.render();
          return;
        }
        this.campaign.chooseBranch('dealer-leak-anton', 'npc-2', { rivalry: 10 });
        this.complete(mission.id);
      }, { width: 184, height: 52, background: option.good ? 0x4a3024 : 0x29313b, accent: option.good ? VISUAL.warm : 0x68717d, fontSize: 10 });
    });
  }

  private renderDealerAllyMission(mission: CampaignMission): void {
    this.label(610, 572, this.locale === 'ru' ? 'Выбор изменит реальные потолки ставок этих дилеров в следующих торгах.' : 'The choice changes these dealers’ real bidding ceilings in later auctions.', 10, VISUAL.faint).setWordWrapWidth(420);
    button(this, 770, 624, this.locale === 'ru' ? 'План Виктора' : "Victor's plan", () => {
      this.campaign.chooseBranch('dealer-ally-victor', 'npc-0', { trust: 14, debt: 6 });
      this.campaign.chooseBranch('dealer-ally-victor-mira-reaction', 'npc-1', { rivalry: 5 });
      this.complete(mission.id);
    }, { width: 260, height: 54, background: 0x3a3021, accent: VISUAL.warm, fontSize: 10 });
    button(this, 1050, 624, this.locale === 'ru' ? 'Ложный адрес Миры' : "Mira's false address", () => {
      this.campaign.chooseBranch('dealer-ally-mira', 'npc-1', { trust: 14, debt: 6 });
      this.campaign.chooseBranch('dealer-ally-mira-victor-reaction', 'npc-0', { rivalry: 5 });
      this.complete(mission.id);
    }, { width: 260, height: 54, background: 0x302843, accent: VISUAL.purple, fontSize: 10 });
  }

  private renderProxyBidMission(mission: CampaignMission): void {
    this.add.image(1090, 420, 'dealer-proxy-sheet').setDisplaySize(200, 126);
    this.label(610, 570, this.locale === 'ru' ? 'Архивный конверт требует около 6 400 ₽. Приманка съедает лимит, но выглядит дороже.' : 'The archive envelope needs roughly 6,400 ₽. The decoy consumes the cap but looks more expensive.', 10, VISUAL.faint).setWordWrapWidth(420);
    const allocations = [
      { targetBid: 6700, decoyBid: 1700 },
      { targetBid: 5200, decoyBid: 4200 },
      { targetBid: 6900, decoyBid: 4300 },
    ];
    allocations.forEach((allocation, index) => {
      const result = resolveProxyBidAllocation(allocation, 6400, 4300, mission.objective.budget ?? 9500);
      const label = `${this.money(allocation.targetBid)} / ${this.money(allocation.decoyBid)}`;
      button(this, 710 + index * 202, 624, label, () => {
        if (result.winsTarget) {
          this.campaign.chooseBranch(`proxy-bid:${allocation.targetBid}:${allocation.decoyBid}`);
          this.complete(mission.id);
          return;
        }
        this.feedback = !result.withinBudget
          ? (this.locale === 'ru' ? 'Сумма двух конвертов превышает общий лимит 9 500 ₽.' : 'The two proxy slips exceed the shared 9,500 ₽ envelope.')
          : (this.locale === 'ru' ? 'Архивный конверт недофинансирован. Приманка забрала слишком большую часть лимита.' : 'The archive slip is underfunded. The decoy consumed too much of the envelope.');
        this.render();
      }, { width: 184, height: 52, background: result.winsTarget ? 0x3a3021 : 0x29313b, accent: result.winsTarget ? VISUAL.warm : 0x68717d, fontSize: 9 });
    });
  }

  private renderAntonDealMission(mission: CampaignMission): void {
    const cash = this.campaign.snapshot.cash;
    this.add.image(1090, 420, 'dealer-proxy-sheet').setDisplaySize(200, 126);
    this.label(610, 570, this.locale === 'ru' ? 'Любой вариант даёт имя. Цена определяет, кем Антон станет в оставшейся кампании.' : 'Every option gets the alias. The price determines what Anton becomes for the rest of the campaign.', 10, VISUAL.faint).setWordWrapWidth(420);
    button(this, 706, 624, this.locale === 'ru' ? '1 800 ₽ сейчас' : '1,800 ₽ now', () => {
      if (!this.campaign.payBranchChoice('anton-paid-cash', 1800, 'npc-2', { trust: 5, rivalry: -4 })) {
        this.feedback = this.locale === 'ru' ? 'Недостаточно денег для контрпредложения.' : 'Not enough cash for the counteroffer.';
        this.render();
        return;
      }
      this.complete(mission.id);
    }, { width: 190, height: 54, disabled: cash < 1800, background: 0x3b3020, accent: VISUAL.warm, fontSize: 9 });
    button(this, 910, 624, this.locale === 'ru' ? 'Будущая услуга' : 'Future favor', () => {
      this.campaign.chooseBranch('anton-owed-favor', 'npc-2', { trust: 2, debt: 12 });
      this.complete(mission.id);
    }, { width: 190, height: 54, background: 0x302843, accent: VISUAL.purple, fontSize: 9 });
    button(this, 1114, 624, this.locale === 'ru' ? 'Взять имя и уйти' : 'Take alias and walk', () => {
      this.campaign.chooseBranch('anton-refused-payment', 'npc-2', { rivalry: 12 });
      this.complete(mission.id);
    }, { width: 190, height: 54, background: 0x302a2a, accent: 0xc35d54, fontSize: 9 });
  }

  private renderClosedCirclePreview(mission: CampaignMission): void {
    const choices = new Set(this.campaign.progress.branchChoiceIds);
    let state = createClosedCirclePreview(mission.objective.maxInspections ?? 3);
    for (const item of CLOSED_CIRCLE_PREVIEW_ITEMS) {
      if (choices.has(`circle-preview:${item.id}`)) state = inspectClosedCircleItem(state, item.id).state;
    }
    const required = mission.objective.targetIds ?? [];
    this.add.image(1092, 416, 'closed-circle-room').setDisplaySize(205, 130);
    this.label(610, 570, `${this.locale === 'ru' ? 'Проверки' : 'Inspections'}: ${state.inspectedIds.length}/${state.maxInspections}`, 10, VISUAL.faint, 'bold');

    if (closedCirclePreviewComplete(state, required)) {
      this.completeButton(mission.id, this.locale === 'ru' ? 'Зафиксировать C-17' : 'Lock in C-17');
      return;
    }

    const visible = CLOSED_CIRCLE_PREVIEW_ITEMS.filter((item) => !choices.has(`circle-preview:${item.id}`)).slice(0, 3);
    visible.forEach((item, index) => {
      button(this, 700 + index * 190, 624, this.previewItemLabel(item.id), () => {
        const decision = inspectClosedCircleItem(state, item.id);
        if (!decision.ok) return;
        this.campaign.chooseBranch(`circle-preview:${item.id}`);
        this.feedback = item.linkedToVeyr
          ? (this.locale === 'ru' ? 'Микрометка C-17 совпадает.' : 'Micro-mark C-17 matches.')
          : (this.locale === 'ru' ? 'Связи с Вейром нет.' : 'No Veyr connection found.');
        this.render();
      }, { width: 174, height: 54, disabled: state.inspectedIds.length >= state.maxInspections, background: item.linkedToVeyr ? 0x3a3021 : 0x29313b, accent: item.linkedToVeyr ? VISUAL.warm : 0x68717d, fontSize: 9 });
    });

    if (state.inspectedIds.length >= state.maxInspections && !closedCirclePreviewComplete(state, required)) {
      button(this, 1110, 570, this.locale === 'ru' ? 'Повторить просмотр' : 'Retry preview', () => {
        this.campaign.resetBranchChoices('circle-preview:');
        this.feedback = null;
        this.render();
      }, { width: 190, height: 34, background: 0x4a2b2b, accent: 0xc35d54, fontSize: 9 });
    }
  }

  private renderClosedCircleSealedBid(mission: CampaignMission): void {
    this.add.image(1090, 416, 'sealed-bid-card').setDisplaySize(200, 127);
    this.label(610, 570, this.locale === 'ru' ? 'Антон оценивает лот примерно в 8 000–8 400 ₽. У вас одна ставка.' : 'Anton appears to value the lot around 8,000–8,400 ₽. You get one bid.', 10, VISUAL.faint).setWordWrapWidth(420);
    const bids = [7800, 8800, 10200];
    bids.forEach((bid, index) => {
      button(this, 710 + index * 202, 624, this.money(bid), () => {
        const result = resolveClosedCircleSealedBid(bid, 8200, mission.objective.budget ?? 9600);
        this.campaign.chooseBranch(`circle-bid:${result.bid}`);
        if (result.won && !result.overpaid) {
          this.complete(mission.id);
          return;
        }
        this.feedback = result.overpaid
          ? (this.locale === 'ru' ? 'Вы выиграли, но переплата нарушает лимит задания. Попытка сброшена.' : 'You won, but the overpay breaks the mission cap. Attempt reset.')
          : (this.locale === 'ru' ? 'Ставка ниже скрытого порога. Антон забирает лот. Попытка сброшена.' : 'Bid below the hidden threshold. Anton takes it. Attempt reset.');
        this.campaign.resetBranchChoices('circle-bid:');
        this.render();
      }, { width: 184, height: 52, background: bid === 8800 ? 0x3a3021 : 0x29313b, accent: bid === 8800 ? VISUAL.warm : 0x68717d, fontSize: 10 });
    });
  }

  private renderClosedCircleSponsor(mission: CampaignMission): void {
    const save = this.campaign.snapshot;
    const options = closedCircleSponsorOptions(save.campaign);
    const best = bestClosedCircleSponsor(options);
    this.add.image(1092, 416, 'circle-sponsor-token').setDisplaySize(136, 136);
    this.label(610, 570, this.locale === 'ru' ? 'Поручительство зависит от старых решений. Без доверия организатор требует денежный залог.' : 'Sponsorship depends on earlier choices. Without trust, the host demands a cash bond.', 10, VISUAL.faint).setWordWrapWidth(420);

    if (best) {
      const name = best.rivalId === 'npc-0' ? (this.locale === 'ru' ? 'Виктор' : 'Victor') : (this.locale === 'ru' ? 'Мира' : 'Mira');
      button(this, 920, 624, `${name}\n${this.locale === 'ru' ? 'поручится' : 'will sponsor'}`, () => {
        this.campaign.chooseBranch(`circle-sponsored:${best.rivalId}`, best.rivalId, { trust: 2, debt: 4 });
        this.complete(mission.id);
      }, { width: 260, height: 56, background: 0x3a3021, accent: VISUAL.warm, fontSize: 10 });
      return;
    }

    const cheapest = [...options].sort((a, b) => a.cashSettlement - b.cashSettlement)[0];
    const cost = cheapest?.cashSettlement ?? 1800;
    button(this, 920, 624, `${this.locale === 'ru' ? 'Внести залог' : 'Post bond'}\n${this.money(cost)}`, () => {
      if (!this.campaign.payBranchChoice('circle-paid-bond', cost)) {
        this.feedback = this.locale === 'ru' ? 'Не хватает денег на залог.' : 'Not enough cash for the bond.';
        this.render();
        return;
      }
      this.complete(mission.id);
    }, { width: 260, height: 56, disabled: save.cash < cost, background: 0x4a3024, accent: VISUAL.warm, fontSize: 10 });
  }

  private renderCounterfeitTable(mission: CampaignMission): void {
    this.add.image(1090, 416, 'counterfeit-table').setDisplaySize(205, 130);
    const prefix = 'counterfeit-pick:';
    const selected = this.campaign.progress.branchChoiceIds.filter((id) => id.startsWith(prefix)).map((id) => id.slice(prefix.length));
    const required = mission.objective.targetIds ?? ['folder-17', 'wax-card-c'];
    const result = evaluateCounterfeitSelection(selected, required, mission.objective.target ?? 2);
    this.label(610, 568, `${this.locale === 'ru' ? 'Выбрано' : 'Selected'}: ${result.selectedIds.length}/${mission.objective.target ?? 2}`, 10, VISUAL.faint, 'bold');

    if (result.complete) {
      if (result.correct) {
        this.completeButton(mission.id, this.locale === 'ru' ? 'Подтвердить подлинность' : 'Confirm genuine pair');
        return;
      }
      this.feedback = this.locale === 'ru' ? 'Пара не сходится по материалам. Подделки смешивают настоящий штамп с неправильной бумагой или воском.' : 'The pair fails the material check. The fakes combine a real stamp with the wrong paper or wax.';
      this.campaign.resetBranchChoices(prefix);
      this.render();
      return;
    }

    COUNTERFEIT_OPTIONS.forEach((option, index) => {
      const picked = result.selectedIds.includes(option.id);
      button(this, 685 + index * 145, 624, this.locale === 'ru' ? option.ru : option.en, () => {
        if (picked || result.selectedIds.length >= (mission.objective.target ?? 2)) return;
        this.campaign.chooseBranch(`${prefix}${option.id}`);
        this.render();
      }, { width: 136, height: 60, disabled: picked, background: picked ? 0x4d4026 : 0x29313b, accent: picked ? VISUAL.warm : 0x68717d, fontSize: 8 });
    });
  }

  private renderFinaleRoute(mission: CampaignMission): void {
    this.add.image(1090, 416, 'final-route-map').setDisplaySize(205, 130);
    this.label(610, 568, this.locale === 'ru' ? 'Используйте только уже найденные улики. Ошибочный маршрут не списывает деньги.' : 'Use only evidence you already found. A wrong route does not charge cash.', 10, VISUAL.faint).setWordWrapWidth(420);
    const routes: Array<{ id: FinaleRouteId; ru: string; en: string }> = [
      { id: 'north-depot', ru: 'Северное депо', en: 'North depot' },
      { id: 'river-archive', ru: 'Речной архив', en: 'River archive' },
      { id: 'museum-annex', ru: 'Музейный флигель', en: 'Museum annex' },
    ];
    routes.forEach((route, index) => {
      button(this, 710 + index * 202, 624, this.locale === 'ru' ? route.ru : route.en, () => {
        const result = resolveFinaleRoute(route.id, this.campaign.progress.evidenceIds);
        if (result.correct) {
          this.campaign.chooseBranch(`finale-route:${route.id}`);
          this.complete(mission.id);
          return;
        }
        this.feedback = result.evidenceScore < 2
          ? (this.locale === 'ru' ? 'Недостаточно подтверждённых связей на доске. Проверьте предыдущие улики.' : 'Not enough confirmed links on the board. Review the previous evidence.')
          : (this.locale === 'ru' ? 'Этот маршрут не сходится одновременно с индексом и списком покупателей.' : 'This route does not fit both the index and buyer list.');
        this.render();
      }, { width: 184, height: 52, background: route.id === 'river-archive' ? 0x3a3021 : 0x29313b, accent: route.id === 'river-archive' ? VISUAL.warm : 0x68717d, fontSize: 9 });
    });
  }

  private renderFinalePrep(mission: CampaignMission): void {
    this.add.image(1090, 416, 'private-invitation').setDisplaySize(195, 118);
    this.label(610, 568, this.locale === 'ru' ? 'Союзник не даёт бесплатных цен. Он меняет только отношение и качество информации в эпилоге.' : 'An ally never reveals free exact values. The choice only changes relationships and epilogue context.', 10, VISUAL.faint).setWordWrapWidth(420);
    button(this, 706, 624, this.locale === 'ru' ? 'Виктор' : 'Victor', () => {
      this.campaign.chooseBranch('finale-partner-victor', 'npc-0', { trust: 12, debt: 4 });
      this.campaign.chooseBranch('finale-partner-victor-mira', 'npc-1', { rivalry: 3 });
      this.complete(mission.id);
    }, { width: 190, height: 54, background: 0x3a3021, accent: VISUAL.warm, fontSize: 10 });
    button(this, 910, 624, this.locale === 'ru' ? 'Мира' : 'Mira', () => {
      this.campaign.chooseBranch('finale-partner-mira', 'npc-1', { trust: 12, debt: 4 });
      this.campaign.chooseBranch('finale-partner-mira-victor', 'npc-0', { rivalry: 3 });
      this.complete(mission.id);
    }, { width: 190, height: 54, background: 0x302843, accent: VISUAL.purple, fontSize: 10 });
    button(this, 1114, 624, this.locale === 'ru' ? 'Идти одному' : 'Go alone', () => {
      this.campaign.chooseBranch('finale-partner-solo');
      this.complete(mission.id);
    }, { width: 190, height: 54, background: 0x29313b, accent: 0x68717d, fontSize: 10 });
  }

  private renderFinaleMission(): void {
    this.label(610, 572, this.locale === 'ru' ? 'Финал использует отдельный общий бюджет. После подтверждения выбора коллекция и обычная экономика не сбрасываются.' : 'The finale uses a separate shared envelope. Completing it does not reset collection or the normal economy.', 10, VISUAL.faint).setWordWrapWidth(430);
    button(this, 1036, 612, this.locale === 'ru' ? 'Войти в финальный аукцион' : 'Enter final auction', () => this.scene.start('campaign-finale'), { width: 300, height: 58, background: VISUAL.warm, accent: 0xffd260, foreground: '#111318', fontSize: 11 });
  }

  private previewItemLabel(id: string): string {
    const labels: Record<string, { ru: string; en: string }> = {
      'silver-mask': { ru: 'Серебряная маска', en: 'Silver mask' },
      'ledger-frame': { ru: 'Рама с описью', en: 'Ledger frame' },
      'bronze-clock': { ru: 'Бронзовые часы', en: 'Bronze clock' },
      'ivory-catalogue': { ru: 'Светлый каталог', en: 'Ivory catalogue' },
      'lacquer-box': { ru: 'Лаковая шкатулка', en: 'Lacquer box' },
    };
    return labels[id]?.[this.locale] ?? id;
  }

  private auctionButton(status: string): void {
    this.label(610, 586, status, 10, VISUAL.faint, 'bold');
    button(this, 1036, 588, this.locale === 'ru' ? 'Идти на торги' : 'Go to auction', () => this.scene.start('auction'), { width: 260, height: 54, background: VISUAL.rare });
  }

  private completeButton(missionId: string, label?: string): void {
    button(this, 1036, 588, label ?? (this.locale === 'ru' ? 'Завершить задание' : 'Complete mission'), () => this.complete(missionId), { width: 260, height: 54, background: VISUAL.success });
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
