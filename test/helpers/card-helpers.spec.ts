import type { CardHelpers } from '@type/lovelace';
import { expect } from 'chai';
import { stub } from 'sinon';
import {
  getPoatCardHelpers,
  resetPoatCardHelpersForTests,
  resolvePoatCardHelpers,
  setPoatCardHelpers,
} from '../../src/helpers/card-helpers';

describe('card-helpers.ts', () => {
  let consoleLogStub: sinon.SinonStub;

  beforeEach(() => {
    resetPoatCardHelpersForTests();
    consoleLogStub = stub(console, 'log');
  });

  afterEach(() => {
    consoleLogStub.restore();
  });

  it('reject when loader is missing', async () => {
    try {
      await resolvePoatCardHelpers(undefined);
      expect.fail('expected rejection');
    } catch (e) {
      expect(e).to.be.instanceOf(Error);
      expect((e as Error).message).to.equal(
        '[device-card] helpers: missing globalThis.loadCardHelpers',
      );
    }
  });

  it('setDeviceCardHelpers / getDeviceCardHelpers round-trip', () => {
    const helpers = {
      createRowElement: () => document.createElement('div'),
    } as unknown as CardHelpers;

    setPoatCardHelpers(helpers);
    expect(getPoatCardHelpers()).to.equal(helpers);
  });

  it('resolveDeviceCardHelpers shares one in-flight load across callers', async () => {
    const mockHelpers = {
      createRowElement: () => document.createElement('div'),
    } as unknown as CardHelpers;

    let finish!: (h: CardHelpers) => void;
    const pending = new Promise<CardHelpers>((resolve) => {
      finish = resolve;
    });

    const loader = stub().returns(pending);

    const p1 = resolvePoatCardHelpers(loader);
    const p2 = resolvePoatCardHelpers(loader);

    expect(loader.calledOnce).to.be.true;

    finish(mockHelpers);

    const [a, b] = await Promise.all([p1, p2]);

    expect(a).to.equal(mockHelpers);
    expect(b).to.equal(mockHelpers);
  });

  it('resolveDeviceCardHelpers returns immediately when helpers already set', async () => {
    const mockHelpers = {
      createRowElement: () => document.createElement('div'),
    } as unknown as CardHelpers;

    setPoatCardHelpers(mockHelpers);

    const loader = stub().resolves({
      createRowElement: () => document.createElement('span'),
    } as unknown as CardHelpers);

    const result = await resolvePoatCardHelpers(loader);

    expect(loader.called).to.be.false;
    expect(result).to.equal(getPoatCardHelpers());
  });
});
