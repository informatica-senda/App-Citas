import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppointmentsScreen from './AppointmentsScreen';
import RequestsScreen from './RequestScreen';
import EmployeesScreen from './EmployeesScreen';
import Header from '@components/HeaderAdmin';
import Colors from '@styles/colors';

const Tab = createBottomTabNavigator();

// Componente vacío para la pestaña de Salir
const EmptyScreen = () => {
  return (
    <View style={styles.container}>
      <Header userName="Admin" screenName="Perfil" />
    </View>
  );
};

// Componente para el modal de cierre de sesión
const LogoutModal = ({ visible, onCancel, onConfirm, isLoggingOut }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Ionicons name="log-out" size={50} color={Colors.PRIMARYCOLOR} style={styles.modalIcon} />
          
          <Text style={styles.modalTitle}>Cerrar Sesión</Text>
          <Text style={styles.modalText}>
            ¿Estás seguro que deseas cerrar sesión de la aplicación?
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onCancel}
              disabled={isLoggingOut}
            >
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonConfirm]}
              onPress={onConfirm}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonConfirmText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const HomeTeacher = () => {
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
    
    // Navegamos a la pestaña de Citas usando el objeto navigation
    navigation.navigate('AppointmentsScreen');
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
      <StatusBar translucent={true} backgroundColor={'transparent'} />

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
            let iconName;

            if (route.name === 'Citas') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Empleados') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Solicitudes') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Personas') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Salir') {
              iconName = focused ? 'log-out' : 'log-out-outline';
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
            fontFamily: 'Inter_500Medium',
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
            header: () => (
              <View>
                <Header userName="Admin" screenName="Citas" />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Solicitudes"
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
          name="Personas"
          component={EmployeesScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Personas',
            header: () => (
              <View>
                <Header userName="Admin" screenName="Personas" />
              </View>
            ),
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    fontFamily: 'Inter_700Bold',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonConfirm: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  buttonCancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
  },
  buttonConfirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default HomeTeacher;