import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  SafeAreaView,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isAfter, startOfDay, getDay, isSameDay, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

// Modificamos el componente para recibir props que controlen la visibilidad del modal
export const SetAppointmentDateModal = ({ visible, onClose, onConfirm }) => {
  // Inicializar con la fecha actual
  const now = new Date();
  const [date, setDate] = useState(now);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mode, setMode] = useState('date');
  const [isWeekendSelected, setIsWeekendSelected] = useState(false);
  const [isPastTimeSelected, setIsPastTimeSelected] = useState(false);
  const [isPastDateSelected, setIsPastDateSelected] = useState(false);

  // Función para verificar si una fecha es fin de semana (sábado o domingo)
  const isWeekend = (date) => {
    const day = getDay(date);
    // 0 es domingo, 6 es sábado
    return day === 0 || day === 6;
  };

  // Función para verificar si la hora seleccionada ya ha pasado (solo para el día actual)
  const isPastTime = (selectedDate) => {
    const now = new Date();
    
    // Solo verificamos si es el día actual
    if (isSameDay(selectedDate, now)) {
      // Comparamos solo las horas y minutos
      return selectedDate.getHours() < now.getHours() || 
             (selectedDate.getHours() === now.getHours() && 
              selectedDate.getMinutes() < now.getMinutes());
    }
    
    return false;
  };

  // Función para verificar si la fecha seleccionada es pasada
  const isPastDate = (selectedDate) => {
    const today = startOfDay(new Date());
    const selectedDay = startOfDay(selectedDate);
    return isBefore(selectedDay, today);
  };

  // Verificar si la fecha actual es fin de semana o tiempo pasado cada vez que cambia
  useEffect(() => {
    setIsWeekendSelected(isWeekend(date));
    setIsPastTimeSelected(isPastTime(date));
    setIsPastDateSelected(isPastDate(date));
  }, [date]);

  // Reiniciar el estado cuando el modal se abre
  useEffect(() => {
    if (visible) {
      setDate(new Date());
      setIsWeekendSelected(false);
      setIsPastTimeSelected(false);
      setIsPastDateSelected(false);
    }
  }, [visible]);

  const handleConfirm = () => {
    // Verificar si es fin de semana antes de confirmar
    if (isWeekendSelected) {
      Alert.alert(
        "Fecha no válida", 
        "No se pueden seleccionar fines de semana (sábado o domingo)."
      );
      return;
    }
    
    // Verificar si es una hora pasada del día actual
    if (isPastTimeSelected) {
      Alert.alert(
        "Hora no válida", 
        "No se puede seleccionar una hora que ya ha pasado para el día de hoy."
      );
      return;
    }
    
    // Verificar si es una fecha pasada
    if (isPastDateSelected) {
      Alert.alert(
        "Fecha no válida", 
        "No se pueden seleccionar fechas pasadas."
      );
      return;
    }
    
    // Llamar a la función onConfirm pasada como prop con la fecha seleccionada
    if (onConfirm) {
      onConfirm(date);
    }
    
    // Cerrar el modal
    if (onClose) {
      onClose();
    }
  };

  const onDateTimeChange = (event, selectedDate) => {
    if (!selectedDate) {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        setShowTimePicker(false);
      }
      return;
    }
    
    const currentDate = selectedDate;
    
    // Si es selección de fecha, realizar validaciones
    if (mode === 'date') {
      // Verificar si la fecha es fin de semana
      if (isWeekend(currentDate)) {
        if (Platform.OS === 'android') {
          setShowDatePicker(false);
          Alert.alert(
            "Fecha no válida", 
            "No se pueden seleccionar fines de semana (sábado o domingo)."
          );
        }
        // En iOS, actualizamos la fecha pero marcamos que es fin de semana
        setDate(currentDate);
        setIsWeekendSelected(true);
        return;
      }
    }
    
    // Si es selección de hora, verificar que no sea una hora pasada del día actual
    if (mode === 'time') {
      if (isPastTime(currentDate) && isSameDay(currentDate, now)) {
        if (Platform.OS === 'android') {
          setShowTimePicker(false);
          Alert.alert(
            "Hora no válida", 
            "No se puede seleccionar una hora que ya ha pasado para el día de hoy."
          );
        }
        // En iOS, actualizamos la hora pero marcamos que es una hora pasada
        setDate(currentDate);
        setIsPastTimeSelected(true);
        return;
      }
    }
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    
    setDate(currentDate);
    setIsWeekendSelected(isWeekend(currentDate));
    setIsPastTimeSelected(isPastTime(currentDate));
    setIsPastDateSelected(isPastDate(currentDate));
  };

  const showPicker = (currentMode) => {
    setMode(currentMode);
    if (Platform.OS === 'android') {
      if (currentMode === 'date') {
        setShowDatePicker(true);
        setShowTimePicker(false);
      } else {
        setShowTimePicker(true);
        setShowDatePicker(false);
      }
    }
  };

  const formatDateTime = () => {
    const dateString = format(date, "PPP", { locale: es });
    const timeString = format(date, "HH:mm", { locale: es });
    return `${dateString} a las ${timeString}`;
  };

  // Función para obtener el nombre del día de la semana
  const getDayName = (date) => {
    return format(date, "EEEE", { locale: es });
  };

  // Función para determinar si el botón de confirmar debe estar deshabilitado
  const isConfirmDisabled = () => {
    return isWeekendSelected || isPastTimeSelected || isPastDateSelected;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Seleccionar fecha y hora</Text>
          
          {/* Mensaje informativo sobre restricciones */}
          <Text style={styles.infoText}>
            No se pueden confirmar fechas pasadas, fines de semana, ni horas que ya han pasado del día actual.
          </Text>
          
          {/* DatePicker para iOS */}
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerContainer}>
              <Text style={styles.pickerLabel}>Fecha:</Text>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateTimeChange}
                locale="es"
                style={styles.datePicker}
                // Eliminamos minimumDate para permitir fechas pasadas
              />
              
              <Text style={styles.pickerLabel}>Hora:</Text>
              <DateTimePicker
                value={date}
                mode="time"
                display="spinner"
                onChange={onDateTimeChange}
                locale="es"
                style={styles.datePicker}
                minuteInterval={15} // Intervalos de 15 minutos para facilitar la selección
              />
            </View>
          )}
          
          {/* Para Android, mostramos botones que abren los DatePicker nativos */}
          {Platform.OS === 'android' && !showDatePicker && !showTimePicker && (
            <View style={styles.androidPickerContainer}>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => showPicker('date')}
              >
                <Text style={styles.dateButtonText}>
                  Fecha: {format(date, "PPP", { locale: es })} ({getDayName(date)})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => showPicker('time')}
              >
                <Text style={styles.dateButtonText}>
                  Hora: {format(date, "HH:mm", { locale: es })}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* DatePicker para Android como diálogo */}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateTimeChange}
              locale="es"
              // Eliminamos minimumDate para permitir fechas pasadas
            />
          )}
          
          {/* TimePicker para Android como diálogo */}
          {Platform.OS === 'android' && showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onDateTimeChange}
              locale="es"
            />
          )}
          
          {/* Fecha y hora seleccionadas */}
          <View style={styles.selectedDateTimeContainer}>
            <Text style={styles.selectedDateTime}>
              {formatDateTime()} ({getDayName(date)})
            </Text>         
          </View>
          
          
          
          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.confirmButton,
                isConfirmDisabled() && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={isConfirmDisabled()}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  iosPickerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  androidPickerContainer: {
    width: '100%',
    marginVertical: 10,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginTop: 10,
  },
  datePicker: {
    width: 320,
    height: 120,
  },
  dateButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDateTimeContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedDateTime: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    padding: 12,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SetAppointmentDateModal;