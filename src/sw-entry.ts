import { Workbox } from 'workbox-window';

declare const __PWA_START_URL__: URL | RequestInfo;
declare const __PWA_SW__: string;
declare const __PWA_ENABLE_REGISTER__: boolean;
declare const __PWA_CACHE_ON_FRONT_END_NAV__: boolean;
declare const __PWA_RELOAD_ON_ONLINE__: boolean;
declare const __PWA_SCOPE__: string;
declare global {
  interface Window {
    workbox: Workbox;
  }
}

if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  typeof caches !== 'undefined'
) {
  if (__PWA_START_URL__) {
    caches.has('start-url').then((has) => {
      if (!has) {
        caches
          .open('start-url')
          .then((c) =>
            c.put(__PWA_START_URL__, new Response('', { status: 200 }))
          );
      }
    });
  }

  window.workbox = new Workbox(window.location.origin + __PWA_SW__, {
    scope: __PWA_SCOPE__
  });

  if (__PWA_START_URL__) {
    window.workbox.addEventListener('installed', async ({ isUpdate }) => {
      if (!isUpdate) {
        const cache = await caches.open('start-url');
        const response = await fetch(__PWA_START_URL__);
        let _response = response;
        if (response.redirected) {
          _response = new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: response.headers
          });
        }
        await cache.put(__PWA_START_URL__, _response);
      }
    });
  }

  window.workbox.addEventListener('installed', async () => {
    const nextDataCache = await caches.open('next-data');
    window.performance.getEntriesByType('resource').forEach((entry) => {
      const entryName = entry.name;
      if (
        entryName.startsWith(`${window.location.origin}/_next/data/`) &&
        entryName.endsWith('.json')
      ) {
        nextDataCache.add(entryName);
      }
    });
  });

  if (__PWA_ENABLE_REGISTER__) {
    window.workbox.register();
  }

  if (__PWA_CACHE_ON_FRONT_END_NAV__ || __PWA_START_URL__) {
    const cacheOnFrontEndNav = (url?: string | URL | null | undefined) => {
      if (!window.navigator.onLine || !url) {
        return;
      }
      if (__PWA_CACHE_ON_FRONT_END_NAV__ && url !== __PWA_START_URL__) {
        return caches.open('pages').then((cache) =>
          cache.match(url, { ignoreSearch: true }).then((res) => {
            if (!res) {
              return cache.add(url);
            }
            return Promise.resolve();
          })
        );
      } else if (__PWA_START_URL__ && url === __PWA_START_URL__) {
        return fetch(__PWA_START_URL__).then(async (response) => {
          if (!response.redirected) {
            return caches
              .open('start-url')
              .then((cache) => cache.put(__PWA_START_URL__, response));
          }
          return Promise.resolve();
        });
      }
      return;
    };

    const pushState = history.pushState;
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      pushState.apply(history, args);
      cacheOnFrontEndNav(args[2]);
    };

    const replaceState = history.replaceState;
    history.replaceState = (...args: Parameters<typeof history.pushState>) => {
      replaceState.apply(history, args);
      cacheOnFrontEndNav(args[2]);
    };

    window.addEventListener('online', () => {
      cacheOnFrontEndNav(window.location.pathname);
    });
  }

  if (__PWA_RELOAD_ON_ONLINE__) {
    window.addEventListener('online', () => {
      location.reload();
    });
  }
}
