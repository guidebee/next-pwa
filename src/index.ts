import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import fg from 'fast-glob';
import type { NextConfig } from 'next';
import type { Configuration, default as webpackType } from 'webpack';
import type { RuntimeCaching } from 'workbox-build';
import type { GenerateSWConfig } from 'workbox-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';

import { buildCustomWorker } from './build-custom-worker.js';
import { getDefaultDocumentPage } from './build-fallback-worker/get-default-document-page.js';
import { buildFallbackWorker } from './build-fallback-worker/index.js';
import defaultCache from './cache.js';
import type { SharedWorkboxOptionsKeys } from './private-types.js';
import type { PluginOptions } from './types.js';
import { isGenerateSWConfig, isInjectManifestConfig, overrideAfterCalledMethod } from './utils.js';
import { loadTSConfig, logger } from './utils/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const getRevision = (file: fs.PathOrFileDescriptor) =>
  crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');

const withPWAInit = (
  pluginOptions: PluginOptions = {}
): ((_?: NextConfig) => NextConfig) => {
  return (nextConfig = {}) => ({
    ...nextConfig,
    ...({
      webpack(config: Configuration, options) {
        const isAppDirEnabled = !!nextConfig.experimental?.appDir;

        const webpack: typeof webpackType = options.webpack;
        const {
          buildId,
          dev,
          config: {
            distDir = '.next',
            pageExtensions = ['tsx', 'ts', 'jsx', 'js', 'mdx']
          }
        } = options;

        let basePath = options.config.basePath;

        // basePath can be an empty string.
        if (!basePath) {
          basePath = '/';
        }

        const tsConfigJSON = loadTSConfig(
          options.dir,
          nextConfig?.typescript?.tsconfigPath
        );

        // For workbox configurations:
        // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW
        const {
          disable = false,
          register = true,
          dest = distDir,
          sw = 'sw.js',
          cacheStartUrl = true,
          dynamicStartUrl = true,
          dynamicStartUrlRedirect,
          publicExcludes = ['!noprecache/**/*'],
          buildExcludes = [],
          fallbacks = {},
          cacheOnFrontEndNav = false,
          reloadOnOnline = true,
          scope = basePath,
          customWorkerDir = 'worker',
          workboxOptions = {}
        } = pluginOptions;

        const {
          swSrc,
          additionalManifestEntries,
          modifyURLPrefix = {},
          manifestTransforms = [],
          // @ts-expect-error removed from types
          exclude,
          ...workbox
        } = workboxOptions;

        if (typeof nextConfig.webpack === 'function') {
          config = nextConfig.webpack(config, options);
        }

        Object.keys(workbox).forEach(
          (key) => workbox[key] === undefined && delete workbox[key]
        );

        let importScripts: string[] = [];
        let runtimeCaching: RuntimeCaching[] = defaultCache;

        if (!config.plugins) {
          config.plugins = [];
        }

        if (disable) {
          options.isServer && logger.info('PWA support is disabled.');
          return config;
        }

        logger.info(
          `Compiling for ${options.isServer ? 'server' : 'client (static)'}...`
        );

        if (isGenerateSWConfig(workboxOptions)) {
          if (workboxOptions.runtimeCaching) {
            logger.info(
              'Custom runtimeCaching array found, using it instead of the default one.'
            );
            runtimeCaching = workboxOptions.runtimeCaching;
          }
          if (workboxOptions.importScripts) {
            importScripts = workboxOptions.importScripts;
          }
        }

        const _scope = path.posix.join(scope, '/');

        // inject register script to main.js
        const _sw = path.posix.join(
          basePath,
          sw.startsWith('/') ? sw : `/${sw}`
        );
        config.plugins.push(
          new webpack.DefinePlugin({
            __PWA_SW__: `'${_sw}'`,
            __PWA_SCOPE__: `'${_scope}'`,
            __PWA_ENABLE_REGISTER__: `${Boolean(register)}`,
            __PWA_START_URL__: dynamicStartUrl ? `'${basePath}'` : undefined,
            __PWA_CACHE_ON_FRONT_END_NAV__: `${Boolean(cacheOnFrontEndNav)}`,
            __PWA_RELOAD_ON_ONLINE__: `${Boolean(reloadOnOnline)}`
          })
        );

        const swEntryJs = path.join(__dirname, 'sw-entry.js');
        const entry = config.entry as () => Promise<
          Record<string, string[] | string>
        >;
        config.entry = () =>
          entry().then((entries) => {
            if (entries['main.js'] && !entries['main.js'].includes(swEntryJs)) {
              if (Array.isArray(entries['main.js'])) {
                entries['main.js'].unshift(swEntryJs);
              } else if (typeof entries['main.js'] === 'string') {
                entries['main.js'] = [swEntryJs, entries['main.js']];
              }
            }
            if (
              entries['main-app'] &&
              !entries['main-app'].includes(swEntryJs)
            ) {
              if (Array.isArray(entries['main-app'])) {
                entries['main-app'].unshift(swEntryJs);
              } else if (typeof entries['main-app'] === 'string') {
                entries['main-app'] = [swEntryJs, entries['main-app']];
              }
            }
            return entries;
          });

        if (!options.isServer) {
          const _dest = path.join(options.dir, dest);
          const customWorkerScriptName = buildCustomWorker({
            id: buildId,
            baseDir: options.dir,
            customWorkerDir,
            destDir: _dest,
            plugins: config.plugins.filter(
              (plugin) => plugin instanceof webpack.DefinePlugin
            ),
            tsconfig: tsConfigJSON,
            minify: !dev
          });

          if (!!customWorkerScriptName) {
            importScripts.unshift(customWorkerScriptName);
          }

          if (!register) {
            logger.info(
              `Service worker won't be automatically registered as per the config, please call the following code in a componentDidMount callback or useEffect hook:`
            );
            logger.info(`  window.workbox.register()`);
            if (
              !tsConfigJSON?.compilerOptions?.types?.includes(
                '@guidebee/next-pwa/workbox'
              )
            ) {
              logger.info(
                'You may also want to add @guidebee/next-pwa/workbox to compilerOptions.types in your tsconfig.json/jsconfig.json.'
              );
            }
          }

          logger.info(`Service worker: ${path.join(dest, sw)}`);
          logger.info(`  URL: ${_sw}`);
          logger.info(`  Scope: ${_scope}`);

          config.plugins.push(
            new CleanWebpackPlugin({
              cleanOnceBeforeBuildPatterns: [
                path.join(_dest, 'workbox-*.js'),
                path.join(_dest, 'workbox-*.js.map'),
                path.join(_dest, sw),
                path.join(_dest, `${sw}.map`)
              ]
            })
          );

          // precache files in public folder
          let manifestEntries = additionalManifestEntries ?? [];
          if (!manifestEntries) {
            manifestEntries = fg
              .sync(
                [
                  '**/*',
                  '!workbox-*.js',
                  '!workbox-*.js.map',
                  '!worker-*.js',
                  '!worker-*.js.map',
                  '!fallback-*.js',
                  '!fallback-*.js.map',
                  `!${sw.replace(/^\/+/, '')}`,
                  `!${sw.replace(/^\/+/, '')}.map`,
                  ...publicExcludes
                ],
                {
                  cwd: 'public'
                }
              )
              .map((f) => ({
                url: path.posix.join(basePath, `/${f}`),
                revision: getRevision(`public/${f}`)
              }));
          }

          if (cacheStartUrl) {
            if (!dynamicStartUrl) {
              manifestEntries.push({
                url: basePath,
                revision: buildId
              });
            } else if (
              typeof dynamicStartUrlRedirect === 'string' &&
              dynamicStartUrlRedirect.length > 0
            ) {
              manifestEntries.push({
                url: dynamicStartUrlRedirect,
                revision: buildId
              });
            }
          }

          let hasFallbacks = false;

          if (fallbacks) {
            if (!fallbacks.document) {
              fallbacks.document = getDefaultDocumentPage(
                options.dir,
                pageExtensions,
                isAppDirEnabled
              );
            }
            const res = buildFallbackWorker({
              id: buildId,
              fallbacks,
              baseDir: options.dir,
              destDir: _dest,
              minify: !dev,
              pageExtensions,
              isAppDirEnabled
            });

            if (res) {
              hasFallbacks = true;
              importScripts.unshift(res.name);
              res.precaches.forEach((route) => {
                if (
                  route &&
                  typeof route !== 'boolean' &&
                  !manifestEntries.find(
                    (entry) =>
                      typeof entry !== 'string' && entry.url.startsWith(route)
                  )
                ) {
                  manifestEntries.push({
                    url: route,
                    revision: buildId
                  });
                }
              });
            }
          }

          const workboxCommon: Pick<
            GenerateSWConfig,
            SharedWorkboxOptionsKeys
          > = {
            swDest: path.join(_dest, sw),
            additionalManifestEntries: dev ? [] : manifestEntries,
            exclude: [
              ...buildExcludes,
              ({
                 asset
               }: {
                asset: {
                  name: string;
                };
              }) => {
                if (
                  asset.name.startsWith('server/') ||
                  asset.name.match(
                    /^((app-|^)build-manifest\.json|react-loadable-manifest\.json)$/
                  )
                ) {
                  return true;
                }
                if (dev && !asset.name.startsWith('static/runtime/')) {
                  return true;
                }
                return false;
              }
            ],
            modifyURLPrefix: {
              ...modifyURLPrefix,
              '/_next/../public/': '/'
            },
            manifestTransforms: [
              ...manifestTransforms,
              async (manifestEntries, compilation) => {
                const manifest = manifestEntries.map((m) => {
                  m.url = m.url.replace(
                    '/_next//static/image',
                    '/_next/static/image'
                  );
                  m.url = m.url.replace(
                    '/_next//static/media',
                    '/_next/static/media'
                  );
                  if (m.revision === null) {
                    let key = m.url;
                    if (
                      config.output &&
                      config.output.publicPath &&
                      typeof config.output.publicPath === 'string' &&
                      key.startsWith(config.output.publicPath)
                    ) {
                      key = m.url.substring(config.output.publicPath.length);
                    }
                    const asset = (compilation as any).assetsInfo.get(key);
                    m.revision = asset ? asset.contenthash || buildId : buildId;
                  }
                  m.url = m.url.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
                  return m;
                });
                return { manifest, warnings: [] };
              }
            ]
          };

          if (isInjectManifestConfig(workboxOptions)) {
            const swSrc = path.join(options.dir, workboxOptions.swSrc);
            logger.info(`Using InjectManifest with ${swSrc}`);
            const workboxPlugin = new WorkboxPlugin.InjectManifest({
              ...workboxCommon,
              ...workbox,
              swSrc
            });
            if (dev) {
              overrideAfterCalledMethod(workboxPlugin);
            }
            config.plugins.push(workboxPlugin);
          } else {
            const {
              skipWaiting = true,
              clientsClaim = true,
              cleanupOutdatedCaches = true,
              ignoreURLParametersMatching = []
            } = workboxOptions;
            let shutWorkboxAfterCalledMessageUp = false;

            if (dev) {
              logger.info(
                'Building in development mode, caching and precaching are disabled for the most part. This means that offline support is disabled, but you can continue developing other functions in service worker.'
              );
              ignoreURLParametersMatching.push(/ts/);
              runtimeCaching = [
                {
                  urlPattern: /.*/i,
                  handler: 'NetworkOnly',
                  options: {
                    cacheName: 'dev'
                  }
                }
              ];
              shutWorkboxAfterCalledMessageUp = true;
            }

            if (dynamicStartUrl) {
              runtimeCaching.unshift({
                urlPattern: basePath,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'start-url',
                  plugins: [
                    {
                      cacheWillUpdate: async ({ response }) => {
                        if (response && response.type === 'opaqueredirect') {
                          return new Response(response.body, {
                            status: 200,
                            statusText: 'OK',
                            headers: response.headers
                          });
                        }
                        return response;
                      }
                    }
                  ]
                }
              });
            }

            if (hasFallbacks) {
              runtimeCaching.forEach((cacheEntry) => {
                if (!cacheEntry.options) return;
                if (cacheEntry.options.precacheFallback) return;
                if (
                  Array.isArray(cacheEntry.options.plugins) &&
                  cacheEntry.options.plugins.find(
                    (plugin) => 'handlerDidError' in plugin
                  )
                )
                  return;
                if (!cacheEntry.options.plugins) {
                  cacheEntry.options.plugins = [];
                }
                cacheEntry.options.plugins.push({
                  handlerDidError: async ({ request }) => {
                    if (typeof self !== 'undefined') {
                      return self.fallback(request);
                    }
                    return Response.error();
                  }
                });
              });
            }

            const workboxPlugin = new WorkboxPlugin.GenerateSW({
              ...workboxCommon,
              skipWaiting,
              clientsClaim,
              cleanupOutdatedCaches,
              ignoreURLParametersMatching,
              importScripts,
              ...workbox,
              runtimeCaching
            });

            if (shutWorkboxAfterCalledMessageUp) {
              overrideAfterCalledMethod(workboxPlugin);
            }

            config.plugins.push(workboxPlugin);
          }
        }
        return config;
      }
    } as NextConfig)
  });
};

export default withPWAInit;
export { defaultCache as runtimeCaching };
export * from './types.js';
