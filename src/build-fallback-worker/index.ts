import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { createRequire } from 'module';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

import swcRc from '../.swcrc.json';
import type { FallbackRoutes } from '../types.js';
import { logger } from '../utils/index.js';
import { getFallbackEnvs } from './get-fallback-envs.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);

export const buildFallbackWorker = ({
                                      id,
                                      fallbacks,
                                      destDir,
                                      minify
                                    }: {
  id: string;
  fallbacks: FallbackRoutes;
  baseDir: string;
  destDir: string;
  minify: boolean;
  pageExtensions: string[];
  isAppDirEnabled: boolean;
}) => {
  const envs = getFallbackEnvs({
    fallbacks,
    id
  });
  if (!envs) return;

  const name = `fallback-${id}.js`;
  const fallbackJs = path.join(__dirname, `fallback.js`);

  webpack({
    mode: minify ? 'production' : 'development',
    target: 'webworker',
    entry: {
      main: fallbackJs
    },
    resolve: {
      extensions: ['.js'],
      fallback: {
        module: false,
        dgram: false,
        dns: false,
        path: false,
        fs: false,
        os: false,
        crypto: false,
        stream: false,
        http2: false,
        net: false,
        tls: false,
        zlib: false,
        child_process: false
      }
    },
    resolveLoader: {
      alias: {
        'swc-loader': require.resolve('swc-loader')
      }
    },
    module: {
      rules: [
        {
          test: /\.(t|j)s$/i,
          use: [
            {
              loader: 'swc-loader',
              options: swcRc
            }
          ]
        }
      ]
    },
    output: {
      path: destDir,
      filename: name
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(destDir, 'fallback-*.js'),
          path.join(destDir, 'fallback-*.js.map')
        ]
      }),
      new webpack.EnvironmentPlugin(envs)
    ],
    optimization: minify
      ? {
        minimize: true,
        minimizer: [new TerserPlugin()]
      }
      : undefined
  }).run((error, status) => {
    if (error || status?.hasErrors()) {
      logger.error('Failed to build fallback worker.');
      logger.error(status?.toString({ colors: true }));
      process.exit(-1);
    }
  });

  return { name, precaches: Object.values(envs).filter((v) => !!v) };
};
