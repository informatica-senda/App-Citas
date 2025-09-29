import React from 'react';
import { enableScreens } from 'react-native-screens'; // ✅ IMPORTA ESTO
import Appnavigation from '@navigation/AppNavigation';
import SplashScreenWrapper from './Splashscreen.js';

console.log("API Key:", process.env.EXPO_PUBLIC_APIKEY);

// ✅ LLAMA A ESTA FUNCIÓN ANTES DE RENDERIZAR CUALQUIER NAVEGACIÓN
enableScreens();

export default function App() {
  return (
    <SplashScreenWrapper>
      <Appnavigation />
    </SplashScreenWrapper>
  );
}
