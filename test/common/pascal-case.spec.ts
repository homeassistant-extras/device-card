import { pascalCase } from '@/common/pascal-case';
import * as capitalizeModule from '@hass/common/string/capitalize-first-letter';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('pascal-case.ts', () => {
  describe('pascalCase', () => {
    let capitalizeStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a stub for the capitalizeFirstLetter function
      capitalizeStub = stub(capitalizeModule, 'capitalizeFirstLetter');
      // Make the stub behave like the original function by default
      capitalizeStub.callsFake(
        (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
      );
    });

    afterEach(() => {
      // Restore the original function
      capitalizeStub.restore();
    });

    it('should convert snake_case to Pascal Case', () => {
      expect(pascalCase('hello_world')).to.equal('Hello World');
      expect(pascalCase('user_profile')).to.equal('User Profile');
      expect(pascalCase('home_assistant')).to.equal('Home Assistant');
    });

    it('should handle multiple underscores', () => {
      expect(pascalCase('hello_beautiful_world')).to.equal(
        'Hello Beautiful World',
      );
      expect(pascalCase('home_assistant_dashboard')).to.equal(
        'Home Assistant Dashboard',
      );
    });

    it('should handle single words', () => {
      expect(pascalCase('hello')).to.equal('Hello');
      expect(pascalCase('world')).to.equal('World');
    });

    it('should handle empty strings', () => {
      expect(pascalCase('')).to.equal('');
    });

    it('should handle strings with leading or trailing underscores', () => {
      expect(pascalCase('_hello_world')).to.equal(' Hello World');
      expect(pascalCase('hello_world_')).to.equal('Hello World ');
      expect(pascalCase('_hello_world_')).to.equal(' Hello World ');
    });

    it('should call capitalizeFirstLetter for each word', () => {
      pascalCase('hello_world_test');

      expect(capitalizeStub.calledThrice).to.be.true;
      expect(capitalizeStub.firstCall.args[0]).to.equal('hello');
      expect(capitalizeStub.secondCall.args[0]).to.equal('world');
      expect(capitalizeStub.thirdCall.args[0]).to.equal('test');
    });
  });
});
