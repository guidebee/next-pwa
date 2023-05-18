# next-pwa - custom worker example

[TOC]

This example demonstrates how to use `next-pwa` to turn a `Next.js`-based web app into a PWA easily. It shows how to add custom worker code to the generated service worker.

## New method

Simply create a new file called `worker/index.ts` and start adding your code. `next-pwa` will detect this file automatically, and bundle the file into `dest` as `worker-*.js` using `webpack`. It's also automatically injected into the generated `sw.js`.

In this way, you get the benefit of code splitting and size minimization automatically. Yes, `require` modules works! Yes, you can share code between your web app and the service worker!

> - In dev mode, `worker/index.ts` is not watched, so it will not hot reload.

### Custom worker directory

You can customize the directory of your custom worker file by adding `customWorkerDir` (relative to `basedir`) to your `withPWAInit` config in `next.config.js`:

```javascript
const withPWA = require("@guidebee/next-pwa").default({
  customWorkerDir: "serviceworker",
  // ...
});

module.exports = withPWA({
  // Next.js config
});
```

In this example, `next-pwa` will look for `serviceworker/index.ts`.

## Old method (still works)

Basically you need to create a file (for example, `worker.js`) in your `public` directory, then add `importScripts` to your `withPWAInit` config in `next.config.js`:

```javascript
const withPWA = require("@guidebee/next-pwa").default({
  dest: "public",
  importScripts: ["/worker.js"],
});

module.exports = withPWA({
  // Next.js config
});
```

Then the generated service worker will automatically import your code and run it before other workbox code.

## Usage

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/DuCanhGH/next-pwa/)

```bash
cd examples/custom-ts-server
pnpm build
pnpm start
```

## Recommended `.gitignore`

```gitignore
**/public/workbox-*.js
**/public/sw.js
**/public/worker-*.js
```
