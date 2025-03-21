// Importamos las bibliotecas y componentes necesarios para la aplicación
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import Header from '@components/HeaderAdmin.js'; // Componente de encabezado personalizado
import Colors from '@styles/colors'; // Archivo de estilos con colores predefinidos
import { useNavigation } from '@react-navigation/native'; // Hook para la navegación entre pantallas

/**
 * Componente de la pantalla de ajustes.
 * Permite ver los responsables de las citas, acceder a una guía de uso y cerrar sesión.
 */
const SettingsScreen = ({ navigation }) => {
  // Estado para controlar la visibilidad del modal
  const [modalVisible, setModalVisible] = useState(false);
  // Estado para almacenar el contenido dinámico del modal
  const [modalContent, setModalContent] = useState('');

  /**
   * Función que muestra los responsables de las citas en un modal.
   * - Agrega nombres y correos de los responsables de Psicología y Nutrición.
   */
  const showResponsibles = () => {
    setModalContent(
      <View>
        <Text style={styles.modalTitle}>Responsables de las citas</Text>
        <Text style={styles.modalTextTitle}>Psicología: Fernando Rodriguez</Text>
        <Text style={styles.modalText}>frodriguez@sendagestion.com</Text>
        <Text style={styles.modalTextTitle}>Nutrición: Julieta Murcia</Text>
        <Text style={styles.modalText}>seguimiento@sendagestion.com</Text>
      </View>
    );
    setModalVisible(true);
  };

  /**
   * Función que muestra una guía de uso en un modal con instrucciones sobre cómo utilizar la aplicación.
   */
  const showHelp = () => {
    setModalContent(
      <ScrollView>
        <Text style={styles.modalTitle}>Guía de uso de la aplicación</Text>
        <Text style={styles.modalText}>1. Pantalla de Citas: Aquí puedes ver todas las citas de tus empleados...</Text>
        <Text style={styles.modalText}>2. Pantalla de Empleados: Aquí puedes ver todos los empleados...</Text>
        <Text style={styles.modalText}>3. Pantalla de Ajustes: Aquí puedes ver los responsables de las citas...</Text>
      </ScrollView>
    );
    setModalVisible(true);
  };

  return (
    <>
      {/* Encabezado de la pantalla de Ajustes */}
      <View style={styles.headerCitas}>
        <Header header_text={'Ajustes'} />
      </View>
      
      {/* Botones de opciones dentro de la pantalla de Ajustes */}
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={showResponsibles}>
          <Text style={styles.buttonText}>Ver Responsables</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={showHelp}>
          <Text style={styles.buttonText}>Ayuda</Text>
        </TouchableOpacity>
      </View>
      
      {/* Botón para cerrar sesión */}
      <View style={styles.cerrarSesion}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => { navigation.navigate('LoginScreen'); }}>
          <Text style={styles.buttonTextCerrarSesion}>Cerrar Sesión</Text>
        </TouchableOpacity>
        
        {/* Modal para mostrar información dinámica */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {modalContent}
              <TouchableOpacity
                style={styles.buttonClose}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonTextCerrarSesion}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

// Estilos para la pantalla de Ajustes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  cerrarSesion: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  headerCitas: {
    paddingTop: '10%',
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  button: {
    backgroundColor: Colors.BACKGROUND,
    paddingVertical: 15,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.PRIMARYCOLOR,
    marginTop: 40,
  },
  buttonText: {
    color: Colors.PRIMARYCOLOR,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonTextCerrarSesion: {
    color: Colors.TEXTWHITE,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 50,
    marginBottom: 20,
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
    padding: 35,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.PRIMARYCOLOR,
  },
  modalTextTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    color: Colors.TEXT,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    color: Colors.TEXT,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
});

export default SettingsScreen;