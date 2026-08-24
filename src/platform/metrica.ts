import {
  registerAnalyticsSink,
  type AnalyticsEnvelope,
  type AnalyticsEventName,
} from '../analytics';

const METRICA_SCRIPT_URL = 'https://mc.yandex.ru/metrika/tag.js';
const METRICA_SCRIPT_MARKER = 'auction-hunter-metrica';

export const METRICA_GOAL_EVENTS = new Set<AnalyticsEventName>([
  'onboarding_completed',
  'auction_started',
  'advanced_inspection_used',
  'auction_won',
  'auction_passed',
  'restoration_completed',
  'item_dispositioned',
  'collection_set_reward_claimed',
  'daily_special_completed',
  'daily_contract_reward_claimed',
  'achievement_reward_claimed',
  'business_upgrade_purchased',
  'round_completed',
  'rewarded_ad_rewarded',
]);

type MetricaPrimitive = string | number | boolean | null;
type MetricaValue = MetricaPrimitive | MetricaValue[] | { [key: string]: MetricaValue };
type MetricaParams = { [key: string]: MetricaValue };
type MetricaFunction = ((counterId: number, method: string, ...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};
interface MetricaWindow extends Window {
  ym?: MetricaFunction;
}

export function initializeMetricaAnalytics(
  configuredCounterId: unknown = import.meta.env.VITE_YANDEX_METRICA_ID,
): () => void {
  const counterId = parseMetricaCounterId(configuredCounterId);
  if (counterId === null || typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }

  const ym = ensureMetricaQueue();
  ensureMetricaScript();

  try {
    ym(counterId, 'init', {
      clickmap: false,
      trackLinks: false,
      accurateTrackBounce: true,
      webvisor: false,
    });
  } catch (error) {
    console.warn('[Metrica] Failed to initialize analytics tag.', error);
  }

  return registerAnalyticsSink((event) => sendMetricaEvent(counterId, event));
}

export function parseMetricaCounterId(value: unknown): number | null {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim().length > 0
      ? Number(value.trim())
      : Number.NaN;

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function metricaGoalId(eventName: AnalyticsEventName): string {
  return `ah_${eventName}`;
}

export function metricaEventParams(event: AnalyticsEnvelope): MetricaParams {
  const sanitizedPayload = sanitizeValue(event.payload) ?? {};
  return {
    auction_hunter: {
      event_name: event.eventName,
      schema_version: event.schemaVersion,
      sequence: event.sequence,
      payload: sanitizedPayload,
    },
  };
}

function sendMetricaEvent(counterId: number, event: AnalyticsEnvelope): void {
  const ym = (window as MetricaWindow).ym;
  if (!ym) return;

  const params = metricaEventParams(event);
  try {
    // Every typed event is available for detailed analysis without requiring it to be a goal.
    ym(counterId, 'params', params);

    // Stable funnel/economy milestones are also emitted as JavaScript goals.
    if (METRICA_GOAL_EVENTS.has(event.eventName)) {
      ym(counterId, 'reachGoal', metricaGoalId(event.eventName), params);
    }
  } catch (error) {
    // Telemetry must never interfere with input, persistence or progression.
    console.warn('[Metrica] Failed to send analytics event.', error);
  }
}

function ensureMetricaQueue(): MetricaFunction {
  const metricaWindow = window as MetricaWindow;
  if (metricaWindow.ym) return metricaWindow.ym;

  const queue = ((counterId: number, method: string, ...args: unknown[]) => {
    queue.a ??= [];
    queue.a.push([counterId, method, ...args]);
  }) as MetricaFunction;
  queue.l = Date.now();
  metricaWindow.ym = queue;
  return queue;
}

function ensureMetricaScript(): void {
  if (document.querySelector(`script[data-${METRICA_SCRIPT_MARKER}]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = METRICA_SCRIPT_URL;
  script.dataset[camelCaseDataKey(METRICA_SCRIPT_MARKER)] = 'true';
  document.head.appendChild(script);
}

function camelCaseDataKey(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function sanitizeValue(value: unknown): MetricaValue | undefined {
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeValue(entry))
      .filter((entry): entry is MetricaValue => entry !== undefined);
  }
  if (typeof value !== 'object') return undefined;

  const result: { [key: string]: MetricaValue } = {};
  for (const [key, entry] of Object.entries(value)) {
    const sanitized = sanitizeValue(entry);
    if (sanitized !== undefined) result[key] = sanitized;
  }
  return result;
}
