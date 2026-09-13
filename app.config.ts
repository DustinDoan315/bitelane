import type { ExpoConfig } from 'expo/config';

const baseConfig = require('./app.json').expo as ExpoConfig;
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

export default function configure(): { expo: ExpoConfig } {
  const plugins = [...(baseConfig.plugins ?? [])];
  if (googleMapsApiKey) {
    plugins.push(['react-native-maps', {
      androidGoogleMapsApiKey: googleMapsApiKey,
      iosGoogleMapsApiKey: googleMapsApiKey,
    }]);
  }
  return { expo: { ...baseConfig, plugins } };
}
