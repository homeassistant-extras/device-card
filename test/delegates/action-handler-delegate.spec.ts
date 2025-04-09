import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import { DeviceCard } from '@device/card';
import type { Config } from '@device/types';
import * as fireEventModule from '@hass/common/dom/fire_event';
import type { ActionHandlerEvent } from '@hass/data/lovelace/action_handler';
import * as actionHandlerDirective from '@hass/panels/lovelace/common/directives/action-handler-directive';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { restore, type SinonStub, stub } from 'sinon';

export default () => {
  describe('action-handler-delegate.ts', () => {
    let config: Config;
    let fireEventStub: SinonStub;
    let hassActionHandlerStub: SinonStub;

    beforeEach(() => {
      // Set up stubs for the dependencies
      fireEventStub = stub(fireEventModule, 'fireEvent');
      hassActionHandlerStub = stub(actionHandlerDirective, 'actionHandler');
      config = {
        device_id: 'device_1',
      };
    });

    afterEach(() => {
      // Clean up all stubs
      restore();
    });

    describe('actionHandler', () => {
      it('should call hassActionHandler with the correct configuration when double_tap_action is not "none"', () => {
        // Arrange
        const entity = {
          config: {
            entity_id: 'light.living_room',
            double_tap_action: { action: 'toggle' },
            hold_action: { action: 'none' },
          },
        };

        // Act
        actionHandler(entity as any);

        // Assert
        expect(hassActionHandlerStub.calledOnce).to.be.true;
        expect(hassActionHandlerStub.firstCall.args[0]).to.deep.equal({
          hasDoubleClick: true,
          hasHold: false,
        });
      });

      it('should call hassActionHandler with the correct configuration when hold_action is not "none"', () => {
        // Arrange
        const entity = {
          config: {
            entity_id: 'light.living_room',
            double_tap_action: { action: 'none' },
            hold_action: { action: 'more-info' },
          },
        };

        // Act
        actionHandler(entity as any);

        // Assert
        expect(hassActionHandlerStub.calledOnce).to.be.true;
        expect(hassActionHandlerStub.firstCall.args[0]).to.deep.equal({
          hasDoubleClick: false,
          hasHold: true,
        });
      });

      it('should call hassActionHandler with hasDoubleClick and hasHold as false when both actions are "none"', () => {
        // Arrange
        const entity = {
          config: {
            entity_id: 'light.living_room',
            double_tap_action: { action: 'none' },
            hold_action: { action: 'none' },
          },
        };

        // Act
        actionHandler(entity as any);

        // Assert
        expect(hassActionHandlerStub.calledOnce).to.be.true;
        expect(hassActionHandlerStub.firstCall.args[0]).to.deep.equal({
          hasDoubleClick: false,
          hasHold: false,
        });
      });

      it('should handle undefined config values gracefully', () => {
        // Arrange
        const entity = {
          config: {
            entity_id: 'light.living_room',
          },
        };

        // Act
        actionHandler(entity as any);

        // Assert
        expect(hassActionHandlerStub.calledOnce).to.be.true;
        expect(hassActionHandlerStub.firstCall.args[0]).to.deep.equal({
          hasDoubleClick: false,
          hasHold: false,
        });
      });
    });

    describe('handleClickAction', () => {
      let mockEntity: EntityInformation;
      let mockElement: DeviceCard;

      beforeEach(() => {
        // Create a mock DeviceCard element
        mockElement = new DeviceCard();
        mockElement.expandedEntities = {};

        // Create a mock entity
        mockEntity = {
          entity_id: 'light.living_room',
          state: 'on',
          attributes: { friendly_name: 'Living Room Light' },
          isProblemEntity: false,
          isActive: true,
          translation_key: undefined,
          config: {
            entity_id: 'light.living_room',
            tap_action: { action: 'toggle' },
          },
        } as unknown as EntityInformation;
      });

      it('should not fire an event if no action is provided', () => {
        // Arrange
        const handler = handleClickAction(mockElement, config, mockEntity);
        const event = { detail: {} } as ActionHandlerEvent;

        // Act
        handler.handleEvent(event);

        // Assert
        expect(fireEventStub.called).to.be.false;
      });

      it('should fire a "hass-action" event with the correct parameters when an action is provided', () => {
        // Arrange
        const handler = handleClickAction(mockElement, config, mockEntity);
        const event = { detail: { action: 'tap' } } as ActionHandlerEvent;

        // Act
        handler.handleEvent(event);

        // Assert
        expect(fireEventStub.calledOnce).to.be.true;
        expect(fireEventStub.firstCall.args[0]).to.equal(mockElement);
        expect(fireEventStub.firstCall.args[1]).to.equal('hass-action');
        expect(fireEventStub.firstCall.args[2]).to.deep.equal({
          config: {
            entity: 'light.living_room',
            entity_id: 'light.living_room',
            tap_action: { action: 'toggle' },
          },
          action: 'tap',
        });
      });

      it('should include all entity config properties in the fired event', () => {
        // Arrange
        mockEntity.config = {
          tap_action: { action: 'toggle' },
          double_tap_action: { action: 'more-info' },
          hold_action: { action: 'none' },
        };
        const handler = handleClickAction(mockElement, config, mockEntity);
        const event = { detail: { action: 'hold' } } as ActionHandlerEvent;

        // Act
        handler.handleEvent(event);

        // Assert
        expect(fireEventStub.calledOnce).to.be.true;
        expect(fireEventStub.firstCall.args[2].config).to.include({
          entity: 'light.living_room',
        });
        expect(fireEventStub.firstCall.args[2].action).to.equal('hold');
      });

      it('should toggle entity attributes when tap action is undefined and attributes are not disabled', () => {
        // Arrange
        mockEntity.config = {
          tap_action: undefined,
        };

        const handler = handleClickAction(mockElement, config, mockEntity);
        const event = {
          detail: { action: 'tap' },
          stopPropagation: stub(),
        } as unknown as ActionHandlerEvent;

        // Act
        handler.handleEvent(event);

        // Assert
        expect(fireEventStub.called).to.be.false;
        expect((event.stopPropagation as SinonStub).called).to.be.true; // Fixed assertion
        expect(mockElement.expandedEntities[mockEntity.entity_id]).to.be.true;
      });

      it('should not toggle entity attributes when disable_attributes feature is enabled', () => {
        // Arrange
        mockEntity.config = {
          tap_action: { action: 'none' },
        };

        const handler = handleClickAction(mockElement, config, mockEntity);
        const event = {
          detail: { action: 'tap' },
          stopPropagation: stub(),
        } as unknown as ActionHandlerEvent;

        // Act
        handler.handleEvent(event);

        // Assert
        expect(fireEventStub.calledOnce).to.be.true; // Should still fire the event
        expect(mockElement.expandedEntities[mockEntity.entity_id]).to.be
          .undefined;
      });

      it('should toggle entity attributes from expanded to collapsed', () => {
        // Arrange
        mockEntity.config = {};

        // Set the entity as initially expanded
        mockElement.expandedEntities = { [mockEntity.entity_id]: true };

        const handler = handleClickAction(mockElement, config, mockEntity);
        const event = {
          detail: { action: 'tap' },
          stopPropagation: stub(),
        } as unknown as ActionHandlerEvent;

        // Act
        handler.handleEvent(event);

        // Assert
        expect(mockElement.expandedEntities[mockEntity.entity_id]).to.be.false;
      });

      it('should initialize expandedEntities if it does not exist', () => {
        // Arrange
        mockEntity.config = {};

        // Set expandedEntities to undefined
        mockElement.expandedEntities = undefined!;

        const handler = handleClickAction(mockElement, config, mockEntity);
        const event = {
          detail: { action: 'tap' },
          stopPropagation: stub(),
        } as unknown as ActionHandlerEvent;

        // Act
        handler.handleEvent(event);

        // Assert
        expect(mockElement.expandedEntities).to.be.an('object');
        expect(mockElement.expandedEntities[mockEntity.entity_id]).to.be.true;
      });
    });
  });
};
