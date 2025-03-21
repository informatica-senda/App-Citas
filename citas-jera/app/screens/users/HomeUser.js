// Importamos las bibliotecas y componentes necesarios para la aplicación
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import Header from '@components/HeaderUser';
import AppointmentModal from '@components/AppointmentModal';
import Colors from '@styles/colors';
import LoginScreen from '../login';

// Creamos el navegador de pestañas para la aplicación
const Tab = createBottomTabNavigator();

/**
 * Función que genera una lista de citas ficticias para simular la carga de datos en la aplicación.
 * - Se generan 50 citas a partir de una fecha base ('2023-06-01').
 * - Cada cita se asigna aleatoriamente a una de dos categorías: 'psychology' o 'nutrition'.
 * - Se devuelve un array de objetos con los datos de cada cita.
 */
const generateAppointments = () => {
  const appointments = [];
  const baseDate = new Date('2023-06-01');

  for (let i = 0; i < 50; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    const category = Math.random() > 0.5 ? 'psychology' : 'nutrition';

    appointments.push({
      id: i + 1,
      title: `Consulta ${category === 'psychology' ? 'de Psicología' : 'de Nutrición'} ${i + 1}`,
      date: date.toISOString().split('T')[0],
      category: category,
    });
  }

  return appointments;
};

/**
 * Función para formatear una fecha en el formato "dd/mm/yyyy".
 * - Extrae el día, mes y año de un objeto Date.
 * - Añade un '0' delante si el día o mes es de un solo dígito.
 * - Retorna la fecha en el formato adecuado.
 */
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Componente principal de la pantalla de usuario
const HomeUser = () => {
  const navigation = useNavigation();

  // Estado que almacena la información del usuario actual
  const [user, setUser] = useState({ name: 'Juan' });
  
  // Lista de citas generadas aleatoriamente para simular datos en la aplicación
  const [appointments, setAppointments] = useState(generateAppointments());
  
  // Estado que almacena la cita seleccionada para ser mostrada en un modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Estado que controla la visibilidad del modal de detalles de la cita
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estado que guarda la fecha seleccionada en el calendario
  const [selectedDate, setSelectedDate] = useState('');
  
  // Estados que almacenan las fechas marcadas en el calendario para cada categoría de citas
  const [psychologyMarkedDates, setPsychologyMarkedDates] = useState({});
  const [nutritionMarkedDates, setNutritionMarkedDates] = useState({});

  /**
   * useEffect que se ejecuta cuando cambia la lista de citas.
   * - Recorre todas las citas y asigna un color diferente en el calendario según la categoría.
   * - Almacena estas fechas en estados separados para ser utilizados en el calendario.
   */
  useEffect(() => {
    const psychologyMarked = {};
    const nutritionMarked = {};
    
    appointments.forEach(appointment => {
      if (appointment.category === 'psychology') {
        psychologyMarked[appointment.date] = { marked: true, dotColor: Colors.PSICOLOGIA };
      } else {
        nutritionMarked[appointment.date] = { marked: true, dotColor: Colors.NUTRICIÓN };
      }
    });
    
    setPsychologyMarkedDates(psychologyMarked);
    setNutritionMarkedDates(nutritionMarked);
  }, [appointments]);

  /**
   * Función que maneja la selección de una cita por parte del usuario.
   * - Guarda la cita seleccionada en el estado correspondiente.
   * - Muestra el modal con la información de la cita seleccionada.
   */
  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  /**
   * Función que renderiza la lista de citas para una fecha seleccionada, filtradas por categoría.
   * - Muestra las citas en una lista con botones interactivos para seleccionarlas.
   * - Indica si no hay citas disponibles para la fecha elegida.
   */
  const renderAppointmentsForSelectedDate = (category) => {
    // Filtramos las citas para la fecha seleccionada y la categoría especificada
    const appointmentsForDay = appointments.filter(a => a.date === selectedDate && a.category === category);
    
    // Obtenemos la fecha de hoy en formato ISO
    const today = new Date().toISOString().split('T')[0];
    
    return (
      <View style={styles.appointmentsList}>
        {/* Encabezado que muestra la fecha seleccionada */}
        <Text style={styles.selectedDateText}>
          {selectedDate === today ? 'Citas para hoy' : `Citas para ${formatDate(new Date(selectedDate))}`}
        </Text>
        
        {/* Si hay citas, las mostramos en la lista */}
        {appointmentsForDay.length > 0 ? (
          appointmentsForDay.map(appointment => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentItem}
              onPress={() => handleSelectAppointment(appointment)}
            >
              <Text style={styles.appointmentText}>{appointment.title}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noAppointmentsText}>No hay citas para esta fecha</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <Tab.Navigator>
        <Tab.Screen name="Psicología" component={PsychologyScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Nutrición" component={NutritionScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Exit" component={HandleLogOut} options={{ headerShown: false }} />
      </Tab.Navigator>
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default HomeUser;