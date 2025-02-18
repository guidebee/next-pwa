import type { WebpackInjectManifestOptions } from 'workbox-build';
import type { GenerateSWConfig } from 'workbox-webpack-plugin';

type Impossible<K extends keyof any> = { [P in K]?: never };

type GenerateSWOverrideJSDoc = {
  /**
   * Note: This plugin changes the default to `true`.
   * @default true ("next-pwa")
   */
  skipWaiting?: GenerateSWConfig['skipWaiting'];
  /**
   * Note: This plugin changes the default to `true`.
   * @default true ("next-pwa")
   */
  clientsClaim?: GenerateSWConfig['clientsClaim'];
  /**
   * Note: This plugin changes the default to `true`.
   * @default true ("next-pwa")
   */
  cleanUpOutdatedCaches?: GenerateSWConfig['cleanupOutdatedCaches'];
  /** Note: This plugin changes the default to `[]`. */
  ignoreURLParametersMatching?: GenerateSWConfig['ignoreURLParametersMatching'];
};

export type SharedWorkboxOptionsKeys = keyof GenerateSWConfig &
  keyof WebpackInjectManifestOptions;

export type BlockedSharedWorkboxOptionsKeys = Extract<
  SharedWorkboxOptionsKeys,
  'exclude'
>;

export type WorkboxTypes = {
  GenerateSW: Omit<
    Impossible<
      Exclude<keyof WebpackInjectManifestOptions, SharedWorkboxOptionsKeys>
    > &
    GenerateSWConfig &
    GenerateSWOverrideJSDoc,
    BlockedSharedWorkboxOptionsKeys
  >;
  InjectManifest: Omit<
    Impossible<Exclude<keyof GenerateSWConfig, SharedWorkboxOptionsKeys>> &
    WebpackInjectManifestOptions,
    BlockedSharedWorkboxOptionsKeys
  >;
};

export type StringKeyOf<BaseType> = `${Extract<
  keyof BaseType,
  string | number
>}`;
