import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inspiredfounders.club',
  appName: 'Inspired Club',
  webDir: 'dist',
  server: {
    // During local development against a live-reload dev server, uncomment
    // and point this at your machine's LAN IP (needed for a physical device
    // to reach the Vite dev server):
    // url: 'http://192.168.1.100:5173',
    // cleartext: true,
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#09090b',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
