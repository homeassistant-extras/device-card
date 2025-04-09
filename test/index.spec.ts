import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('index.ts', () => {
  let customElementsStub: SinonStub;
  let customCardsStub: Array<Object> | undefined;

  beforeEach(() => {
    // Stub customElements.define to prevent actual registration
    customElementsStub = stub(customElements, 'define');

    // Create a stub for window.customCards
    customCardsStub = [];
    Object.defineProperty(window, 'customCards', {
      get: () => customCardsStub,
      set: (value) => {
        customCardsStub = value;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore the original customElements.define
    customElementsStub.restore();
    customCardsStub = undefined;
    delete require.cache[require.resolve('@/index.ts')];
  });

  it('should register all custom elements', () => {
    require('@/index.ts');
    expect(customElementsStub.callCount).to.equal(4);
    expect(customElementsStub.firstCall.args[0]).to.equal('device-card');
    expect(customElementsStub.secondCall.args[0]).to.equal(
      'device-card-editor',
    );
    expect(customElementsStub.thirdCall.args[0]).to.equal('integration-card');
    expect(customElementsStub.getCall(3).args[0]).to.equal(
      'integration-card-editor',
    );
  });

  it('should initialize window.customCards if undefined', () => {
    customCardsStub = undefined;
    require('@/index.ts');

    expect(window.customCards).to.be.an('array');
  });

  it('should add card configurations with all fields to window.customCards', () => {
    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(2);

    // Check device-card configuration
    expect(window.customCards[0]).to.deep.equal({
      type: 'device-card',
      name: 'Device Card',
      description: 'A card to summarize the status of a Device.',
      preview: true,
      documentationURL: 'https://github.com/homeassistant-extras/device-card',
    });

    // Check integration-card configuration
    expect(window.customCards[1]).to.deep.equal({
      type: 'integration-card',
      name: 'Integration Card',
      description: 'A card to display all devices from a specific integration.',
      preview: true,
      documentationURL: 'https://github.com/homeassistant-extras/device-card',
    });
  });

  it('should preserve existing cards when adding new card', () => {
    // Add an existing card
    window.customCards = [
      {
        type: 'existing-card',
        name: 'Existing Card',
      },
    ];

    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(3);
    expect(window.customCards[0]).to.deep.equal({
      type: 'existing-card',
      name: 'Existing Card',
    });
  });

  it('should handle multiple imports without duplicating registration', () => {
    require('@/index.ts');
    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(2);
    expect(customElementsStub.callCount).to.equal(4); // Called once for each component
  });
});
