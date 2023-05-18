const withPWA = require("@guidebee/next-pwa").default({
  dest: "public",
  dynamicStartUrl: true, // this is the same as the default value
  dynamicStartUrlRedirect: "/login", // recommended for the best user experience if your start URL redirects on first load
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
