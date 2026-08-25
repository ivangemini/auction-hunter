import Phaser from 'phaser';
import {
  chooseRandom,
  eligibleOpponents,
  opponentResponseBid,
  opponentSignatureResponseBid,
  roundToBid,
  type AuctionOpponent,
} from '../../domain/auction';
import type { LotModifierDefinition } from '../../domain/lotModifier';
import { rivalDossierLabel, rivalMemorySnapshot } from '../../domain/rivalMemory';
import type { Locale, LotTemplate, PlayerSave } from '../../domain/types';
import { playFeedbackCue } from '../feedback';
import { CharacterAuctionScene } from './CharacterAuctionScene';

const VIP_RIVAL_PRESSURE_MULTIPLIER = 1.08;

type RivalBehaviorRuntime = Phaser.Scene & {
  locale: Locale;
  lot: LotTemplate;
  lotModifier: LotModifierDefinition | null;
  opponents: AuctionOpponent[];
  currentBid: number;
  currentLeader: string;
  awaitingNpc: boolean;
  store: {
    snapshot: Readonly<PlayerSave>;
    recordRivalAuction: (opponentIds: readonly string[], outcome: 'player-win' | 'player-pass', winningRivalId?: string) => void;
  };
  prepareLot: (lot: LotTemplate, modifier: LotModifierDefinition | null, valueMultiplier?: number) => void;
  startAuction: () => void;
  passAuction: () => void;
  npcRespond: () => void;
  finalizeWin: () => void;
  renderBidding: () => void;
};

/**
 * Adds persistent rival learning plus bounded one-shot signature bids without
 * moving auction/economy ownership out of AuctionScene.
 */
export class RivalBehaviorAuctionScene extends CharacterAuctionScene {
  constructor() {
    super();
    const runtime = this as unknown as RivalBehaviorRuntime;
    const signatureUsed = new Set<string>();
    let outcomeRecorded = false;
    let signatureNotice = '';
    let vipPressureApplied = false;

    const prepareLot = runtime.prepareLot.bind(runtime);
    const startAuction = runtime.startAuction.bind(runtime);
    const passAuction = runtime.passAuction.bind(runtime);
    const finalizeWin = runtime.finalizeWin.bind(runtime);
    const renderBidding = runtime.renderBidding.bind(runtime);

    runtime.prepareLot = (lot, modifier, valueMultiplier = 1) => {
      prepareLot(lot, modifier, valueMultiplier);
      vipPressureApplied = false;
    };

    runtime.startAuction = () => {
      signatureUsed.clear();
      outcomeRecorded = false;
      signatureNotice = '';
      if (!vipPressureApplied && runtime.lotModifier?.id.includes('vip-invitation')) {
        runtime.opponents.forEach((opponent) => {
          opponent.maxBid = roundToBid(opponent.maxBid * VIP_RIVAL_PRESSURE_MULTIPLIER, runtime.lot);
        });
        vipPressureApplied = true;
      }
      startAuction();
    };

    runtime.passAuction = () => {
      if (!outcomeRecorded) {
        outcomeRecorded = true;
        const winningRivalId = runtime.currentLeader !== 'player' ? runtime.currentLeader : undefined;
        runtime.store.recordRivalAuction(runtime.opponents.map((opponent) => opponent.id), 'player-pass', winningRivalId);
      }
      passAuction();
    };

    runtime.finalizeWin = () => {
      if (!outcomeRecorded) {
        outcomeRecorded = true;
        runtime.store.recordRivalAuction(runtime.opponents.map((opponent) => opponent.id), 'player-win');
      }
      finalizeWin();
    };

    runtime.renderBidding = () => {
      renderBidding();
      renderRivalDossiers(runtime);
      if (runtime.lotModifier?.id.includes('vip-invitation')) {
        runtime.add.text(780, 174, runtime.locale === 'ru' ? 'VIP · ДИЛЕРЫ +8% ДАВЛЕНИЯ' : 'VIP · DEALER PRESSURE +8%', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#e9b949',
        }).setOrigin(1, 0.5);
      }
      if (signatureNotice) {
        const banner = runtime.add.rectangle(650, 221, 360, 30, 0x492f18, 0.94).setStrokeStyle(1, 0xe9b949, 0.62);
        runtime.add.text(650, 221, signatureNotice, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#f2cf77',
        }).setOrigin(0.5);
        runtime.time.delayedCall(900, () => {
          if (banner.active) signatureNotice = '';
        });
      }
    };

    runtime.npcRespond = () => {
      const eligible = eligibleOpponents(runtime.opponents, runtime.currentBid, runtime.lot);
      if (eligible.length === 0) {
        runtime.time.delayedCall(450, () => runtime.finalizeWin());
        return;
      }

      const opponent = chooseRandom(eligible);
      if (!opponent) {
        runtime.finalizeWin();
        return;
      }

      const specialBid = opponentSignatureResponseBid(
        opponent,
        runtime.currentBid,
        runtime.lot,
        signatureUsed.has(opponent.id),
      );
      const responseBid = specialBid ?? opponentResponseBid(opponent, runtime.currentBid, runtime.lot);
      if (responseBid === null) {
        runtime.time.delayedCall(450, () => runtime.finalizeWin());
        return;
      }

      if (specialBid !== null) {
        signatureUsed.add(opponent.id);
        signatureNotice = runtime.locale === 'ru'
          ? `${opponent.name.ru}: фирменный ход`
          : `${opponent.name.en}: signature move`;
      } else {
        signatureNotice = '';
      }

      runtime.currentBid = responseBid;
      runtime.currentLeader = opponent.id;
      runtime.awaitingNpc = false;
      playFeedbackCue(runtime, specialBid !== null || opponent.behavior === 'pressure' ? 'bid' : 'npc-bid');
      runtime.renderBidding();
    };
  }
}

function renderRivalDossiers(scene: RivalBehaviorRuntime): void {
  const save = scene.store.snapshot;
  scene.opponents.forEach((opponent, index) => {
    const memory = rivalMemorySnapshot(save, opponent.id);
    if (memory.knowledgeLevel === 0) return;

    const y = 320 + index * 92;
    const dossier = rivalDossierLabel(memory).label[scene.locale];
    scene.add.text(900, y + 48, dossier, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: memory.knowledgeLevel >= 2 ? '#61a8ff' : '#737b88',
    }).setWordWrapWidth(235);

    if (memory.knowledgeLevel >= 3 && opponent.weakness) {
      scene.add.text(900, y + 62, opponent.weakness[scene.locale], {
        fontFamily: 'Arial, sans-serif',
        fontSize: '8px',
        color: '#c8a96b',
      }).setWordWrapWidth(235);
    }
  });
}
