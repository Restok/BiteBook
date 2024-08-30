import 'ts-node/register';

export default {
  "expo": {
    "name": "LoveYumDiary",
    "slug": "LoveYumDiary",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "plugins": [
      "@react-native-google-signin/google-signin",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      "expo-router",
      "expo-image-picker"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pookie.loveyumdiary",
      "googleServicesFile": process.env.GOOGLE_SERVICES_INFOPLIST || "./GoogleService-Info.plist"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.pookie.loveyumdiary",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON || "./google-services.json"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "output": "server"
    },
    "extra": {
      "eas": {
        "projectId": "55cde07a-74ae-42ce-b71c-830ebdf5ee9e"
      }
    }
  }
}
