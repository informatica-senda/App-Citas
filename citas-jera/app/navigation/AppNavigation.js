import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

// Pantallas
import LoginScreen from '@screens/login.js';
import UserDoc from '@screens/shared/UserDoc.js';
import HomeEmployee from '@screens/employee/HomeEmployee.js';
import HomeUser from '@screens/user/HomeUser.js';
import HomeManager from '@screens/manager/HomeManager.js';
import HomeTeacher from '@screens/teacher/HomeTeacher.js';
import EmployeeDetailScreen from '@screens/teacher/EmployeeDetailScreen.js';
import AppointmentCalendarScreen from '@components/AppoimentCalendarScreen.js';
import RegisterScreen from '@screens/RegisterScreen.js';
import ScannerScreen from '@screens/ScannerScreen.js';

const Stack = createStackNavigator();

function AppNavigator() {
  const [initialRoute] = useState('LoginScreen');

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScannerScreen" component={ScannerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EmployeeDetailScreen" component={EmployeeDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HomeTeacher" component={HomeTeacher} options={{ headerShown: false }} />
      <Stack.Screen name="HomeUser" component={HomeUser} options={{ headerShown: false }} />
      <Stack.Screen name="HomeEmployee" component={HomeEmployee} options={{ headerShown: false }} />
      <Stack.Screen name="HomeManager" component={HomeManager} options={{ headerShown: false }} />
      <Stack.Screen name="UserDoc" component={UserDoc} options={{ headerShown: false }} />
      <Stack.Screen name="AppointmentCalendarScreen" component={AppointmentCalendarScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  // Carga de fuentes (mismo comportamiento)
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Persistencia de navegación (solo web)
  const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';
  const isWeb = Platform.OS === 'web';
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    if (!isWeb) {
      setIsReady(true);
      return;
    }

    const restoreState = async () => {
      try {
        let savedStateString = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          savedStateString = window.localStorage.getItem(PERSISTENCE_KEY);
        }
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;
        if (state) setInitialState(state);
      } catch (e) {
        // Ignorar errores de lectura
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) restoreState();
  }, [isReady, isWeb]);

  // No renderizar hasta tener fuentes y estado listo
  if (!fontsLoaded || !isReady) {
    return null;
  }

  return (
    <NavigationContainer
      initialState={isWeb ? initialState : undefined}
      onStateChange={
        isWeb
          ? async (state) => {
              try {
                const stateString = JSON.stringify(state);
                if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem(PERSISTENCE_KEY, stateString);
                }
              } catch (e) {
                // Ignorar errores de escritura
              }
            }
          : undefined
      }
    >
      <AppNavigator />
    </NavigationContainer>
  );
}

