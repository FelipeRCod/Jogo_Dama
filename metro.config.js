const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

['ogg', 'wav'].forEach((ext) => {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
});

module.exports = config;
