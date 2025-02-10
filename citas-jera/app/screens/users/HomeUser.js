import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '@components/HeaderUser';
import Colors from '@styles/colors';
import LoginScreen from '../login';
import SolicitarCitas from './SolicitarCitasScreen';
import FichajeScreen from './FichajeScreen';


const Tab = createBottomTabNavigator();


const HomeUser = () => {
  return (
    <>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Fichaje') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Solicitar servicio') {
              iconName = focused ? 'git-pull-request' : 'git-pull-request-outline';
            } else if (route.name === 'Ajustes') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: Colors.SUCCESS,  // Usar el color primario cuando está activo
          tabBarInactiveTintColor: Colors.TEXT, // Usar el color secundario cuando no está activo
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
          name="Fichaje" 
          component={FichajeScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Fichaje',
          }} 
        />
        <Tab.Screen 
          name="Solicitar servicio" 
          component={SolicitarCitas}
          options={{
            headerShown: false,
            tabBarLabel: 'Solicitar servicio',
            header: () => (
              <View>
                <Header userName="Admin" screenName="Empleados" />
              </View>
            ),
          }} 
        />
      </Tab.Navigator>
    </>
  );
};

export default HomeUser;
