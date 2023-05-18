# next-pwa - offline fallback example

[TOC]

This example demonstrates how to use `next-pwa` to implement fallback route, image or font when fetching fails. Fetching errors usually happen when the user is **offline**. (Note: fetching is regarded as successful even when the server returns error status codes like `404, 400, 500, ...`)

Simply add a `pages/_offline.tsx` file. You are all set! No more configuration needed for this.

You can configure fallback routes for other type of resources

```js
const withPWA = require("nextjs-pwa").default({
  // ...
  fallbacks: {
    image: "/static/images/fallback.png",
    // document: '/other-offline',  // if you want to fallback to another page rather than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
  // ...
});
```

## Usage

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/DuCanhGH/next-pwa/)

```bash
cd examples/offline-fallback-v2
pnpm build
pnpm start
```

## Recommended `.gitignore`

```gitignore
**/public/workbox-*.js
**/public/sw.js
**/public/fallback-*.js
```
