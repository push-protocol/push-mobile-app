module.exports = {
  presets: ['babel-preset-expo', 'module:metro-react-native-babel-preset'],
  plugins: [
    ['module-resolver', {alias: {'@src': './src'}}],
    'react-native-reanimated/plugin',
    ['@babel/plugin-transform-flow-strip-types', {loose: true}],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    ['@babel/plugin-proposal-private-methods', {loose: true}],
  ],
};
