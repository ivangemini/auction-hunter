import { describe, expect, it } from 'vitest';
import { createDefaultSave } from '../game/save';
import { rivalDossierLabel, rivalKnowledgeLevel, rivalMemorySnapshot } from './rivalMemory';

describe('rival memory progression', () => {
  it('unlocks knowledge in bounded encounter tiers', () => {
    expect(rivalKnowledgeLevel(0)).toBe(0);
    expect(rivalKnowledgeLevel(1)).toBe(1);
    expect(rivalKnowledgeLevel(2)).toBe(1);
    expect(rivalKnowledgeLevel(3)).toBe(2);
    expect(rivalKnowledgeLevel(5)).toBe(2);
    expect(rivalKnowledgeLevel(6)).toBe(3);
    expect(rivalKnowledgeLevel(99)).toBe(3);
  });

  it('derives a dossier from additive save records without exposing bid ceilings', () => {
    const save = createDefaultSave();
    save.rivalEncounters['npc-2'] = 6;
    save.rivalPlayerWins['npc-2'] = 4;
    save.rivalWins['npc-2'] = 2;

    const memory = rivalMemorySnapshot(save, 'npc-2');
    expect(memory).toMatchObject({ encounters: 6, playerWins: 4, rivalWins: 2, knowledgeLevel: 3 });
    expect(rivalDossierLabel(memory).label.en).toContain('4:2');
    expect(JSON.stringify(memory)).not.toContain('maxBid');
  });
});
