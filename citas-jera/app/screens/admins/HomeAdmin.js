import React from 'react'; // Importa la librería React para construir la interfaz de usuario
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Importa la función para crear una navegación con pestañas en la parte inferior de la pantalla
import { Ionicons } from '@expo/vector-icons'; // Importa la biblioteca de iconos Ionicons para agregar iconos visuales en la navegación
import AppointmentsScreen from './AppointmentsScreen'; // Importa el componente de la pantalla de citas
import EmployeesScreen from './EmployeesScreen'; // Importa el componente de la pantalla de empleados
import SettingsScreen from './SettingsScreen'; // Importa el componente de la pantalla de ajustes
import Header from '@components/HeaderAdmin'; // Importa un componente personalizado de encabezado, que mostrará información del usuario y la pantalla actual
import Colors from '@styles/colors'; // Importa un archivo de estilos que contiene una paleta de colores predefinidos
import { View, StyleSheet, StatusBar } from 'react-native'; // Importa componentes esenciales de React Native para la interfaz de usuario

// Crea un objeto de navegación de pestañas en la parte inferior de la pantalla
const Tab = createBottomTabNavigator();

// Definición del componente principal HomeAdmin, que maneja la navegación entre diferentes pantallas del administrador
const HomeAdmin = () => {
  return (
    <>
      {/* Configura la barra de estado del dispositivo para que sea transparente, mejorando la integración visual con el diseño de la app */}
      <StatusBar translucent={true} backgroundColor={'transparent'} />

      {/* Define la estructura de navegación por pestañas */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Define el ícono que se mostrará en cada pestaña según la pantalla activa
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            // Asigna un icono específico a cada pantalla dependiendo de si está activa o no
            if (route.name === 'Citas') {
              iconName = focused ? 'calendar' : 'calendar-outline'; // Si está activa, usa 'calendar', si no, usa 'calendar-outline'
            } else if (route.name === 'Empleados') {
              iconName = focused ? 'people' : 'people-outline'; // Ícono de personas para la pestaña de empleados
            } else if (route.name === 'Ajustes') {
              iconName = focused ? 'settings' : 'settings-outline'; // Ícono de ajustes para la pestaña de configuración
            }

            // Retorna el icono configurado con el color y tamaño adecuados
            return <Ionicons name={iconName} size={size} color={color} />;
          },

          // Configuración del color de los iconos de la barra de navegación
          tabBarActiveTintColor: Colors.PRIMARYCOLOR, // Define el color del icono cuando la pestaña está activa
          tabBarInactiveTintColor: Colors.SECONDARYCOLOR, // Define el color del icono cuando la pestaña está inactiva

          // Configuración visual de la barra de navegación
          tabBarStyle: {
            backgroundColor: Colors.BACKGROUND, // Define el color de fondo de la barra de pestañas
            borderTopWidth: 0, // Elimina la línea superior de la barra para un diseño más limpio
            paddingTop: 5, // Agrega un pequeño margen en la parte superior para mejorar la estética
            height: '9%', // Ajusta la altura de la barra de pestañas
          },

          // Configuración del estilo del texto en las pestañas
          tabBarLabelStyle: {
            fontSize: 14, // Establece el tamaño del texto de las pestañas
            fontWeight: '600', // Define el peso del texto para que sea más visible
          },
        })}
      >
        {/* Configuración de la pestaña de Citas */}
        <Tab.Screen
          name="Citas"
          component={AppointmentsScreen}
          options={{
            headerShown: false, // Oculta el encabezado predeterminado del navegador para usar uno personalizado
            tabBarLabel: 'Citas', // Nombre que se muestra en la pestaña
            header: () => (
              <View>
                <Header userName="Admin" screenName="Citas" /> {/* Muestra un encabezado personalizado con el nombre del usuario y la pantalla actual */}
              </View>
            ),
          }}
        />

        {/* Configuración de la pestaña de Empleados */}
        <Tab.Screen
          name="Empleados"
          component={EmployeesScreen}
          options={{
            headerShown: false, // Oculta el encabezado predeterminado
            tabBarLabel: 'Empleados', // Nombre de la pestaña
            header: () => (
              <View>
                <Header userName="Admin" screenName="Empleados" /> {/* Encabezado que muestra información del usuario y la pantalla actual */}
              </View>
            ),
          }}
        />

        {/* Configuración de la pestaña de Ajustes */}
        <Tab.Screen
          name="Ajustes"
          component={SettingsScreen}
          options={{
            headerShown: false, // Oculta el encabezado predeterminado
            tabBarLabel: 'Ajustes', // Nombre de la pestaña
            header: () => (
              <View>
                <Header userName="Admin" screenName="Ajustes" /> {/* Encabezado para la pantalla de ajustes */}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default HomeAdmin; // Exporta el componente para que pueda ser utilizado en otras partes de la aplicación
