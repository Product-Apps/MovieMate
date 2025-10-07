// metro.config.js (Create this file if it doesn't exist)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Clear resolver cache
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
