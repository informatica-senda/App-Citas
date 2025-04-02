import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Header from '@components/HeaderAdmin.js';
import Colors from '@styles/colors';
import AppointmentModalAdmin from '@components/AppointmentModalAdmin';

// Sample appointment data
const APPOINTMENTS = [
  { 
    id: '1', 
    employee: 'Juan Pérez', 
    date: '2024-12-31', 
    time: '14:00', 
    category: 'psychology', 
    phone: '123-456-7890', 
    title: 'Cita de Psicología',
    client: 'María García',
    status: 'confirmed'
  },
  { 
    id: '2', 
    employee: 'Ana López', 
    date: '2023-06-16', 
    time: '14:00', 
    category: 'nutrition', 
    phone: '098-765-4321', 
    title: 'Cita de Nutrición',
    client: 'Carlos Rodríguez',
    status: 'confirmed'
  },
  { 
    id: '3', 
    employee: 'Juan Pérez', 
    date: '2024-12-31', 
    time: '16:30', 
    category: 'psychology', 
    phone: '123-456-7890', 
    title: 'Terapia Cognitiva',
    client: 'Laura Martínez',
    status: 'pending'
  }
];

// Función para formatear la fecha en formato dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const AppointmentsScreen = () => {
  // Estados
  const [filter, setFilter] = useState('all');
  const [appointments] = useState(APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Preparar las fechas marcadas en el calendario
  useEffect(() => {
    const marked = {};
    
    // Agrupar citas por fecha
    const appointmentsByDate = {};
    appointments.forEach(appointment => {
      if (!appointmentsByDate[appointment.date]) {
        appointmentsByDate[appointment.date] = [];
      }
      appointmentsByDate[appointment.date].push(appointment);
    });
    
    // Crear marcas para cada fecha
    Object.entries(appointmentsByDate).forEach(([date, dateAppointments]) => {
      // Verificar si hay citas de psicología y nutrición en esta fecha
      const hasPsychology = dateAppointments.some(app => app.category === 'psychology');
      const hasNutrition = dateAppointments.some(app => app.category === 'nutrition');
      
      // Si hay ambos tipos, usar dots
      if (hasPsychology && hasNutrition) {
        marked[date] = {
          dots: [
            { key: 'psychology', color: Colors.PRIMARYCOLOR },
            { key: 'nutrition', color: Colors.SECONDARYCOLOR }
          ],
          marked: true
        };
      } 
      // Si solo hay un tipo, usar un solo dot
      else {
        const dotColor = hasPsychology ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR;
        marked[date] = {
          dots: [{ key: 'single', color: dotColor }],
          marked: true
        };
      }
      
      // Si esta fecha está seleccionada, añadir propiedad selected
      if (date === selectedDate) {
        marked[date] = {
          ...marked[date],
          selected: true,
          selectedColor: Colors.PRIMARYCOLOR
        };
      }
    });
    
    // Si la fecha seleccionada no tiene citas, asegurarse de que esté marcada como seleccionada
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: Colors.PRIMARYCOLOR
      };
    }
    
    setMarkedDates(marked);
  }, [appointments, selectedDate]);

  // Función para manejar la selección de un día en el calendario
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  // Filtrar citas según el filtro activo y la fecha seleccionada
  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      const matchesFilter = filter === 'all' || appointment.category === filter;
      const matchesDate = !selectedDate || appointment.date === selectedDate;
      return matchesFilter && matchesDate;
    });
  };

  // Renderizar las citas filtradas
  const renderAppointments = () => {
    const filteredAppointments = getFilteredAppointments();
    
    if (selectedDate && filteredAppointments.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.noAppointmentsText}>No hay citas para esta fecha</Text>
        </View>
      );
    }

    return (
      <View style={styles.appointmentsList}>
        {selectedDate && (
          <Text style={styles.selectedDateText}>
            Citas para {formatDate(selectedDate)}
          </Text>
        )}
        
        {filteredAppointments.map(appointment => (
          <TouchableOpacity
            key={appointment.id}
            style={[
              styles.appointmentCard,
              { borderLeftColor: appointment.category === 'psychology' ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR }
            ]}
            onPress={() => setSelectedAppointment(appointment)}
          >
            <View style={styles.appointmentHeader}>
              <View style={styles.appointmentTitleContainer}>
                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: appointment.category === 'psychology' ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR }
                ]}>
                  <Text style={styles.categoryText}>
                    {appointment.category === 'psychology' ? 'Psicología' : 'Nutrición'}
                  </Text>
                </View>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: appointment.status === 'confirmed' ? '#4CAF50' : '#FFC107' }
                ]} />
                <Text style={styles.statusText}>
                  {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </Text>
              </View>
            </View>
            
            <View style={styles.appointmentContent}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{appointment.client}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{appointment.time}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="medical-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{appointment.employee}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{appointment.phone}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Header header_text="Citas" />
      </View>
      
      <View style={styles.container}>
        {/* Título de la sección */}
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>Calendario de Citas</Text>
        </View>
        
        {/* Filtros */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'psychology' && styles.activeFilter]}
            onPress={() => setFilter('psychology')}
          >
            <FontAwesome5 name="brain" size={14} color={filter === 'psychology' ? '#fff' : '#555'} style={styles.filterIcon} />
            <Text style={[styles.filterText, filter === 'psychology' && styles.activeFilterText]}>Psicología</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'nutrition' && styles.activeFilter]}
            onPress={() => setFilter('nutrition')}
          >
            <Ionicons name="nutrition-outline" size={16} color={filter === 'nutrition' ? '#fff' : '#555'} style={styles.filterIcon} />
            <Text style={[styles.filterText, filter === 'nutrition' && styles.activeFilterText]}>Nutrición</Text>
          </TouchableOpacity>
        </View>

        {/* Botón para ir a hoy */}
        <TouchableOpacity 
          style={styles.todayButton}
          onPress={() => {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(today);
          }}
        >
          <Ionicons name="today-outline" size={16} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.todayButtonText}>Hoy</Text>
        </TouchableOpacity>

        {/* Contenido principal */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Calendario */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate || new Date().toISOString().split('T')[0]}
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType="multi-dot"
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: '#333',
                selectedDayBackgroundColor: Colors.PRIMARYCOLOR,
                selectedDayTextColor: '#fff',
                todayTextColor: Colors.PRIMARYCOLOR,
                dayTextColor: '#333',
                textDisabledColor: '#d9e1e8',
                dotColor: Colors.PRIMARYCOLOR,
                selectedDotColor: '#fff',
                arrowColor: Colors.PRIMARYCOLOR,
                monthTextColor: '#333',
                indicatorColor: Colors.PRIMARYCOLOR,
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
            />
          </View>
          
          {/* Lista de citas */}
          {renderAppointments()}
          
          {/* Espacio adicional al final del scroll */}
          <View style={styles.scrollPadding} />
        </ScrollView>
      </View>

      {/* Modal para mostrar los detalles de la cita seleccionada */}
      <AppointmentModalAdmin 
        appointment={selectedAppointment} 
        visible={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  headerContainer: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  activeFilter: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  activeFilterText: {
    color: '#fff',
  },
  filterIcon: {
    marginRight: 6,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentsList: {
    marginTop: 8,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentHeader: {
    marginBottom: 12,
  },
  appointmentTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  appointmentContent: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  emptyStateContainer: {
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
  },
  scrollPadding: {
    height: 40,
  },
});

export default AppointmentsScreen;