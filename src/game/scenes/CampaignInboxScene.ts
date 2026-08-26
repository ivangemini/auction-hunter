import Phaser from 'phaser';
import { CAMPAIGN_MESSAGES, campaignMessageUnlocked, type CampaignMessageDefinition } from '../../data/campaignMessages';
import { getPlatformLocale } from '../../platform/yandex';
import { CampaignStore } from '../campaignStore';
import { button } from '../ui';
import { addAtmosphere, addChip, addSurface, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;

export class CampaignInboxScene extends Phaser.Scene {
  private readonly campaign = new CampaignStore();
  private selectedMessageId: string | null = null;

  constructor() {
    super('campaign-inbox');
  }

  preload(): void {
    this.load.svg('campaign-dealer-backroom', 'assets/campaign/campaign-dealer-backroom.svg');
  }

  create(): void {
    this.render();
  }

  private render(): void {
    const locale = getPlatformLocale();
    const save = this.campaign.snapshot;
    const unlocked = CAMPAIGN_MESSAGES.filter((message) => campaignMessageUnlocked(message, save.campaign.completedMissionIds));
    const selected = unlocked.find((message) => message.id === this.selectedMessageId) ?? unlocked.at(-1) ?? null;
    this.selectedMessageId = selected?.id ?? null;

    this.children.removeAll(true);
    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.copper, 1050);
    this.add.image(1008, 380, 'campaign-dealer-backroom').setDisplaySize(610, 510).setAlpha(0.25);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x080b0e, 0.38).setOrigin(0);
    this.add.rectangle(48, 30, 6, 80, VISUAL.warm, 0.9).setOrigin(0);
    this.add.text(70, 36, locale === 'ru' ? 'ТЕЛЕФОН · ЧЁРНЫЙ РЕЕСТР' : 'PHONE · BLACK LEDGER', {
      fontFamily: 'Arial, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#f4dfad',
    });
    this.add.text(70, 78, locale === 'ru'
      ? 'Сообщения открываются по ходу дела. Некоторые контакты предлагают реальные сделки.'
      : 'Messages unlock as the case advances. Some contacts offer real deals.', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#9da6b1',
    });
    addChip(this, 948, 54, `${unlocked.length}/${CAMPAIGN_MESSAGES.length}`, VISUAL.copper, { width: 92, height: 28, filled: true, fontSize: 9 });
    button(this, 1165, 58, locale === 'ru' ? 'К делу' : 'Back to case', () => this.scene.start('campaign'), {
      width: 170, height: 42, background: VISUAL.steel, accent: VISUAL.warm, fontSize: 10,
    });

    addSurface(this, 54, 132, 390, 520, { fill: 0x11151a, accent: VISUAL.copper, strokeAlpha: 0.3, glowAlpha: 0.008 });
    this.add.text(76, 150, locale === 'ru' ? 'ВХОДЯЩИЕ' : 'INBOX', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#d6a45f',
    });

    if (unlocked.length === 0) {
      this.add.text(76, 214, locale === 'ru' ? 'Пока сообщений нет. Продвиньтесь по первой главе.' : 'No messages yet. Advance the first chapter.', {
        fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#828c97', wordWrap: { width: 320 },
      });
    } else {
      unlocked.slice(-6).reverse().forEach((message, index) => this.renderMessageRow(message, index, locale));
    }

    addSurface(this, 470, 132, 756, 520, { fill: 0x15191e, accent: VISUAL.warm, strokeAlpha: 0.28, glowAlpha: 0.012 });
    if (!selected) return;
    this.markRead(selected.id);
    const refreshed = this.campaign.snapshot;
    const actionDone = selected.action ? refreshed.campaign.branchChoiceIds.includes(`message-action:${selected.action.id}`) : false;

    this.add.text(500, 162, selected.sender[locale], { fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#d6a45f' });
    this.add.text(500, 194, selected.subject[locale], { fontFamily: 'Arial, sans-serif', fontSize: '25px', fontStyle: 'bold', color: '#f7f3e8' }).setWordWrapWidth(660);
    this.add.line(500, 246, 0, 0, 660, 0, 0xe9b949, 0.24).setOrigin(0);
    this.add.text(500, 278, selected.body[locale], {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#b9c0ca', lineSpacing: 7, wordWrap: { width: 655 },
    });

    if (selected.action) {
      this.add.text(500, 516, locale === 'ru' ? 'РЕШЕНИЕ' : 'DECISION', { fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#d6a45f' });
      this.add.text(500, 540, locale === 'ru'
        ? 'Решение сохранится и изменит отношение этого дилера в будущих торгах.'
        : 'This decision persists and changes this dealer’s relationship in future auctions.', {
        fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#818b96', wordWrap: { width: 420 },
      });
      button(this, 1062, 580, actionDone ? (locale === 'ru' ? 'Услуга принята' : 'Favor accepted') : selected.action.label[locale], () => {
        if (actionDone) return;
        this.campaign.chooseBranch(
          `message-action:${selected.action!.id}`,
          selected.action!.rivalId,
          selected.action!.relationship,
        );
        this.render();
      }, {
        width: 270, height: 52, disabled: actionDone, background: actionDone ? 0x254334 : 0x3a3021, accent: actionDone ? VISUAL.success : VISUAL.warm, fontSize: 10,
      });
    }
  }

  private renderMessageRow(message: CampaignMessageDefinition, index: number, locale: 'ru' | 'en'): void {
    const save = this.campaign.snapshot;
    const read = save.campaign.branchChoiceIds.includes(`message-read:${message.id}`);
    const selected = this.selectedMessageId === message.id;
    const y = 188 + index * 70;
    button(this, 249, y + 26, `${message.sender[locale]}\n${message.subject[locale]}`, () => {
      this.selectedMessageId = message.id;
      this.markRead(message.id);
      this.render();
    }, {
      width: 342,
      height: 58,
      background: selected ? 0x3a3021 : read ? 0x20252b : 0x2c2319,
      accent: selected || !read ? VISUAL.warm : 0x5f6872,
      fontSize: 9,
      hitSlop: 3,
    });
    if (!read) this.add.circle(88, y + 26, 5, VISUAL.warm, 1);
  }

  private markRead(messageId: string): void {
    const choiceId = `message-read:${messageId}`;
    if (!this.campaign.progress.branchChoiceIds.includes(choiceId)) this.campaign.chooseBranch(choiceId);
  }
}
