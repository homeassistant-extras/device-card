import attributesSpec from './attributes.spec';
import deviceSectionSpec from './device-section.spec';
import percentSpec from './percent.spec';
import pictureSpec from './picture.spec';
import rowSpec from './row.spec';
import sectionSpec from './section.spec';
import showMoreSpec from './show-more.spec';
import stateContentSpec from './state-content.spec';

describe('html', () => {
  attributesSpec();
  deviceSectionSpec();
  percentSpec();
  pictureSpec();
  rowSpec();
  sectionSpec();
  showMoreSpec();
  stateContentSpec();
});
