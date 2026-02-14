import { subscribeRenderTemplate } from '@hass/data/ws-templates';
import type { Connection, UnsubscribeFunc } from '@hass/ws/types';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('ws-templates.ts', () => {
  describe('subscribeRenderTemplate', () => {
    it('calls conn.subscribeMessage with type render_template and params', async () => {
      const unsubscribe: UnsubscribeFunc = () => {};
      let capturedCallback: (msg: unknown) => void;
      const conn: Connection = {
        subscribeMessage: (callback, _msg) => {
          capturedCallback = callback as (msg: unknown) => void;
          return Promise.resolve(unsubscribe);
        },
      };

      const result = await subscribeRenderTemplate(conn, () => {}, {
        template: '{{ states("sensor.foo") }}',
      });

      expect(result).to.equal(unsubscribe);
      expect(capturedCallback!).to.be.a('function');
    });

    it('forwards messages to onChange', async () => {
      let capturedCallback: (msg: unknown) => void;
      const conn: Connection = {
        subscribeMessage: (callback) => {
          capturedCallback = callback as (msg: unknown) => void;
          return Promise.resolve(() => {});
        },
      };

      const received: unknown[] = [];
      await subscribeRenderTemplate(conn, (msg) => received.push(msg), {
        template: 'hello',
      });

      capturedCallback!({
        result: 42,
        listeners: { all: false, domains: [], entities: [], time: false },
      });
      expect(received).to.deep.equal([
        {
          result: 42,
          listeners: { all: false, domains: [], entities: [], time: false },
        },
      ]);
    });
  });
});
