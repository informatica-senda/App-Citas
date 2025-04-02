import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Platform
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, addDays, getDay, isAfter, isSameDay, parseISO, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '@styles/colors';

const AppointmentCalendarScreen = ({ onClose, onConfirm, patientName, service }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [availableTimesForSelectedDate, setAvailableTimesForSelectedDate] = useState([]);
  
  // Array de horarios disponibles para citas
  const availableTimeSlots = [ '17:00', '18:00'];
  
  // Array de días disponibles para citas (0 = domingo, 1 = lunes, ..., 6 = sábado)
  const availableDays = [2, 3]; // Martes, Miércoles
  
  // Mapeo de números de día a nombres en español
  const dayNumberToName = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  };
  
  // Array de citas ya reservadas (fecha y hora)
  const bookedAppointments = [
    { date: '2025-04-15', time: '17:00' },
    { date: '2025-04-15', time: '18:00' },
    { date: '2025-04-16', time: '16:30' },
    { date: '2025-04-16', time: '17:30' },
    { date: '2023-06-14', time: '16:30' },
    { date: '2023-06-21', time: '16:30' },
    { date: '2023-06-21', time: '17:30' },
    { date: '2023-06-27', time: '17:30' },
    { date: '2023-07-04', time: '16:30' },
  ];
  
  // Calcular la fecha mínima (3 días después de hoy)
  const today = new Date();
  const minDate = addDays(today, 3);
  const minDateString = format(minDate, 'yyyy-MM-dd');
  
  // Función para verificar si un día de la semana está disponible
  const isDayAvailable = (date) => {
    const day = getDay(date);
    return availableDays.includes(day);
  };
  
  // Función para verificar si una fecha es válida (día disponible y después de minDate)
  const isValidDate = (date) => {
    return isDayAvailable(date) && 
           (isAfter(date, minDate) || isSameDay(date, minDate));
  };
  
  // Función para verificar si una fecha tiene todos los horarios reservados
  const isFullyBooked = (dateString) => {
    const bookedTimes = bookedAppointments
      .filter(appointment => appointment.date === dateString)
      .map(appointment => appointment.time);
    
    // Si todos los horarios disponibles están reservados, la fecha está completamente ocupada
    const availableTimes = getAvailableTimesForDate(dateString);
    return availableTimes.length === 0;
  };
  
  // Función para obtener los horarios disponibles para una fecha
  const getAvailableTimesForDate = (dateString) => {
    const bookedTimes = bookedAppointments
      .filter(appointment => appointment.date === dateString)
      .map(appointment => appointment.time);
    
    // Filtrar los horarios que no están reservados
    return availableTimeSlots.filter(time => !bookedTimes.includes(time));
  };
  
  // Función para generar las fechas marcadas en el calendario
  useEffect(() => {
    const generateMarkedDates = () => {
      const marked = {};
      
      // Marcar la fecha seleccionada
      if (selectedDate) {
        marked[selectedDate] = {
          selected: true,
          selectedColor: Colors.PRIMARYCOLOR,
        };
      }
      
      // Marcar los próximos 3 meses de fechas disponibles
      const startDate = minDate;
      const endDate = addMonths(today, 3);
      
      let currentDate = startDate;
      while (currentDate <= endDate) {
        const dateString = format(currentDate, 'yyyy-MM-dd');
        
        if (isValidDate(currentDate)) {
          // Verificar si la fecha está completamente reservada
          if (isFullyBooked(dateString)) {
            // Fecha completamente reservada
            marked[dateString] = {
              ...marked[dateString],
              disabled: true,
              disableTouchEvent: true,
              textColor: '#d9e1e8',
              // Opcional: marcar con un punto rojo para indicar que está reservado
              marked: true,
              dotColor: 'red',
            };
          } else {
            // Es un día disponible (día en availableDays después de minDate)
            marked[dateString] = {
              ...marked[dateString],
              marked: true,
              dotColor: Colors.PRIMARYCOLOR,
              activeOpacity: 1,
            };
          }
        } else {
          // No es un día disponible
          marked[dateString] = {
            ...marked[dateString],
            disabled: true,
            disableTouchEvent: true,
            textColor: '#d9e1e8',
          };
        }
        
        // Avanzar al siguiente día
        currentDate = addDays(currentDate, 1);
      }
      
      return marked;
    };
    
    setMarkedDates(generateMarkedDates());
  }, [selectedDate]);
  
  // Función para manejar la selección de fecha
  const handleDateSelect = (date) => {
    const selectedDateObj = parseISO(date.dateString);
    
    // Solo procesar la selección si es un día válido y no está completamente reservado
    if (isValidDate(selectedDateObj) && !isFullyBooked(date.dateString)) {
      setSelectedDate(date.dateString);
      setSelectedTime(null); // Resetear la hora seleccionada
      
      // Actualizar los horarios disponibles para esta fecha
      const availableTimes = getAvailableTimesForDate(date.dateString);
      setAvailableTimesForSelectedDate(availableTimes);
    }
    // No mostrar alertas si el día no es válido, simplemente ignorar la selección
  };
  
  // Función para manejar la selección de hora
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };
  
  // Función para confirmar la cita
  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      alert('Por favor, selecciona una fecha y hora');
      return;
    }
    
    // Crear objeto de fecha con la fecha y hora seleccionadas
    const [year, month, day] = selectedDate.split('-');
    const [hours, minutes] = selectedTime.split(':');
    
    const appointmentDate = new Date(year, month - 1, day, hours, minutes);
    
    if (onConfirm) {
      onConfirm(appointmentDate);
    }
  };
  
  // Función para formatear la fecha en español
  const formatDateToSpanish = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  };
  
  // Función para obtener el nombre del día de la semana
  const getDayName = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = getDay(date);
    
    return dayNumberToName[day];
  };
  
  // Generar texto de días disponibles para las instrucciones
  const getAvailableDaysText = () => {
    return availableDays.map(day => dayNumberToName[day]).join(', ');
  };
  
  // Actualizar los horarios disponibles cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      const availableTimes = getAvailableTimesForDate(selectedDate);
      setAvailableTimesForSelectedDate(availableTimes);
    }
  }, [selectedDate]);
  
  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={Colors.PRIMARYCOLOR} barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programar Cita</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Información del paciente */}
        <View style={styles.patientInfoContainer}>
          <Text style={styles.patientName}>{patientName}</Text>
          <View style={styles.serviceContainer}>
            {service === 'Psicología' ? (
              <FontAwesome5 name="brain" size={18} color={Colors.PRIMARYCOLOR} />
            ) : (
              <Ionicons name="nutrition" size={20} color={Colors.PRIMARYCOLOR} />
            )}
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        </View>
        
        {/* Instrucciones */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Selecciona una fecha y hora</Text>
          <Text style={styles.instructionsText}>
            • Solo puedes seleccionar: {getAvailableDaysText()}{'\n'}
            • Solo puedes seleccionar fechas a partir de 3 días después de hoy{'\n'}
            • Las fechas con punto rojo están completamente reservadas
          </Text>
          <Text style={styles.instructionsNote}>
            Los días disponibles están marcados con un punto verde
          </Text>
        </View>
        
        {/* Calendario */}
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Fecha</Text>
          <Calendar
            minDate={minDateString}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            firstDay={1} // Semana comienza en lunes
            disableAllTouchEventsForDisabledDays={true}
            theme={{
              calendarBackground: 'white',
              textSectionTitleColor: Colors.TEXTCOLOR,
              selectedDayBackgroundColor: Colors.PRIMARYCOLOR,
              selectedDayTextColor: 'white',
              todayTextColor: Colors.PRIMARYCOLOR,
              dayTextColor: Colors.TEXTCOLOR,
              textDisabledColor: '#d9e1e8',
              dotColor: Colors.PRIMARYCOLOR,
              selectedDotColor: 'white',
              arrowColor: Colors.PRIMARYCOLOR,
              monthTextColor: Colors.TEXTCOLOR,
              indicatorColor: Colors.PRIMARYCOLOR,
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
          />
        </View>
        
        {/* Selección de hora */}
        {selectedDate && (
          <View style={styles.timeSelectionContainer}>
            <Text style={styles.sectionTitle}>Hora</Text>
            <Text style={styles.selectedDateText}>
              {formatDateToSpanish(selectedDate)} ({getDayName(selectedDate)})
            </Text>
            
            <View style={styles.timeButtonsContainer}>
              {/* Mostrar todos los horarios disponibles */}
              {availableTimesForSelectedDate.length > 0 ? (
                availableTimesForSelectedDate.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      selectedTime === time && styles.selectedTimeButton
                    ]}
                    onPress={() => handleTimeSelect(time)}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        selectedTime === time && styles.selectedTimeText
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noTimesText}>
                  No hay horarios disponibles para esta fecha
                </Text>
              )}
            </View>
          </View>
        )}
        
        {/* Espacio adicional para asegurar que todo el contenido sea scrollable */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Botón de confirmar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedDate || !selectedTime) && styles.disabledButton
          ]}
          onPress={handleConfirm}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    backgroundColor: Colors.PRIMARYCOLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Asegura que haya espacio suficiente al final
  },
  patientInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.TEXTCOLOR,
    marginBottom: 8,
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceText: {
    fontSize: 16,
    color: Colors.PRIMARYCOLOR,
    marginLeft: 6,
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.PRIMARYCOLOR,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TEXTCOLOR,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.SECONDARYCOLOR,
    lineHeight: 20,
    marginBottom: 8,
  },
  instructionsNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.PRIMARYCOLOR,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TEXTCOLOR,
    marginBottom: 12,
  },
  timeSelectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateText: {
    fontSize: 14,
    color: Colors.SECONDARYCOLOR,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  timeButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 10,
    marginHorizontal: '1.5%',
  },
  selectedTimeButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  timeButtonText: {
    fontSize: 16,
    color: Colors.TEXTCOLOR,
    fontWeight: '500',
  },
  selectedTimeText: {
    color: 'white',
  },
  noTimesText: {
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
    marginTop: 10,
  },
  bottomPadding: {
    height: 40, // Espacio adicional al final del ScrollView
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  confirmButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppointmentCalendarScreen;