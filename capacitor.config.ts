import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcadecabinet.cosmicgardener",
  appName: "Cosmic Gardener",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#08021a",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#08021a",
      overlaysWebView: true,
    },
  },
};

export default config;
