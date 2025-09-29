// App.js
import React from 'react';
import { Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
if (Platform.OS !== 'web') enableScreens();

import Appnavigation from '@navigation/AppNavigation'; // o ruta relativa correcta
import SplashScreenWrapper from './Splashscreen.js';

// 💡 Evita logs confusos, si necesitas ver la key, lee desde tu objeto firebaseConfig donde la montes
// console.log("API Key:", process.env.EXPO_PUBLIC_APIKEY);

export default function App() {
  return (
    <SplashScreenWrapper>
      <Appnavigation />
    </SplashScreenWrapper>
  );
}
