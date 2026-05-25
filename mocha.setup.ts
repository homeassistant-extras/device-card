import { JSDOM } from 'jsdom';

declare global {
  interface Window {
    customCards: Array<object>;
    matchMedia: (query: string) => MediaQueryList;
  }
}

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

// Set up browser environment globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.window = dom.window as any;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).addEventListener = dom.window.addEventListener.bind(
  dom.window,
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).removeEventListener = dom.window.removeEventListener.bind(
  dom.window,
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).dispatchEvent = dom.window.dispatchEvent.bind(dom.window);

// Add missing DOM features
global.window.matchMedia =
  global.window.matchMedia ||
  (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    media: '',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
