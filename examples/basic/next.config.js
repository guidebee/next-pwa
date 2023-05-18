const withPWA = require("@guidebee/next-pwa").default({
  dest: "public",
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
};

module.exports = withPWA(nextConfig);
