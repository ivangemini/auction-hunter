import { CampaignScene } from './CampaignScene';

/**
 * Stable scene key adapter for the campaign hub. Chapter V now lives in the
 * normal mission graph, so the former direct-finale overlay is intentionally
 * removed: players must complete route planning and finale preparation first.
 */
export class CampaignGatewayScene extends CampaignScene {}
