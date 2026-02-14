import * as wsTemplatesModule from '@hass/data/ws-templates';
import type { Connection } from '@hass/ws/types';
import { TemplateSubscription } from '@integration/template-subscription';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('template-subscription.ts', () => {
  let subscribeStub: sinon.SinonStub;
  let mockConn: Connection;

  beforeEach(() => {
    subscribeStub = stub(wsTemplatesModule, 'subscribeRenderTemplate');
    mockConn = {} as Connection;
  });

  afterEach(() => {
    subscribeStub.restore();
  });

  it('should call subscribeRenderTemplate when connect is called', () => {
    subscribeStub.resolves(() => {});

    const onChange = stub();
    const sub = new TemplateSubscription(onChange);

    sub.connect(mockConn, '{{ ["dev1", "dev2"] }}');

    expect(subscribeStub.calledOnce).to.be.true;
    expect(subscribeStub.firstCall.args[0]).to.equal(mockConn);
    expect(subscribeStub.firstCall.args[2]).to.deep.include({
      template: '{{ ["dev1", "dev2"] }}',
    });
  });

  it('should invoke onChange when template resolves with device IDs', async () => {
    let capturedCallback: (msg: { result: string[] }) => void;
    subscribeStub.callsFake((_conn, cb) => {
      capturedCallback = cb;
      return Promise.resolve(() => {});
    });

    const onChange = stub();
    const sub = new TemplateSubscription(onChange);

    sub.connect(mockConn, '{{ ["dev1"] }}');
    await Promise.resolve();

    capturedCallback!({ result: ['dev1', 'dev2'] });
    expect(onChange.calledOnce).to.be.true;
    expect(sub.deviceIds).to.deep.equal(['dev1', 'dev2']);
  });

  it('should not invoke onChange when template returns error', async () => {
    let capturedCallback: (msg: { error: string }) => void;
    subscribeStub.callsFake((_conn, cb) => {
      capturedCallback = cb;
      return Promise.resolve(() => {});
    });

    const onChange = stub();
    const sub = new TemplateSubscription(onChange);

    sub.connect(mockConn, '{{ invalid }}');
    await Promise.resolve();

    capturedCallback!({ error: 'template error' });
    expect(onChange.called).to.be.false;
  });

  it('should disconnect and clear subscription', async () => {
    const unsub = stub();
    subscribeStub.resolves(unsub);

    const sub = new TemplateSubscription(() => {});
    sub.connect(mockConn, '{{ [] }}');
    await Promise.resolve();

    sub.disconnect();

    expect(sub.subscribedTemplate).to.be.undefined;
    expect(sub.deviceIds).to.be.undefined;
  });
});
