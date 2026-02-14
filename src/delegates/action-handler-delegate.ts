import type { HassUpdateEvent } from '@cards/mixins/hass-update-mixin';
import type { Expansions } from '@device/types';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { ActionHandlerEvent } from '@hass/data/lovelace/action_handler';
import { actionHandler as hassActionHandler } from '@hass/panels/lovelace/common/directives/action-handler-directive';
import type { ActionConfigParams } from '@hass/panels/lovelace/common/handle-action';
import type { EntityInformation } from '@type/config';

declare global {
  interface HASSDomEvents {
    'hass-update': HassUpdateEvent;
  }
}

/**
 * Toggles the expanded state of an entity row to show/hide attributes
 *
 * @param {HTMLElement} element - The card component instance
 * @param {Expansions} expansions - The expansions object for managing entity states
 * @param {string} entityId - The entity ID to toggle
 * @param {Event} e - The click event that triggered the toggle
 */
const toggleEntityAttributes = (
  expansions: Expansions,
  entityId: string,
  e: Event,
  updateExpansions: (expansion: Expansions) => void,
) => {
  // Prevent event from bubbling up
  e.stopPropagation();

  updateExpansions({
    ...expansions,
    expandedEntities: {
      ...expansions.expandedEntities,
      [entityId]: !expansions.expandedEntities[entityId],
    },
  } as Expansions);
};

/**
 * Creates an action handler for an entity with specified configuration.
 * This is the main export that should be used by consumers of this module.
 *
 * The handler takes into account whether the entity has double-tap or hold
 * actions configured and creates an appropriate action handler directive.
 *
 * @param {EntityInformation} entity - The entity to create an action handler for
 * @returns {Directive} A directive configured with the entity's action options
 *
 * @example
 * ```typescript
 * // In a custom card component
 * render() {
 *   return html`
 *     <div class="card-content"
 *          @action=${this._handleAction}
 *          .actionHandler=${actionHandler(this.entity)}>
 *       ${this.entity.state}
 *     </div>
 *   `;
 * }
 * ```
 */
export const actionHandler = (entity: EntityInformation) => {
  const isActionEnabled = (actionConfig?: { action?: string }) =>
    actionConfig?.action !== 'none' && actionConfig?.action !== undefined;

  return hassActionHandler({
    hasDoubleClick: isActionEnabled(entity.config?.double_tap_action),
    hasHold: isActionEnabled(entity.config?.hold_action),
  });
};

/**
 * Creates a click action handler for a given element and entity.
 * The handler processes click events and dispatches them as Home Assistant actions.
 *
 * This function returns an event handler object that can be directly attached to
 * an event listener. When an action event occurs, it will extract the action type
 * from the event and fire a 'hass-action' event with the appropriate configuration.
 *
 * @param {HTMLElement} element - The DOM element that will receive the action
 * @param {Expansions} expansions - The expansions object for managing entity states
 * @param {EntityInformation} entity - The entity information containing configuration and state
 * @returns {Object} An object with a handleEvent method that processes actions
 *
 * @example
 * ```typescript
 * // Usage in a component
 * const element = document.querySelector('.my-element');
 * const entityInfo = { config: { entity_id: 'light.living_room', ... } };
 * element.addEventListener('click', handleClickAction(element, entityInfo));
 *
 * // Or in a lit-html component
 * html`<div @action=${handleClickAction(this, this.entity)}></div>`
 * ```
 */
export const handleClickAction = (
  element: HTMLElement,
  expansions: Expansions,
  entity: EntityInformation,
  updateExpansions: (expansion: Expansions) => void,
): { handleEvent: (ev: ActionHandlerEvent) => void } => {
  return {
    /**
     * Handles an action event by creating and dispatching a 'hass-action' custom event.
     * The event contains the entity configuration and the action type (tap, double_tap, hold).
     *
     * @param {ActionHandlerEvent} ev - The action handler event to process
     */
    handleEvent: (ev: ActionHandlerEvent): void => {
      // Extract action from event detail
      const action = ev.detail?.action;
      if (!action) return;

      // If the action is 'tap' and no specific tap action is set, toggle entity attributes
      if (action === 'tap' && !entity.config?.tap_action) {
        toggleEntityAttributes(
          expansions,
          entity.entity_id,
          ev,
          updateExpansions,
        );
        return;
      }

      // Create configuration object for the action
      const actionConfig: ActionConfigParams = {
        entity: entity.entity_id,
        ...entity.config,
      };

      // @ts-ignore
      fireEvent(element, 'hass-action', {
        config: actionConfig,
        action,
      });
    },
  };
};
