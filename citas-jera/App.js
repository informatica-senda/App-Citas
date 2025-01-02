import React, { useEffect } from 'react';
import Appnavigation from '@navigation/AppNavigation';
import SplashScreenWrapper from './Splashscreen.js';
import { setLocale } from '@components/LocaleConfig/index.js';

export default function App() {
  useEffect(() => {
    setLocale('es');
  }, []);
  return (
    <SplashScreenWrapper>
      <Appnavigation />
    </SplashScreenWrapper>
  );
}
