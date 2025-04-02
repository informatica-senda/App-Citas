import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, StatusBar, BackHandler, Platform, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppointmentsScreen from './AppointmentsScreen';
import EmployeesScreen from './EmployeesScreen';
import RequestsScreen from './RequestScreen';
import Header from '@components/HeaderAdmin';
import LogoutModal from '@components/LogOutModal';
import Colors from '@styles/colors';

const Tab = createBottomTabNavigator();

// Componente vacío para la pestaña de Salir
const EmptyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header userName="Admin" screenName="Perfil" />
    </SafeAreaView>
  );
};

const HomeManager = () => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Simulamos un pequeño retraso para mostrar el indicador de carga
    setTimeout(() => {
      setIsLoggingOut(false);
      setLogoutModalVisible(false);
      // Navegamos a la pantalla de login
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    }, 800);
  };

  // Función para cancelar el cierre de sesión
  const handleCancel = () => {
    setLogoutModalVisible(false);
  };

  // Manejamos el botón de retroceso en Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (logoutModalVisible) {
        handleCancel();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [logoutModalVisible]);

  return (
    <>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />

      {/* Modal de confirmación de cierre de sesión */}
      <LogoutModal 
        visible={logoutModalVisible}
        onCancel={handleCancel}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            // Iconos personalizados para cada pestaña
            switch (route.name) {
              case 'Citas':
                return (
                  <MaterialCommunityIcons 
                    name={focused ? 'calendar-clock' : 'calendar-clock-outline'} 
                    size={size} 
                    color={color} 
                  />
                );
              case 'Empleados':
                return (
                  <MaterialCommunityIcons 
                    name={focused ? 'account-group' : 'account-group-outline'} 
                    size={size} 
                    color={color} 
                  />
                );
              case 'Solicitudes':
                return (
                  <MaterialCommunityIcons 
                    name={focused ? 'clipboard-text' : 'clipboard-text-outline'} 
                    size={size} 
                    color={color} 
                  />
                );
              case 'Salir':
                return (
                  <MaterialCommunityIcons 
                    name={focused ? 'logout' : 'logout'} 
                    size={size} 
                    color={color} 
                  />
                );
              default:
                return null;
            }
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: '#777',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#eee',
            paddingTop: 5,
            height: Platform.OS === 'ios' ? 85 : 65,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            paddingBottom: Platform.OS === 'ios' ? 0 : 5,
          },
          tabBarItemStyle: {
            paddingTop: 5,
          },
        })}
        initialRouteName="Citas"
        backBehavior="initialRoute"
      >
        <Tab.Screen
          name="Citas"
          component={AppointmentsScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Citas',
          }}
        />

        <Tab.Screen
          name="Solicitudes"
          component={RequestsScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Solicitudes',
          }}
        />

        <Tab.Screen
          name="Empleados"
          component={EmployeesScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Empleados',
          }}
        />
        
        {/* Pestaña para cerrar sesión */}
        <Tab.Screen
          name="Salir"
          component={EmptyScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Salir',
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevenimos la navegación por defecto
              e.preventDefault();
              
              // Mostramos el modal de confirmación
              setLogoutModalVisible(true);
            },
          })}
        />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
});

export default HomeManager;