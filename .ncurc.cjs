/**
 * Hold TypeScript on 6.x. TypeScript 7 breaks the current toolchain.
 * npm-check-updates loads this automatically for `yarn update`.
 */
module.exports = {
  filterResults: (name, { currentVersionSemver, upgradedVersionSemver }) => {
    if (name !== 'typescript') {
      return true;
    }

    const currentMajor = Number.parseInt(currentVersionSemver?.[0]?.major, 10);
    const upgradedMajor = Number.parseInt(upgradedVersionSemver?.major, 10);
    if (!Number.isFinite(currentMajor) || !Number.isFinite(upgradedMajor)) {
      return false;
    }

    return upgradedMajor <= currentMajor;
  },
};
