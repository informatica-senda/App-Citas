import React from 'react';
import { NavigationIndependentTree } from '@react-navigation/native';
import App from '../App'; // reutiliza tu App.js tal cual

export default function Index() {
  return (
    <NavigationIndependentTree>
      <App />
    </NavigationIndependentTree>
  );
}
