import type { CardHelpers } from '@type/lovelace';

declare global {
  var poatCardHelpers: CardHelpers | undefined;
}

let _helpersPromise: Promise<CardHelpers> | undefined;

// todo - don't have this
/** Clears singleton state (unit tests only). */
export function resetPoatCardHelpersForTests(): void {
  _helpersPromise = undefined;
  Reflect.deleteProperty(globalThis, 'poatCardHelpers');
}

export function setPoatCardHelpers(helpers: CardHelpers): void {
  globalThis.poatCardHelpers = helpers;
}

export function getPoatCardHelpers(): CardHelpers | undefined {
  return globalThis.poatCardHelpers;
}

export function resolvePoatCardHelpers(
  loader: (() => Promise<CardHelpers>) | undefined,
): Promise<CardHelpers> {
  const existing = getPoatCardHelpers();
  if (existing) {
    return Promise.resolve(existing);
  }

  if (_helpersPromise !== undefined) {
    return _helpersPromise;
  }

  if (!loader) {
    return Promise.reject(
      new Error('[device-card] helpers: missing globalThis.loadCardHelpers'),
    );
  }

  _helpersPromise = loader().then((helpers) => {
    setPoatCardHelpers(helpers);
    return helpers;
  });

  return _helpersPromise;
}
