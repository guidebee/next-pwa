const withPWA = require("nextjs-pwa").default({
  dest: "public",
});

const { i18n } = require("./next-i18next.config");

module.exports = withPWA({
  i18n,
});
