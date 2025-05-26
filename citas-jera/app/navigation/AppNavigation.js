import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

// Importamos las pantallas de la aplicación desde sus respectivas rutas
// Estas pantallas serán utilizadas dentro de nuestro sistema de navegación
import LoginScreen from '@screens/login.js';
import UserDoc from '@screens/employee/UserDoc.js';
import HomeEmployee from '@screens/employee/HomeEmployee.js';
import HomeUser from '@screens/user/HomeUser.js';
import HomeManager from '@screens/manager/HomeManager.js';
import HomeTeacher from '@screens/teacher/HomeTeacher.js';
import EmployeeDetailScreen from '@screens/teacher/EmployeeDetailScreen.js';
import AppointmentCalendarScreen from '@components/AppoimentCalendarScreen.js';
import RegisterScreen from '@screens/RegisterScreen.js';

// Creamos una instancia del stack navigator, que nos permitirá manejar la navegación entre distintas pantallas
// Stack Navigator es una forma de navegación donde las pantallas se apilan unas sobre otras
const Stack = createStackNavigator();

// Componente que define la estructura de navegación de la aplicación
function AppNavigator() {
  /**
   * Estado inicial para determinar qué pantalla se mostrará primero al abrir la aplicación.
   * Se utiliza useState para manejar este estado de manera dinámica en caso de necesitar cambios futuros.
   * 'LoginScreen' es la pantalla por defecto en la que el usuario comienza la aplicación.
   */
  const [initialRoute, setInitialRoute] = useState('RegisterScreen');

  return (
    /**
     * Stack.Navigator es el componente contenedor de las pantallas dentro de la navegación tipo Stack.
     * Se usa initialRouteName para especificar cuál será la primera pantalla en mostrarse.
     */
    <Stack.Navigator initialRouteName={initialRoute}>
      {/*
        Definimos cada pantalla dentro del Stack.Navigator mediante Stack.Screen.
        Cada Stack.Screen representa una pantalla en la navegación.
        El prop "name" define el identificador de la pantalla dentro del sistema de navegación.
        El prop "component" indica cuál será el componente que se renderizará para esa pantalla.
        El prop "options" nos permite modificar configuraciones de la pantalla, en este caso ocultamos el header predeterminado.
      */}
      
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
      name="EmployeeDetailScreen"
      component={EmployeeDetailScreen}
      options={{ headerShown: false }}
    />
      <Stack.Screen
        name="HomeTeacher"
        component={HomeTeacher}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeUser"
        component={HomeUser}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeEmployee"
        component={HomeEmployee}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeManager"
        component={HomeManager}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserDoc"
        component={UserDoc}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppointmentCalendarScreen"
        component={AppointmentCalendarScreen}
        options={{ headerShown: false }}
      />
      
    </Stack.Navigator>
  );
}

// Componente principal de la aplicación
export default function App() {
  /**
   * useFonts es un hook de Expo que permite cargar fuentes personalizadas.
   * En este caso, cargamos varias variantes de la fuente "Inter".
   * - Inter_400Regular: Fuente normal.
   * - Inter_500Medium: Fuente de peso medio.
   * - Inter_600SemiBold: Fuente semi-negrita.
   * - Inter_700Bold: Fuente en negrita.
   *
   * useFonts devuelve un booleano (fontsLoaded) que indica si las fuentes se han cargado correctamente.
   */
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_500Medium,
    Inter_600SemiBold
  });

  /**
   * Si las fuentes aún no han terminado de cargarse, devolvemos "null" para evitar errores de renderizado.
   * Esto previene que la aplicación intente mostrar texto con fuentes que aún no están disponibles.
   */
  if (!fontsLoaded) {
    return null;
  }

  return (
    /**
     * NavigationContainer es el contenedor principal de la navegación en la aplicación.
     * Es necesario para que React Navigation maneje correctamente la estructura de navegación.
     * Dentro de este contenedor, se renderiza el componente AppNavigator que define el stack de navegación.
     */
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
