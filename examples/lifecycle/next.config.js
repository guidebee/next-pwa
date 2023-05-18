const withPWA = require("@guidebee/next-pwa").default({
  dest: "public",
  register: false,
  workboxOptions: {
    skipWaiting: false,
  },
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
