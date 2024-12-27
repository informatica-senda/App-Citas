import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@styles/colors.js';

const AppointmentModal = ({ appointment, visible, onClose }) => {
  // Función para abrir WhatsApp con el número correspondiente
  const handleWhatsAppAccess = () => {
    if (appointment) {
      // Determinar el número de teléfono dependiendo de la categoría
      const phoneNumber = appointment.category === 'psychology' ? '+34637645417' : '+34637645418';
      Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
    }
  };

  if (!appointment) return null;

  // Asignar el nombre del encargado según la categoría de la cita
  const encargado = appointment.category === 'psychology' ? 'Fernando Rodríguez' : 'Julieta Murcia';
  const phoneNumber = appointment.category === 'psychology' ? '+34637645417' : '+34637645418';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Título de la cita */}
          <Text style={styles.modalTitle}>{appointment.title}</Text>

          {/* Información de la cita */}
          <View style={styles.infoContainer}>
            <Text style={styles.modalText}><Text style={styles.label}>Fecha: </Text>{appointment.date}</Text>
            <Text style={styles.modalText}><Text style={styles.label}>Encargado: </Text>{encargado}</Text>
            <Text style={styles.modalText}><Text style={styles.label}>Teléfono: </Text>{phoneNumber}</Text>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}
            >
              <Ionicons name="close-circle" size={20} color={Colors.TEXTWHITE} />
              <Text style={styles.textStyle}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonWhatsApp]}
              onPress={handleWhatsAppAccess}
            >
              <Ionicons name="logo-whatsapp" size={20} color={Colors.TEXTWHITE} />
              <Text style={styles.textStyle}>Cita WhatsApp</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro con transparencia
  },
  modalView: {
    margin: 20,
    width: '95%',
    backgroundColor: Colors.BACKGROUND, // Fondo blanco
    borderRadius: 25, // Bordes más redondeados
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8, // Sombra más difusa y suave
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 24, // Título más grande
    fontWeight: 'bold', // Negrita para el título
    color: Colors.TEXT, // Color del texto del título
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  modalText: {
    textAlign: 'left', // Justificar a la izquierda
    fontSize: 18, // Texto más grande y legible
    color: Colors.TEXT, // Color del texto
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold', // Resaltar las etiquetas como Fecha, Encargado, Teléfono
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 20, // Bordes más suaves en los botones
    paddingVertical: 8,
    paddingHorizontal: 15,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  buttonClose: {
    backgroundColor: Colors.ERROR, // Usando el color de error
  },
  buttonWhatsApp: {
    backgroundColor: Colors.SUCCESS, // Usando el color de éxito
  },
  textStyle: {
    color: Colors.TEXTWHITE, // Color del texto en blanco
    fontWeight: 'bold',
    fontSize: 16, // Texto más grande y legible
    marginLeft: 10, // Espacio entre el icono y el texto
  },
});

export default AppointmentModal;
