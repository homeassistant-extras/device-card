import { matchesDevicePatterns, matchesPattern } from '@common/matches';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('matches.ts', () => {
  describe('matchesPattern', () => {
    // Stub console.warn to prevent test output pollution
    let consoleWarnStub: sinon.SinonStub;

    beforeEach(() => {
      consoleWarnStub = stub(console, 'warn');
    });

    afterEach(() => {
      consoleWarnStub.restore();
    });

    describe('exact matching', () => {
      it('should match identical strings', () => {
        expect(matchesPattern('light.living_room', 'light.living_room')).to.be
          .true;
        expect(matchesPattern('sensor.temperature', 'sensor.temperature')).to.be
          .true;
        expect(matchesPattern('switch.bedroom_light', 'switch.bedroom_light'))
          .to.be.true;
      });

      it('should not match different strings', () => {
        expect(matchesPattern('light.living_room', 'light.bedroom')).to.be
          .false;
        expect(matchesPattern('sensor.temperature', 'sensor.humidity')).to.be
          .false;
        expect(matchesPattern('device_tracker.phone', 'device_tracker.tablet'))
          .to.be.false;
      });

      it('should be case sensitive', () => {
        expect(matchesPattern('light.Living_Room', 'light.living_room')).to.be
          .false;
        expect(matchesPattern('SENSOR.temperature', 'sensor.temperature')).to.be
          .false;
      });
    });

    describe('wildcard matching', () => {
      it('should match with prefix wildcards', () => {
        expect(matchesPattern('light.living_room', '*living_room')).to.be.true;
        expect(matchesPattern('switch.living_room', '*living_room')).to.be.true;
        expect(matchesPattern('sensor.living_room', '*living_room')).to.be.true;
      });

      it('should match with suffix wildcards', () => {
        expect(matchesPattern('light.living_room', 'light.*')).to.be.true;
        expect(matchesPattern('light.bedroom', 'light.*')).to.be.true;
        expect(matchesPattern('light.kitchen', 'light.*')).to.be.true;
      });

      it('should match with middle wildcards', () => {
        expect(
          matchesPattern('sensor.bedroom_temperature', 'sensor.*temperature'),
        ).to.be.true;
        expect(
          matchesPattern('sensor.kitchen_temperature', 'sensor.*temperature'),
        ).to.be.true;
        expect(
          matchesPattern(
            'sensor.living_room_temperature',
            'sensor.*temperature',
          ),
        ).to.be.true;
      });

      it('should match with multiple wildcards', () => {
        expect(
          matchesPattern(
            'sensor.bedroom_temperature_celsius',
            'sensor.*temperature*',
          ),
        ).to.be.true;
        expect(matchesPattern('light.kitchen_light_1', 'light.*light*')).to.be
          .true;
        expect(
          matchesPattern('switch.outside_switch_garden', 'switch.*switch*'),
        ).to.be.true;
      });

      it('should require all non-wildcard parts to match', () => {
        expect(matchesPattern('sensor.bedroom_humidity', 'sensor.*temperature'))
          .to.be.false;
        expect(
          matchesPattern('sensor.bedroom_temperature', 'switch.*temperature'),
        ).to.be.false;
        expect(
          matchesPattern(
            'sensor.bedroom_temperature_fahrenheit',
            'sensor.*temperature_celsius',
          ),
        ).to.be.false;
      });

      it('should not treat "." as a wildcard', () => {
        expect(
          matchesPattern('sensor.bedroom.temperature', 'sensor.*.temperature'),
        ).to.be.true;
        expect(
          matchesPattern('sensor_bedroom_temperature', 'sensor.*.temperature'),
        ).to.be.false;
      });

      it('should properly escape special regex characters', () => {
        expect(matchesPattern('sensor.bedroom+light', 'sensor.*+*')).to.be.true;
        expect(matchesPattern('switch.living.room', 'switch.*.*')).to.be.true;
        expect(matchesPattern('light.bedroom(main)', 'light.*(main)')).to.be
          .true;
        expect(matchesPattern('device_tracker.$phone', 'device_tracker.$*')).to
          .be.true;
      });
    });

    describe('regex matching', () => {
      it('should match basic regex patterns', () => {
        expect(matchesPattern('light.living_room', '/light\\.living_room/')).to
          .be.true;
        expect(matchesPattern('sensor.temperature', '/sensor\\.temperature/'))
          .to.be.true;
      });

      it('should match regex patterns with alternation', () => {
        expect(
          matchesPattern('light.living_room', '/(light|switch)\\.living_room/'),
        ).to.be.true;
        expect(
          matchesPattern(
            'switch.living_room',
            '/(light|switch)\\.living_room/',
          ),
        ).to.be.true;
        expect(
          matchesPattern(
            'sensor.living_room',
            '/(light|switch)\\.living_room/',
          ),
        ).to.be.false;
      });

      it('should match regex patterns with character classes', () => {
        expect(matchesPattern('light.room1', '/light\\.room[0-9]/')).to.be.true;
        expect(matchesPattern('light.room9', '/light\\.room[0-9]/')).to.be.true;
        expect(matchesPattern('light.roomA', '/light\\.room[0-9]/')).to.be
          .false;
      });

      it('should match regex patterns with quantifiers', () => {
        expect(
          matchesPattern('switch.fan_speed_1', '/switch\\.fan_speed_\\d+/'),
        ).to.be.true;
        expect(
          matchesPattern('switch.fan_speed_42', '/switch\\.fan_speed_\\d+/'),
        ).to.be.true;
        expect(
          matchesPattern('switch.fan_speed_high', '/switch\\.fan_speed_\\d+/'),
        ).to.be.false;
      });

      it('should match regex patterns with anchors', () => {
        expect(matchesPattern('light.bedroom', '/^light\\./')).to.be.true;
        expect(matchesPattern('sensor.bedroom', '/^light\\./')).to.be.false;
        expect(matchesPattern('sensor.temperature_celsius', '/celsius$/')).to.be
          .true;
        expect(matchesPattern('sensor.temperature_fahrenheit', '/celsius$/')).to
          .be.false;
      });

      it('should handle complex regex patterns', () => {
        expect(
          matchesPattern(
            'device_tracker.3_day_blinds_wired',
            '/device_tracker\\.3_day_blinds_(wired|wireless)/',
          ),
        ).to.be.true;
        expect(
          matchesPattern(
            'device_tracker.3_day_blinds_wireless',
            '/device_tracker\\.3_day_blinds_(wired|wireless)/',
          ),
        ).to.be.true;
        expect(
          matchesPattern(
            'device_tracker.3_day_blinds_old',
            '/device_tracker\\.3_day_blinds_(wired|wireless)/',
          ),
        ).to.be.false;

        expect(matchesPattern('esp_living_airfresh', '/esp_.*_airfresh/')).to.be
          .true;
        expect(matchesPattern('esp_bedroom_airfresh', '/esp_.*_airfresh/')).to
          .be.true;
        expect(matchesPattern('esp_kitchen_fan', '/esp_.*_airfresh/')).to.be
          .false;
      });

      it('should handle invalid regex patterns gracefully', () => {
        // Test with unclosed group
        expect(matchesPattern('light.living_room', '/light\\.(living|/')).to.be
          .false;
        expect(
          consoleWarnStub.calledWith(
            'Invalid regex pattern: /light\\.(living|/',
          ),
        ).to.be.true;

        // Test with invalid character class
        consoleWarnStub.reset();
        expect(matchesPattern('light.bedroom', '/light\\.[a-/')).to.be.false;
        expect(
          consoleWarnStub.calledWith('Invalid regex pattern: /light\\.[a-/'),
        ).to.be.true;
      });
    });

    describe('edge cases', () => {
      it('should handle null values', () => {
        expect(matchesPattern(null, 'light.living_room')).to.be.false;
        expect(matchesPattern(null, '*')).to.be.false;
        expect(matchesPattern(null, '/.*/')).to.be.false;
      });

      it('should handle empty strings', () => {
        expect(matchesPattern('', '')).to.be.true;
        expect(matchesPattern('light.living_room', '')).to.be.false;
        expect(matchesPattern('', 'light.living_room')).to.be.false;
      });

      it('should match all strings with universal patterns', () => {
        expect(matchesPattern('light.living_room', '*')).to.be.true;
        expect(matchesPattern('sensor.temperature', '*')).to.be.true;
        expect(matchesPattern('any_string_at_all', '*')).to.be.true;

        expect(matchesPattern('light.living_room', '/.*/')).to.be.true;
        expect(matchesPattern('sensor.temperature', '/.*/')).to.be.true;
        expect(matchesPattern('any_string_at_all', '/.*/')).to.be.true;
      });

      it('should handle patterns with special characters', () => {
        // Test with patterns containing regex special characters as literals
        expect(matchesPattern('sensor.temp+humidity', 'sensor.temp+humidity'))
          .to.be.true;
        expect(
          matchesPattern('light.living_room(main)', 'light.living_room(main)'),
        ).to.be.true;
        expect(matchesPattern('switch.$kitchen', 'switch.$kitchen')).to.be.true;

        // Test with wildcards and special characters
        expect(matchesPattern('sensor.temp+humidity', 'sensor.*+*')).to.be.true;
        expect(matchesPattern('sensor.temp+pressure', 'sensor.*+*')).to.be.true;
        expect(matchesPattern('sensor.temp-humidity', 'sensor.*+*')).to.be
          .false;
      });
    });

    describe('real-world examples', () => {
      it('should handle device ID patterns', () => {
        expect(matchesPattern('esp_living_airfresh', 'esp_*_airfresh')).to.be
          .true;
        expect(matchesPattern('esp_bedroom_airfresh', 'esp_*_airfresh')).to.be
          .true;
        expect(matchesPattern('esp_kitchen_fan', 'esp_*_airfresh')).to.be.false;

        expect(matchesPattern('nous123', 'nous*')).to.be.true;
        expect(matchesPattern('nous_living_room', 'nous*')).to.be.true;
        expect(matchesPattern('other_device', 'nous*')).to.be.false;

        expect(
          matchesPattern(
            'aeX59eaXX5118XX3507XX46dXXXXe2X4',
            'aeX59eaXX5118XX3507XX46dXXXXe2X4',
          ),
        ).to.be.true;
      });

      it('should handle entity ID patterns', () => {
        expect(matchesPattern('sensor.bedroom_uptime', '*_uptime')).to.be.true;
        expect(matchesPattern('sensor.living_room_uptime', '*_uptime')).to.be
          .true;
        expect(matchesPattern('sensor.bedroom_temperature', '*_uptime')).to.be
          .false;

        expect(
          matchesPattern(
            'switch.3_day_blinds_wireless_paused',
            'switch.3_day_blinds_wireless_paused',
          ),
        ).to.be.true;

        expect(
          matchesPattern(
            'device_tracker.3_day_blinds_wired',
            '/device_tracker\\.3_day_blinds_(wired|wireless)/',
          ),
        ).to.be.true;
        expect(
          matchesPattern(
            'device_tracker.3_day_blinds_wireless',
            '/device_tracker\\.3_day_blinds_(wired|wireless)/',
          ),
        ).to.be.true;
        expect(
          matchesPattern(
            'light.3_day_blinds_wireless',
            '/device_tracker\\.3_day_blinds_(wired|wireless)/',
          ),
        ).to.be.false;
      });
    });
  });

  describe('matchesDevicePatterns', () => {
    it('returns false for empty or undefined patterns', () => {
      expect(matchesDevicePatterns('dev1', 'Device 1', undefined)).to.be.false;
      expect(matchesDevicePatterns('dev1', 'Device 1', [])).to.be.false;
    });

    it('matches device ID', () => {
      expect(
        matchesDevicePatterns('dev1', 'Device 1', ['dev1']),
      ).to.be.true;
      expect(
        matchesDevicePatterns('dev2', 'Device 2', ['dev1']),
      ).to.be.false;
    });

    it('matches device name', () => {
      expect(
        matchesDevicePatterns('other_id', 'Device 1', ['Device 1']),
      ).to.be.true;
      expect(
        matchesDevicePatterns('other_id', 'Device 2', ['Device 1']),
      ).to.be.false;
    });

    it('matches either ID or name', () => {
      expect(
        matchesDevicePatterns('dev1', 'Other Name', ['dev1']),
      ).to.be.true;
      expect(
        matchesDevicePatterns('other_id', 'Device 1', ['Device 1']),
      ).to.be.true;
    });

    it('handles null device name', () => {
      expect(matchesDevicePatterns('dev1', null, ['dev1'])).to.be.true;
      expect(matchesDevicePatterns('dev1', null, ['Device 1'])).to.be.false;
    });

    it('supports wildcard patterns', () => {
      expect(
        matchesDevicePatterns('esp_living_airfresh', null, ['esp_*_airfresh']),
      ).to.be.true;
      expect(
        matchesDevicePatterns('esp_kitchen_fan', null, ['esp_*_airfresh']),
      ).to.be.false;
    });
  });
});
