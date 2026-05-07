import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.faisal.slapdroid',
  appName: 'SlapDroid',
  webDir: 'out',
  plugins: {
    SlapService: {
      // Plugin configuration
    },
  },
};

export default config;