import { describe, expect, it } from 'vitest';
import { LOT_MODIFIERS } from './lotModifiers';
import { MARKET_TRENDS } from './marketTrends';
import { MONETIZATION_POLICY } from './monetization';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS } from './collections';
import { DISCOVERY_CHAINS } from './discoveryChains';
import { CAMPAIGN_BREADTH_FIVE_ITEMS } from './campaignBreadthFive';
import { normalizeSave } from '../game/save';
import { pickStartupSave } from '../platform/cloudSave';
import { rewardedSummaryBonus, shouldRequestInterstitial } from '../domain/monetization';

const LEGACY_CORE_ITEM_IDS = [
  'toolbox', 'cassette-player', 'vinyl-box', 'toy-robot', 'brass-clock', 'film-camera',
  'telescope', 'signed-poster', 'silver-ring', 'arcade-handheld', 'pocket-watch', 'prototype-toy',
  'multimeter', 'portable-radio', 'comic-stack', 'tin-car', 'travel-clock', 'instant-camera',
  'binoculars', 'gallery-print', 'enamel-brooch', 'mini-console', 'military-watch', 'preproduction-figure',
  'soldering-station', 'pocket-tv', 'model-train', 'manual-typewriter', 'porcelain-figurine', 'art-deco-lamp',
  'fountain-pen', 'chronograph-watch', 'first-edition-book', 'signed-vinyl', 'clockwork-automaton', 'master-study',
] as const;

describe('P9 final compatibility acceptance', () => {
  it('keeps the original persisted item IDs intact while appending the 72-item catalog', () => {
    expect(ITEMS).toHaveLength(72);
    expect(ALL_LOTS).toHaveLength(42);
    expect(COLLECTION_SETS).toHaveLength(36);
    for (const itemId of LEGACY_CORE_ITEM_IDS) expect(ITEM_BY_ID.has(itemId), itemId).toBe(true);
  });

  it('loads a pre-campaign v1 save without resetting earned economy or collection progress', () => {
    const legacy = normalizeSave({
      version: 1,
      updatedAt: 8123,
      cash: 18420,
      collection: ['film-camera', 'pocket-watch', 'manual-typewriter'],
      claimedSetRewards: ['portable-era'],
      reputationXp: 610,
      lastDailyCompletedDay: '2026-08-20',
      onboardingComplete: true,
      auctionsWon: 23,
      auctionsPlayed: 41,
      lifetimeSales: 92300,
    });

    expect(legacy.version).toBe(1);
    expect(legacy.updatedAt).toBe(8123);
    expect(legacy.cash).toBe(18420);
    expect(legacy.reputationXp).toBe(610);
    expect(legacy.auctionsWon).toBe(23);
    expect(legacy.auctionsPlayed).toBe(41);
    expect(legacy.lifetimeSales).toBe(92300);
    expect(legacy.collection).toEqual(['film-camera', 'pocket-watch', 'manual-typewriter']);
    expect(legacy.collectionItems.map((copy) => copy.itemId)).toEqual(legacy.collection);
    expect(legacy.claimedSetRewards).toEqual(['portable-era']);
    expect(legacy.campaign.started).toBe(false);
    expect(legacy.campaign.completedMissionIds).toEqual([]);
  });

  it('round-trips all final breadth identities through the unchanged v1 save contract', () => {
    const finalIds = CAMPAIGN_BREADTH_FIVE_ITEMS.map((item) => item.id);
    const modern = normalizeSave({
      version: 1,
      updatedAt: 9000,
      cash: 125000,
      collection: finalIds,
      claimedSetRewards: ['clearance-control', 'signal-and-time'],
      reputationXp: 1200,
      onboardingComplete: true,
      auctionsWon: 48,
      auctionsPlayed: 73,
      lifetimeSales: 260000,
      discoveryChainProgress: { 'ledger-clearance-control': 2 },
      discoveryChainLastAuction: { 'ledger-clearance-control': 73 },
      completedDiscoveryChains: ['ledger-sealed-dispatch'],
      campaign: {
        started: true,
        activeMissionId: null,
        completedMissionIds: ['first-day-floor'],
        evidenceIds: ['veyr-black-seal'],
        branchChoiceIds: ['mira-deal'],
        missionBaselineAuctionsPlayed: {},
        missionBaselineAuctionsWon: {},
        relationshipTrust: { mira: 4 },
        relationshipRivalry: {},
        relationshipDebt: {},
        completed: true,
        epilogueId: 'keeper',
      },
    });

    expect(modern.version).toBe(1);
    expect(modern.collection).toEqual(finalIds);
    expect(modern.collectionItems.map((copy) => copy.itemId)).toEqual(finalIds);
    expect(modern.claimedSetRewards).toEqual(['clearance-control', 'signal-and-time']);
    expect(modern.discoveryChainProgress['ledger-clearance-control']).toBe(2);
    expect(modern.completedDiscoveryChains).toContain('ledger-sealed-dispatch');
    expect(modern.campaign.completed).toBe(true);
    expect(modern.campaign.epilogueId).toBe('keeper');
  });

  it('keeps local/cloud reconciliation based on recency and progress rather than catalog generation', () => {
    const localNewer = normalizeSave({
      version: 1,
      updatedAt: 220,
      cash: 9000,
      reputationXp: 340,
      auctionsWon: 8,
      auctionsPlayed: 12,
    });
    const cloudOlder = normalizeSave({
      version: 1,
      updatedAt: 180,
      cash: 50000,
      reputationXp: 900,
      auctionsWon: 30,
      auctionsPlayed: 50,
    });
    expect(pickStartupSave(localNewer, cloudOlder).source).toBe('local');

    const localTie = normalizeSave({
      version: 1,
      updatedAt: 300,
      cash: 4000,
      reputationXp: 120,
      auctionsWon: 3,
      auctionsPlayed: 8,
    });
    const cloudTie = normalizeSave({
      version: 1,
      updatedAt: 300,
      cash: 4500,
      reputationXp: 420,
      auctionsWon: 11,
      auctionsPlayed: 16,
      collection: ['estate-key-register'],
    });
    const tieChoice = pickStartupSave(localTie, cloudTie);
    expect(tieChoice.source).toBe('cloud');
    expect(tieChoice.save.collection).toContain('estate-key-register');
  });

  it('preserves launch monetization boundaries after campaign/catalog expansion', () => {
    expect(MONETIZATION_POLICY.rewardedSummary).toEqual({ rate: 0.25, minReward: 150, maxReward: 600 });
    expect(MONETIZATION_POLICY.interstitial).toEqual({ firstEligibleAuction: 2, everyAuctions: 3 });
    expect(rewardedSummaryBonus(0, MONETIZATION_POLICY.rewardedSummary)).toBe(150);
    expect(rewardedSummaryBonus(1000, MONETIZATION_POLICY.rewardedSummary)).toBe(250);
    expect(rewardedSummaryBonus(100000, MONETIZATION_POLICY.rewardedSummary)).toBe(600);
    expect(shouldRequestInterstitial(1, MONETIZATION_POLICY.interstitial)).toBe(false);
    expect(shouldRequestInterstitial(2, MONETIZATION_POLICY.interstitial)).toBe(true);
    expect(shouldRequestInterstitial(3, MONETIZATION_POLICY.interstitial)).toBe(false);
    expect(shouldRequestInterstitial(5, MONETIZATION_POLICY.interstitial)).toBe(true);
  });

  it('retains the P8 systemic endgame beneath the P9 campaign layer', () => {
    expect(LOT_MODIFIERS.length).toBeGreaterThanOrEqual(17);
    expect(MARKET_TRENDS.length).toBeGreaterThanOrEqual(6);
    expect(DISCOVERY_CHAINS.length).toBeGreaterThanOrEqual(14);
    expect(DISCOVERY_CHAINS.some((chain) => chain.id === 'black-glass-estate')).toBe(true);
    expect(DISCOVERY_CHAINS.some((chain) => chain.id === 'ledger-clearance-control')).toBe(true);
    expect(DISCOVERY_CHAINS.some((chain) => chain.id === 'ledger-sealed-dispatch')).toBe(true);
  });
});
