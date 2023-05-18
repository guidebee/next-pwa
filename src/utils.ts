import type { GenerateSW, InjectManifest } from 'workbox-webpack-plugin';

import type { WorkboxTypes } from './private-types.js';

export const overrideAfterCalledMethod = (
  workboxPlugin: InjectManifest | GenerateSW
) => {
  Object.defineProperty(workboxPlugin, 'alreadyCalled', {
    get() {
      return false;
    },
    set() {
      // do nothing
    }
  });
};

export const isInjectManifestConfig = (
  config: WorkboxTypes[keyof WorkboxTypes] | undefined
): config is WorkboxTypes['InjectManifest'] => {
  return typeof config !== 'undefined' && typeof config.swSrc === 'string';
};

export const isGenerateSWConfig = (
  config: WorkboxTypes[keyof WorkboxTypes] | undefined
): config is WorkboxTypes['GenerateSW'] => {
  return !isInjectManifestConfig(config);
};
