const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const sharedPkgRoot = path.resolve(monorepoRoot, 'packages/shared');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration for Monorepo
 * Ensures packages/shared and root node_modules resolve cleanly.
 */
const config = {
  watchFolders: [monorepoRoot, sharedPkgRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    extraNodeModules: {
      '@reportsaathi/shared': path.resolve(sharedPkgRoot, 'dist'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
