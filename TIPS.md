## Some tips when using `next-pwa`!

- [You may want to ask user to reload when a new service worker is installed](/examples/lifecycle/pages/index.tsx#L20-L41)

- When you are debugging the service worker, remember to constantly clean the application cache to reduce some flaky errors.

- If you are redirecting the user to another route, please note that [Workbox by default only caches responses with 200 HTTP status](https://developer.chrome.com/docs/workbox/modules/workbox-cacheable-response#what_are_the_defaults), if you really want to cache redirected page for the route, you can specify it in `runtimeCaching` by setting `options.cacheableResponse.statuses` to `[200, 302]`.

- When debugging issues, sometimes you may want to format your generated `sw.js` file to figure out what's really going on. In development mode it is not minified though, so it is kinda readable.

- You can force `next-pwa` to generate the SW in production mode by setting `workboxOptions.mode` in your `withPWAInit` config to "production" in `next.config.js`. By default, `next-pwa` generates the SW in development mode during development (`next dev`) and in production mode during production (`next build` and `next start`), but you may still want to force it to build in production mode even during development because of one of these reasons:

  - Reduced logging noise as the production build doesn't include logging.
  - Improved performance as the production build is better optimized.

  However, if you just want to disable worker box's logging while still using the development build during development, [simply put `self.__WB_DISABLE_DEV_LOGS = true` in your `worker/index.ts` (create one if you don't have it)](/examples/custom-worker/worker/index.ts#L7-L10).

- Sometimes you have to use the `userAgent` string to determine your user's platform, and [ua-parser-js](https://www.npmjs.com/package/ua-parser-js) is a good library for that.
