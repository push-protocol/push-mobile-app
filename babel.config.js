module.exports = {
  presets: ['babel-preset-expo'],
  // presets: ['module:metro-react-native-babel-preset'],
  plugins: [['module-resolver', {alias: {'@src': './src'}}]],
};
