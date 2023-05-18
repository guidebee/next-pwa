import chalk from 'chalk';
import { gte as semverGte } from 'semver';

import { getPackageVersion } from './get-package-version.js';

const nextPackageJson = getPackageVersion('next');

const isNextNewerThan13_4_1 =
  !!nextPackageJson && semverGte(nextPackageJson, '13.4.1');

/**
 * Get logging prefix
 * @param color
 * @param oldStyleSpace
 * @returns
 */
const getPrefix = (color: string, oldStyleSpace = 0) => {
  return isNextNewerThan13_4_1
    ? `- ${color} (pwa)`
    : `${color}${' '.repeat(oldStyleSpace)}- (PWA)`;
};

export const prefixes = {
  wait: getPrefix(chalk.cyan('wait'), 2),
  error: getPrefix(chalk.red('error'), 1),
  warn: getPrefix(chalk.yellow('warn'), 2),
  info: getPrefix(chalk.cyan('info'), 2)
} as const;

export const wait = (...message: any[]) => {
  console.log(prefixes.wait, ...message);
};

export const error = (...message: any[]) => {
  console.error(prefixes.error, ...message);
};

export const warn = (...message: any[]) => {
  console.warn(prefixes.warn, ...message);
};

export const info = (...message: any[]) => {
  console.log(prefixes.info, ...message);
};
