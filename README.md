# Zero-config [PWA](https://web.dev/learn/pwa/) plugin for [Next.js](https://nextjs.org/)

This plugin is powered by [Workbox](https://developer.chrome.com/docs/workbox/) and other good stuff.

[![Build Size](https://img.shields.io/bundlephobia/minzip/@guidebee/next-pwa?label=Bundle%20size&style=flat&color=success)](https://bundlephobia.com/result?p=@guidebee/next-pwa)
[![Version](https://img.shields.io/npm/v/@guidebee/next-pwa?style=flat&color=success)](https://www.npmjs.com/package/@guidebee/next-pwa)

👋 Share your awesome PWA project 👉 [here](https://github.com/shadowwalker/next-pwa/discussions/206)

**Features**

- 0️⃣ Zero-config for registering and generating service worker out of the box
- ✨ Optimized precaching and runtime caching
- 💯 Maximal Lighthouse score
- 🎈 Easy-to-understand examples
- 📴 Offline support with fallbacks ([example](/examples/offline-fallback-v2))
- 📦 Uses [Workbox](https://developer.chrome.com/docs/workbox/) and [workbox-window](https://developer.chrome.com/docs/workbox/modules/workbox-window) v6
- 🍪 Works with cookies out of the box
- 🔉 Default range requests for audios and videos
- ☕ No custom server needed for Next.js 9+ ([example](/examples/basic))
- 🔧 Handle PWA lifecycle events (opt-in - [example](/examples/lifecycle))
- 📐 Custom worker to run extra code with code splitting and **Typescript** support ([example](/examples/custom-worker))
- 📜 [Public environment variables](https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser) are available in custom workers
- 🐞 Debug service worker in development mode without caching
- 🌏 Internationalization support (a.k.a i18n) with `next-i18next` ([example](/examples/next-i18next))
- 🛠 Configurable by [Workbox's options](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin) for [GenerateSW](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/#generatesw-plugin) and [InjectManifest](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/#injectmanifest-plugin)
- ⚡ Supports [blitz.js](https://blitzjs.com/) (simply add `blitz.config.js`)
- 🚀 Spin up a [GitPod](https://gitpod.io/#https://github.com/DuCanhGH/next-pwa/) and try out examples in rocket speed (or use `create-next-app` to create a brand new Next.js app with them (for example, run `pnpm create next-app --example https://github.com/DuCanhGH/next-pwa/tree/master/examples/basic` to create a new Next.js app using the `basic` example))

> **NOTE 1** - `next-pwa` version 2.0.0+ should only work with `Next.js` 9.1+, and static files should only be served through the `public` directory.
>
> **NOTE 2** - If you encounter the error `TypeError: Cannot read property **'javascript' of undefined**` during build, [please consider upgrading to Webpack 5 in `next.config.js`](https://github.com/shadowwalker/next-pwa/issues/198#issuecomment-817205700).
>
> **NOTE 3** - `@guidebee/next-pwa` currently doesn't support Turbopack, but I will start working on it as soon as we get our hands on Turbopack. It may not use Workbox anymore depending on [Workbox's maintain status](https://github.com/GoogleChrome/workbox/issues/3149), however.

---

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/DuCanhGH/next-pwa/)

## Setup

See [how to setup `next-pwa`](/packages/next-pwa/SETUP.md)

## Tips

See [our tips on using `next-pwa`](/packages/next-pwa/TIPS.md)

## Reference

1. [Google Workbox](https://developer.chrome.com/docs/workbox/what-is-workbox/)
2. [ServiceWorker, MessageChannel, & postMessage](https://ponyfoo.com/articles/serviceworker-messagechannel-postmessage) by [Nicolás Bevacqua](https://ponyfoo.com/contributors/ponyfoo)
3. [The service worker lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
4. [6 Tips to make your iOS PWA feel like a native app](https://www.netguru.com/codestories/pwa-ios)
5. [Make your PWA available on Google Play Store](https://www.netguru.com/codestories/make-your-pwa-available-on-google-play-store)
