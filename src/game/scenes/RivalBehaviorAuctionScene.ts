import Phaser from 'phaser';
import {
  chooseRandom,
  eligibleOpponents,
  opponentResponseBid,
  type AuctionOpponent,
} from '../../domain/auction';
import type { LotTemplate } from '../../domain/types';
import { playFeedbackCue } from '../feedback';
import { CharacterAuctionScene } from './CharacterAuctionScene';

type RivalBehaviorRuntime = Phaser.Scene & {
  lot: LotTemplate;
  opponents: AuctionOpponent[];
  currentBid: number;
  currentLeader: string;
  awaitingNpc: boolean;
  npcRespond: () => void;
  finalizeWin: () => void;
  renderBidding: () => void;
};

/**
 * Adds live rival bidding behavior without moving auction state ownership out of
 * AuctionScene. `placePlayerBid()` resolves `this.npcRespond()` at callback time,
 * so replacing this runtime hook keeps the existing state/persistence flow intact.
 */
export class RivalBehaviorAuctionScene extends CharacterAuctionScene {
  constructor() {
    super();
    const runtime = this as unknown as RivalBehaviorRuntime;

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

      const responseBid = opponentResponseBid(opponent, runtime.currentBid, runtime.lot);
      if (responseBid === null) {
        // Eligibility and response are intentionally derived from the same pure rule;
        // retain the safe fallback if a future behavior changes between those calls.
        runtime.time.delayedCall(450, () => runtime.finalizeWin());
        return;
      }

      runtime.currentBid = responseBid;
      runtime.currentLeader = opponent.id;
      runtime.awaitingNpc = false;
      playFeedbackCue(runtime, opponent.behavior === 'pressure' ? 'bid' : 'npc-bid');
      runtime.renderBidding();
    };
  }
}
