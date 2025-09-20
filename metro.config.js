const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname, { isCSSEnabled: true });
  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  config.resolver = {
    ...resolver,
    assetExts: [
      ...resolver.assetExts.filter((ext) => ext !== 'svg'),
      'html',
      'png','jpg','jpeg','gif','webp',
    ],
    sourceExts: [
      ...resolver.sourceExts,
      'svg',
    ],
  };

  return config;
})();
