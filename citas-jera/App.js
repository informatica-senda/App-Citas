import React, { useEffect } from 'react';
import Appnavigation from '@navigation/AppNavigation';
import SplashScreenWrapper from './Splashscreen.js';

export default function App() {
  
  return (
    <SplashScreenWrapper>
      <Appnavigation />
    </SplashScreenWrapper>
  );
}
