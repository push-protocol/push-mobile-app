const extraNodeModules = require('node-libs-browser');

module.exports = {
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules,
    sourceExts: ['jsx', 'js', 'json', 'ts', 'tsx'],
  },
};
