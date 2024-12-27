import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AppointmentsScreen from './AppointmentsScreen';
import EmployeesScreen from './EmployeesScreen';
import SettingsScreen from './SettingsScreen';
import Header from '@components/HeaderAdmin'; // Importar Header si es necesario para los encabezados
import Colors from '@styles/colors';  // Colores personalizados
import { View, StyleSheet, StatusBar } from 'react-native';

const Tab = createBottomTabNavigator();

const HomeAdmin = () => {
  return (
    <>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Citas') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Empleados') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Ajustes') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,  // Usar el color primario cuando está activo
          tabBarInactiveTintColor: Colors.SECONDARYCOLOR, // Usar el color secundario cuando no está activo
          tabBarStyle: {
            backgroundColor: Colors.BACKGROUND, // Color de fondo de la barra de navegación
            borderTopWidth: 0, // Quitar borde superior
            paddingTop: 5,
            height: '9%',
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen 
          name="Citas" 
          component={AppointmentsScreen} 
          options={{
            headerShown: false,
            tabBarLabel: 'Citas',
            header: () => (
              <View>
                <Header userName="Admin" screenName="Citas" />
              </View>
            ),
          }} 
        />
        <Tab.Screen 
          name="Empleados" 
          component={EmployeesScreen} 
          options={{
            headerShown: false,
            tabBarLabel: 'Empleados',
            header: () => (
              <View>
                <Header userName="Admin" screenName="Empleados" />
              </View>
            ),
          }} 
        />
        <Tab.Screen 
          name="Ajustes" 
          component={SettingsScreen} 
          options={{
            headerShown: false,
            tabBarLabel: 'Ajustes',
            header: () => (
              <View >
                <Header userName="Admin" screenName="Ajustes" />
              </View>
            ),
          }} 
        />
      </Tab.Navigator>
    </>
  );
};

export default HomeAdmin;
