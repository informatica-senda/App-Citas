import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AppointmentsScreen from './AppointmentsScreen';
import EmployeesScreen from './EmployeesScreen';
import SettingsScreen from './SettingsScreen';
import RequestsScreen from './RequestScreen'; // Importamos la nueva pantalla de solicitudes
import Header from '@components/HeaderAdmin';
import Colors from '@styles/colors';
import { View, StyleSheet, StatusBar } from 'react-native';

const Tab = createBottomTabNavigator();

const HomeManager = () => {
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
            } else if (route.name === 'Solicitudes') { // Icono para la nueva pestaña
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Ajustes') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },

          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: Colors.SECONDARYCOLOR,

          tabBarStyle: {
            backgroundColor: Colors.BACKGROUND,
            borderTopWidth: 0,
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
          name="Solicitudes" // Nueva pestaña de solicitudes
          component={RequestsScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Solicitudes',
            header: () => (
              <View>
                <Header userName="Admin" screenName="Solicitudes" />
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
              <View>
                <Header userName="Admin" screenName="Ajustes" />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default HomeManager;