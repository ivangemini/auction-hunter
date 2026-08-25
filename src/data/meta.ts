import { selectDailyContracts } from '../domain/meta';
import type {
  AchievementMetric,
  BusinessUpgradeId,
  ContractMetric,
  LocalizedText,
} from '../domain/types';

export interface DailyContractDefinition {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  metric: ContractMetric;
  target: number;
  reward: number;
}

export interface AchievementDefinition {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  metric: AchievementMetric;
  target: number;
  reward: number;
}

export interface BusinessUpgradeDefinition {
  id: BusinessUpgradeId;
  title: LocalizedText;
  description: LocalizedText;
  costs: readonly number[];
  effects: readonly LocalizedText[];
}

export const DAILY_CONTRACT_POOL: readonly DailyContractDefinition[] = [
  {
    id: 'play-4',
    title: { ru: 'Войти в ритм', en: 'Get into the rhythm' },
    description: { ru: 'Сыграй 4 аукциона сегодня.', en: 'Play 4 auctions today.' },
    metric: 'auctionsPlayed', target: 4, reward: 300,
  },
  {
    id: 'play-6',
    title: { ru: 'Полная смена', en: 'Full shift' },
    description: { ru: 'Сыграй 6 аукционов сегодня.', en: 'Play 6 auctions today.' },
    metric: 'auctionsPlayed', target: 6, reward: 450,
  },
  {
    id: 'win-2',
    title: { ru: 'Охотник за лотами', en: 'Lot hunter' },
    description: { ru: 'Выиграй 2 аукциона сегодня.', en: 'Win 2 auctions today.' },
    metric: 'auctionsWon', target: 2, reward: 500,
  },
  {
    id: 'win-3',
    title: { ru: 'Серия побед', en: 'Winning run' },
    description: { ru: 'Выиграй 3 аукциона сегодня.', en: 'Win 3 auctions today.' },
    metric: 'auctionsWon', target: 3, reward: 700,
  },
  {
    id: 'sell-5',
    title: { ru: 'Быстрый оборот', en: 'Quick turnover' },
    description: { ru: 'Продай 5 предметов.', en: 'Sell 5 items.' },
    metric: 'itemsSold', target: 5, reward: 400,
  },
  {
    id: 'sell-8',
    title: { ru: 'Оптовый день', en: 'Volume dealer' },
    description: { ru: 'Продай 8 предметов.', en: 'Sell 8 items.' },
    metric: 'itemsSold', target: 8, reward: 600,
  },
  {
    id: 'keep-2',
    title: { ru: 'Пополнение витрины', en: 'Fill the display' },
    description: { ru: 'Оставь 2 находки в коллекции.', en: 'Keep 2 finds in your collection.' },
    metric: 'itemsKept', target: 2, reward: 450,
  },
  {
    id: 'keep-4',
    title: { ru: 'Запас для коллекции', en: 'Collector stock' },
    description: { ru: 'Оставь 4 находки в коллекции.', en: 'Keep 4 finds in your collection.' },
    metric: 'itemsKept', target: 4, reward: 650,
  },
  {
    id: 'sales-2500',
    title: { ru: 'Кассовый день', en: 'Cash day' },
    description: { ru: 'Получи 2 500 ₽ выручки от продаж.', en: 'Generate 2,500 ₽ in sales.' },
    metric: 'salesValue', target: 2500, reward: 600,
  },
  {
    id: 'sales-5000',
    title: { ru: 'Сильная касса', en: 'Strong receipts' },
    description: { ru: 'Получи 5 000 ₽ выручки от продаж.', en: 'Generate 5,000 ₽ in sales.' },
    metric: 'salesValue', target: 5000, reward: 850,
  },
];

export function dailyContractsForDay(dayKey: string): DailyContractDefinition[] {
  const ranked = selectDailyContracts(DAILY_CONTRACT_POOL, dayKey, DAILY_CONTRACT_POOL.length);
  const selected: DailyContractDefinition[] = [];
  const metrics = new Set<ContractMetric>();
  for (const contract of ranked) {
    if (metrics.has(contract.metric)) continue;
    selected.push(contract);
    metrics.add(contract.metric);
    if (selected.length === 3) break;
  }
  return selected;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'first-win',
    title: { ru: 'Первая покупка', en: 'First purchase' },
    description: { ru: 'Выиграй первый аукцион.', en: 'Win your first auction.' },
    metric: 'auctionsWon', target: 1, reward: 250,
  },
  {
    id: 'ten-auctions',
    title: { ru: 'Завсегдатай', en: 'Regular bidder' },
    description: { ru: 'Сыграй 10 аукционов.', en: 'Play 10 auctions.' },
    metric: 'auctionsPlayed', target: 10, reward: 500,
  },
  {
    id: 'five-wins',
    title: { ru: 'Уверенная рука', en: 'Steady hand' },
    description: { ru: 'Выиграй 5 лотов.', en: 'Win 5 lots.' },
    metric: 'auctionsWon', target: 5, reward: 700,
  },
  {
    id: 'collector-eight',
    title: { ru: 'Настоящая коллекция', en: 'A real collection' },
    description: { ru: 'Собери 8 уникальных находок.', en: 'Own 8 unique finds.' },
    metric: 'uniqueCollection', target: 8, reward: 800,
  },
  {
    id: 'sales-ten-k',
    title: { ru: 'Оборот 10K', en: '10K turnover' },
    description: { ru: 'Продай предметов суммарно на 10 000 ₽.', en: 'Reach 10,000 ₽ in lifetime sales.' },
    metric: 'lifetimeSales', target: 10000, reward: 1000,
  },
  {
    id: 'two-sets',
    title: { ru: 'Куратор', en: 'Curator' },
    description: { ru: 'Забери награды за 2 набора.', en: 'Claim rewards for 2 collection sets.' },
    metric: 'claimedSets', target: 2, reward: 1200,
  },
  {
    id: 'collector-tier',
    title: { ru: 'Доступ в клуб', en: 'Club access' },
    description: { ru: 'Достигни 320 REP.', en: 'Reach 320 REP.' },
    metric: 'reputationXp', target: 320, reward: 1500,
  },
  {
    id: 'cash-ten-k',
    title: { ru: 'Пятизначный банк', en: 'Five-digit bankroll' },
    description: { ru: 'Подними банк до 10 000 ₽.', en: 'Reach a 10,000 ₽ bankroll.' },
    metric: 'highestCash', target: 10000, reward: 1500,
  },
  {
    id: 'twenty-five-auctions',
    title: { ru: 'Знакомое место', en: 'Familiar ground' },
    description: { ru: 'Сыграй 25 аукционов.', en: 'Play 25 auctions.' },
    metric: 'auctionsPlayed', target: 25, reward: 1000,
  },
  {
    id: 'fifteen-wins',
    title: { ru: 'Твёрдый молоток', en: 'Hammer regular' },
    description: { ru: 'Выиграй 15 лотов.', en: 'Win 15 lots.' },
    metric: 'auctionsWon', target: 15, reward: 1400,
  },
  {
    id: 'collector-sixteen',
    title: { ru: 'Полная витрина', en: 'Full display' },
    description: { ru: 'Собери 16 уникальных находок.', en: 'Own 16 unique finds.' },
    metric: 'uniqueCollection', target: 16, reward: 1700,
  },
  {
    id: 'collector-twenty-four',
    title: { ru: 'Большая коллекция', en: 'Major collection' },
    description: { ru: 'Собери 24 уникальные находки.', en: 'Own 24 unique finds.' },
    metric: 'uniqueCollection', target: 24, reward: 2600,
  },
  {
    id: 'sales-fifty-k',
    title: { ru: 'Оборот 50K', en: '50K turnover' },
    description: { ru: 'Достигни 50 000 ₽ суммарных продаж.', en: 'Reach 50,000 ₽ in lifetime sales.' },
    metric: 'lifetimeSales', target: 50000, reward: 2500,
  },
  {
    id: 'six-sets',
    title: { ru: 'Системный коллекционер', en: 'Set architect' },
    description: { ru: 'Забери награды за 6 коллекционных наборов.', en: 'Claim rewards for 6 collection sets.' },
    metric: 'claimedSets', target: 6, reward: 2200,
  },
  {
    id: 'rep-seven-hundred',
    title: { ru: 'Имя на рынке', en: 'Known on the circuit' },
    description: { ru: 'Достигни 700 REP.', en: 'Reach 700 REP.' },
    metric: 'reputationXp', target: 700, reward: 2600,
  },
  {
    id: 'cash-fifty-k',
    title: { ru: 'Серьёзный капитал', en: 'Serious bankroll' },
    description: { ru: 'Подними банк до 50 000 ₽.', en: 'Reach a 50,000 ₽ bankroll.' },
    metric: 'highestCash', target: 50000, reward: 3000,
  },
];

export const BUSINESS_UPGRADE_ORDER: readonly BusinessUpgradeId[] = ['warehouse', 'contractsDesk', 'showroom'];

export const BUSINESS_UPGRADES: Record<BusinessUpgradeId, BusinessUpgradeDefinition> = {
  warehouse: {
    id: 'warehouse',
    title: { ru: 'Склад и логистика', en: 'Warehouse & logistics' },
    description: { ru: 'Повышает цену быстрой перепродажи предметов из коллекции.', en: 'Improves quick-sale value for collection inventory.' },
    costs: [2000, 5000, 11000],
    effects: [
      { ru: 'Быстрая продажа: 65%', en: 'Quick sale: 65%' },
      { ru: 'Быстрая продажа: 70%', en: 'Quick sale: 70%' },
      { ru: 'Быстрая продажа: 75%', en: 'Quick sale: 75%' },
      { ru: 'Быстрая продажа: 80%', en: 'Quick sale: 80%' },
    ],
  },
  contractsDesk: {
    id: 'contractsDesk',
    title: { ru: 'Контрактный стол', en: 'Contracts desk' },
    description: { ru: 'Увеличивает денежные награды ежедневных контрактов.', en: 'Increases cash rewards from daily contracts.' },
    costs: [2500, 6000, 13000],
    effects: [
      { ru: 'Награды контрактов: ×1.00', en: 'Contract rewards: ×1.00' },
      { ru: 'Награды контрактов: ×1.10', en: 'Contract rewards: ×1.10' },
      { ru: 'Награды контрактов: ×1.20', en: 'Contract rewards: ×1.20' },
      { ru: 'Награды контрактов: ×1.30', en: 'Contract rewards: ×1.30' },
    ],
  },
  showroom: {
    id: 'showroom',
    title: { ru: 'Выставочный зал', en: 'Showroom' },
    description: { ru: 'Увеличивает награды за завершённые коллекционные наборы.', en: 'Increases rewards for completed collection sets.' },
    costs: [3000, 7500, 16000],
    effects: [
      { ru: 'Награды наборов: ×1.00', en: 'Set rewards: ×1.00' },
      { ru: 'Награды наборов: ×1.10', en: 'Set rewards: ×1.10' },
      { ru: 'Награды наборов: ×1.20', en: 'Set rewards: ×1.20' },
      { ru: 'Награды наборов: ×1.30', en: 'Set rewards: ×1.30' },
    ],
  },
};
