// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure resolver cache is cleared
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Reset cache on restart
config.resetCache = true;

module.exports = config;
