import React from 'react';
import { enableScreens } from 'react-native-screens'; // ✅ IMPORTA ESTO
import Appnavigation from '@navigation/AppNavigation';
import SplashScreenWrapper from './Splashscreen.js';

// ✅ LLAMA A ESTA FUNCIÓN ANTES DE RENDERIZAR CUALQUIER NAVEGACIÓN
enableScreens();

export default function App() {
  return (
    <SplashScreenWrapper>
      <Appnavigation />
    </SplashScreenWrapper>
  );
}
