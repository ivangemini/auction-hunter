import { registerCampaignAftermathDiscovery } from './campaignAftermathDiscovery';
import { registerCampaignBreadth } from './campaignBreadth';
import { registerCampaignBreadthFive } from './campaignBreadthFive';
import { registerCampaignBreadthFour } from './campaignBreadthFour';
import { registerCampaignBreadthThree } from './campaignBreadthThree';
import { registerCampaignBreadthTwo } from './campaignBreadthTwo';
import { registerCampaignDiscoveryChains } from './campaignDiscoveryChains';
import { registerCampaignFinaleBreadth } from './campaignFinaleBreadth';
import { registerNadiaCampaignArc } from './campaignPrincipalArc';
import { registerItemBreadth } from './itemBreadth';

/**
 * Canonical additive content bootstrap shared by production and tests.
 * Registrars are intentionally idempotent so repeated calls are safe.
 */
export function registerAllContent(): void {
  registerItemBreadth();
  registerCampaignBreadth();
  registerCampaignBreadthTwo();
  registerCampaignBreadthThree();
  registerCampaignBreadthFour();
  registerCampaignBreadthFive();
  registerCampaignFinaleBreadth();
  registerNadiaCampaignArc();
  registerCampaignDiscoveryChains();
  registerCampaignAftermathDiscovery();
}