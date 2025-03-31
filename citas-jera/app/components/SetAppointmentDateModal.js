import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const SetAppointmentDateModal = () => {
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mode, setMode] = useState('date');

  const handleConfirm = () => {
    // Aquí puedes manejar la fecha y hora seleccionadas
    console.log("Fecha y hora seleccionadas:", date);
    setShowModal(false);
  };

  const onDateTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    
    setDate(currentDate);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón flotante con signo + */}
      
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => setShowModal(true)}
      >
        {Platform.OS === 'ios' &&
        <Text style={styles.iosPlusSign}>+</Text>}
        {Platform.OS === 'android' &&
        <Text style={styles.androidPlusSign}>+</Text>}
      </TouchableOpacity>

      {/* Modal para iOS y Android */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Seleccionar fecha y hora</Text>
            
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
                />
                
                <Text style={styles.pickerLabel}>Hora:</Text>
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="spinner"
                  onChange={onDateTimeChange}
                  locale="es"
                  style={styles.datePicker}
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
                    Fecha: {format(date, "PPP", { locale: es })}
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
                {formatDateTime()}
              </Text>
            </View>
            
            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 140, // Ajusta este valor según la altura de tu navigation tab
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
   
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  iosPlusSign: {
    fontSize: 30,
    color: 'white',
    alignSelf: 'center',
    fontWeight: 'bold',
    //marginTop: -2, // Ajuste fino para centrar visualmente el signo +
  },
  androidPlusSign: {
    fontSize: 30,
    color: 'white',
    alignSelf: 'center',
    fontWeight: 'bold',
    //marginTop: 'auto', // Ajuste fino para centrar visualmente el signo +
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
    marginBottom: 15,
    color: '#333',
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