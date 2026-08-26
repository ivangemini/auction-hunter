import { trackEvent } from '../../analytics';
import { campaignProvenanceVariantFor } from '../../data/campaignProvenanceVariants';
import type { Locale, RevealedItem } from '../../domain/types';
import { playFeedbackCue } from '../feedback';
import { RivalBehaviorAuctionScene } from './RivalBehaviorAuctionScene';

type RevealStage = 'closed' | 'revealed' | 'appraised' | 'restoring';

type ProvenanceRuntime = Phaser.Scene & {
  locale: Locale;
  items: RevealedItem[];
  revealIndex: number;
  revealStage: RevealStage;
  renderReveal: () => void;
};

/**
 * P9 presentation layer for item-specific provenance stories. It wraps the
 * existing P8 reveal/jackpot renderer; appraisal/economy truth remains in the
 * domain createLotItems path.
 */
export class CampaignProvenanceAuctionScene extends RivalBehaviorAuctionScene {
  constructor() {
    super();
    const runtime = this as unknown as ProvenanceRuntime;
    const renderReveal = runtime.renderReveal.bind(runtime);
    const tracked = new Set<string>();

    runtime.renderReveal = () => {
      renderReveal();
      if (runtime.revealStage !== 'appraised') return;
      const item = runtime.items[runtime.revealIndex];
      if (!item) return;
      const traitIds = item.traitIds ?? [];
      const variant = campaignProvenanceVariantFor(item.definition.id, traitIds);
      if (!variant) return;

      const key = `${runtime.revealIndex}:${variant.id}`;
      if (!tracked.has(key)) {
        tracked.add(key);
        trackEvent('campaign_provenance_variant_revealed', {
          variantId: variant.id,
          itemId: item.definition.id,
          traitIds: [...traitIds],
          appraisedValue: item.appraisedValue,
          bonusMultiplier: variant.bonusMultiplier,
        });
        playFeedbackCue(runtime, 'reward');
      }

      runtime.add.rectangle(845, 250, 310, 66, 0x1d2a24, 0.96)
        .setStrokeStyle(2, 0x63d28d, 0.7);
      runtime.add.text(690, 228, runtime.locale === 'ru' ? '✦ СЛЕД ЧЁРНОГО РЕЕСТРА' : '✦ BLACK LEDGER PROVENANCE', {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#63d28d',
      });
      runtime.add.text(690, 244, variant.name[runtime.locale], {
        fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#e6f4e9',
      }).setWordWrapWidth(290);
      runtime.add.text(690, 264, variant.description[runtime.locale], {
        fontFamily: 'Arial, sans-serif', fontSize: '8px', color: '#a8c7b2', lineSpacing: 2,
        wordWrap: { width: 290 },
      });
    };
  }
}
