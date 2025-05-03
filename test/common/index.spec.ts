import matchesSpec from './matches.spec';
import pascalCaseSpec from './pascal-case.spec';
import sortEntitiesSpec from './sort-entities.spec';

describe('common', () => {
  matchesSpec();
  pascalCaseSpec();
  sortEntitiesSpec();
});
