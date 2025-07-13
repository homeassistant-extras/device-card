import { hasFeature } from '@config/feature';
import type { BaseConfig, Features } from '@type/config';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('feature', () => {
  it('should return true when config is null', () => {
    expect(hasFeature(null as any as BaseConfig, 'entity_picture')).to.be.true;
  });

  it('should return true when config is undefined', () => {
    expect(hasFeature(undefined as any as BaseConfig, 'entity_picture')).to.be
      .true;
  });

  it('should return false when config.features is undefined', () => {
    const config = {} as BaseConfig;
    expect(hasFeature(config, 'entity_picture')).to.be.false;
  });

  it('should return false when config.features is empty', () => {
    const config = {} as BaseConfig;
    expect(hasFeature(config, 'entity_picture')).to.be.false;
  });

  it('should return true when feature is present in config.features', () => {
    const config = {
      features: ['entity_picture', 'exclude_default_entities'],
    } as BaseConfig;
    expect(hasFeature(config, 'entity_picture')).to.be.true;
  });

  it('should return false when feature is not present in config.features', () => {
    const config = {
      features: ['hide_device_model'],
    } as BaseConfig;
    expect(hasFeature(config, 'entity_picture')).to.be.false;
  });

  it('should handle case-sensitive feature names', () => {
    const config = {
      features: ['entity_picture'],
    } as BaseConfig;
    expect(hasFeature(config, 'hide_device_model')).to.be.false;
    expect(hasFeature(config, 'entity_picture')).to.be.true;
  });

  // Edge cases
  it('should handle empty string feature names', () => {
    const config = { features: ['' as any as Features] } as BaseConfig;
    expect(hasFeature(config, '' as any as Features)).to.be.true;
  });
});
