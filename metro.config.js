const extraNodeModules = require('node-libs-browser');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules,
    sourceExts: ['jsx','js', 'json', 'ts', 'tsx']
  }
};
