import type { LocalizedText, PlayerSave } from './types';

export type RivalKnowledgeLevel = 0 | 1 | 2 | 3;

export interface RivalMemorySnapshot {
  rivalId: string;
  encounters: number;
  playerWins: number;
  rivalWins: number;
  knowledgeLevel: RivalKnowledgeLevel;
}

export interface RivalDossierCopy {
  level: RivalKnowledgeLevel;
  label: LocalizedText;
}

export function rivalKnowledgeLevel(encounters: number): RivalKnowledgeLevel {
  const count = Math.max(0, Math.floor(Number.isFinite(encounters) ? encounters : 0));
  if (count >= 6) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

export function rivalMemorySnapshot(save: Readonly<PlayerSave>, rivalId: string): RivalMemorySnapshot {
  const encounters = Math.max(0, Math.floor(save.rivalEncounters[rivalId] ?? 0));
  const playerWins = Math.min(encounters, Math.max(0, Math.floor(save.rivalPlayerWins[rivalId] ?? 0)));
  const rivalWins = Math.min(encounters, Math.max(0, Math.floor(save.rivalWins[rivalId] ?? 0)));
  return {
    rivalId,
    encounters,
    playerWins,
    rivalWins,
    knowledgeLevel: rivalKnowledgeLevel(encounters),
  };
}

export function rivalDossierLabel(memory: RivalMemorySnapshot): RivalDossierCopy {
  if (memory.knowledgeLevel === 0) {
    return { level: 0, label: { ru: 'Новый соперник', en: 'New rival' } };
  }
  if (memory.knowledgeLevel === 1) {
    return {
      level: 1,
      label: {
        ru: `Встреч: ${memory.encounters}`,
        en: `Meetings: ${memory.encounters}`,
      },
    };
  }
  if (memory.knowledgeLevel === 2) {
    return {
      level: 2,
      label: {
        ru: `Счёт ${memory.playerWins}:${memory.rivalWins} · стиль изучен`,
        en: `Record ${memory.playerWins}:${memory.rivalWins} · style learned`,
      },
    };
  }
  return {
    level: 3,
    label: {
      ru: `Счёт ${memory.playerWins}:${memory.rivalWins} · досье полное`,
      en: `Record ${memory.playerWins}:${memory.rivalWins} · dossier complete`,
    },
  };
}
