import { describe, expect, it } from 'vitest';
import { BIDDER_PROFILES } from './balance';
import { CAMPAIGN_MESSAGES, campaignMessageUnlocked } from './campaignMessages';

describe('P9 campaign inbox', () => {
  it('ships a substantial authored message sequence', () => {
    expect(CAMPAIGN_MESSAGES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(CAMPAIGN_MESSAGES.map((message) => message.id)).size).toBe(CAMPAIGN_MESSAGES.length);
    expect(CAMPAIGN_MESSAGES.every((message) => message.sender.ru.trim() && message.sender.en.trim())).toBe(true);
    expect(CAMPAIGN_MESSAGES.every((message) => message.body.ru.trim() && message.body.en.trim())).toBe(true);
  });

  it('promotes Nadia from the real rival roster into a repeated campaign principal', () => {
    expect(BIDDER_PROFILES.some((rival) => rival.id === 'npc-6')).toBe(true);
    expect(CAMPAIGN_MESSAGES.filter((message) => message.senderId === 'npc-6').length).toBeGreaterThanOrEqual(4);
    const favor = CAMPAIGN_MESSAGES.find((message) => message.id === 'nadia-archive-exchange');
    expect(favor?.action?.rivalId).toBe('npc-6');
    expect(favor?.action?.relationship?.trust).toBeGreaterThan(0);
    expect(favor?.action?.relationship?.debt).toBeGreaterThan(0);
  });

  it('unlocks messages only from completed campaign beats', () => {
    const message = CAMPAIGN_MESSAGES.find((entry) => entry.id === 'nadia-circle-note')!;
    expect(campaignMessageUnlocked(message, ['dealer-war-ally'])).toBe(false);
    expect(campaignMessageUnlocked(message, ['closed-circle-sealed-bid'])).toBe(true);
  });
});
