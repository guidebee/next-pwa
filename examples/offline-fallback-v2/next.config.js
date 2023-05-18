const withPWA = require("@guidebee/next-pwa").default({
  dest: "public",
  fallbacks: {
    image: "/static/images/fallback.png",
    // document: '/other-offline',  // if you want to fallback to a custom page rather than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
});

module.exports = withPWA({
  images: {
    domains: ["source.unsplash.com"],
  },
});
