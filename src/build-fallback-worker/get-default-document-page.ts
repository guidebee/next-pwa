import fs from 'node:fs';
import path from 'node:path';

import { findFirstTruthy, logger } from '../utils/index.js';


export const getDefaultDocumentPage = (
  baseDir: string,
  pageExtensions: string[],
  isAppDirEnabled: boolean
) => {
  const pagesDir = findFirstTruthy(['pages', 'src/pages'], (dir) => {
    dir = path.join(baseDir, dir);
    return fs.existsSync(dir) ? dir : undefined;
  });
  const appDir = isAppDirEnabled
    ? findFirstTruthy(['app', 'src/app'], (dir) => {
      dir = path.join(baseDir, dir);
      return fs.existsSync(dir) ? dir : undefined;
    })
    : undefined;

  if (!pagesDir && !appDir) {
    return undefined;
  }

  for (const ext of pageExtensions) {
    if (appDir) {
      const appDirOffline = path.join(appDir, `~offline/page.${ext}`);
      if (fs.existsSync(appDirOffline)) {
        return '/~offline';
      }
      const appDirLegacyOffline = path.join(appDir, `_offline/page.${ext}`);
      if (fs.existsSync(appDirLegacyOffline)) {
        logger.warn(
          'Next.js App Router now ignores folders prefixed by underscore (_). ' +
          'Please replace "/_offline" with "/~offline". "/_offline" in "app/" will no longer automatically ' +
          'enable the fallback worker in the next major version.'
        );
        return '/_offline';
      }
    }
    if (pagesDir) {
      const pagesDirOffline = path.join(pagesDir, `_offline.${ext}`);
      if (pagesDirOffline && fs.existsSync(pagesDirOffline)) {
        return '/_offline';
      }
    }
  }

  return undefined;
};
