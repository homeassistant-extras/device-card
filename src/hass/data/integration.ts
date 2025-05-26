/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/integration.ts
 */

export type IntegrationType =
  | 'device'
  | 'helper'
  | 'hub'
  | 'service'
  | 'hardware'
  | 'entity'
  | 'system';

export interface IntegrationManifest {
  domain: string;
  name: string;
  integration_type?: IntegrationType;
}
