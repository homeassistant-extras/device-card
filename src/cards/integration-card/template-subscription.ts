import { subscribeRenderTemplate } from '@hass/data/ws-templates';
import type { Connection, UnsubscribeFunc } from '@hass/ws/types';

/**
 * Manages a live Jinja template subscription over the HA websocket.
 *
 * Call {@link connect} when `hass` is available and {@link disconnect} on teardown.
 * Resolved values are delivered via the callback passed to the constructor.
 */
export class TemplateSubscription {
  private _unsub: Promise<UnsubscribeFunc> | undefined;
  private _subscribedTemplate: string | undefined;
  private _deviceIds: string[] | undefined;

  constructor(private readonly _onChange: () => void) {}

  /** The template string we're currently subscribed to (if any). */
  get subscribedTemplate(): string | undefined {
    return this._subscribedTemplate;
  }

  /** The resolved device IDs from the last template result. */
  get deviceIds(): string[] | undefined {
    return this._deviceIds;
  }

  /**
   * Subscribe to the given template. No-ops if already subscribed to the same
   * string. Tears down an existing subscription when the template changes.
   */
  connect(connection: Connection, template: string): void {
    if (this._subscribedTemplate === template) {
      return;
    }

    // Template changed — clean up old subscription first
    this.disconnect();

    this._subscribedTemplate = template;

    this._unsub = subscribeRenderTemplate(
      connection,
      (result) => {
        if ('error' in result) {
          console.error('Integration Card: template error:', result.error);
          return;
        }

        this._deviceIds = result.result as string[];
        this._onChange();
      },
      { template },
    );
  }

  /** Tear down the active subscription (if any). */
  disconnect(): void {
    if (this._unsub) {
      this._unsub.then((unsub) => unsub());
      this._unsub = undefined;
    }
    this._subscribedTemplate = undefined;
    this._deviceIds = undefined;
  }
}
