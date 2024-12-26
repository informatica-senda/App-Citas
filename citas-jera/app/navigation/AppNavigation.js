import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

import LoginScreen from '@screens/login.js';
import HomeUser from '@screens/users/HomeUser.js';

const Stack = createStackNavigator();

function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState('LoginScreen');
  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeUser"
        component={HomeUser}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_500Medium,
    Inter_600SemiBold
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}