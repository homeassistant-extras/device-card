/**
 * Shared test setup, loaded after the JSDOM globals (see .mocharc.json).
 *
 * Home Assistant defines `<action-handler>` globally; the `actionHandler`
 * directive looks it up and calls `bind()`. Provide a stub that records the
 * bound options so specs can assert on them and dispatch `action` events.
 */
if (!customElements.get('action-handler')) {
  customElements.define(
    'action-handler',
    class extends HTMLElement {
      bind(element: HTMLElement & { actionHandler?: unknown }, options = {}) {
        element.actionHandler = { options };
      }
    },
  );
}
