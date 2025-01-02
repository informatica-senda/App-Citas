import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import Header from '@components/HeaderAdmin.js'
import Colors from '@styles/colors';
import { useNavigation } from '@react-navigation/native';


const SettingsScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');

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

  const showHelp = () => {
    setModalContent(
      <ScrollView>
        <Text style={styles.modalTitle}>Guía de uso de la aplicación</Text>
        <Text style={styles.modalText}>
          1. Pantalla de Citas: Aquí puedes ver todas las citas de tus empleados. Usa los filtros en la parte superior para ver citas de Psicología o Nutrición. Usa la barra de búsqueda para encontrar citas por nombre de empleado o cliente.
        </Text>
        <Text style={styles.modalText}>
          2. Pantalla de Empleados: Aquí puedes ver todos los empleados. Usa la barra de búsqueda para encontrar empleados por nombre o código. Puedes añadir nuevos empleados usando el botón "Añadir Empleado".
        </Text>
        <Text style={styles.modalText}>
          3. Pantalla de Ajustes: Aquí puedes ver los responsables de las citas, acceder a esta guía de ayuda y cerrar sesión.
        </Text>
      </ScrollView>
    );
    setModalVisible(true);
  };

  return (
    <>
      <View style={styles.headerCitas}>
        <Header header_text={'Ajustes'} />
      </View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={showResponsibles}>
          <Text style={styles.buttonText}>Ver Responsables</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={showHelp}>
          <Text style={styles.buttonText}>Ayuda</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cerrarSesion}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => { navigation.navigate('LoginScreen'); }}>
          <Text style={styles.buttonTextCerrarSesion}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
      backgroundColor: Colors.PRIMARYCOLOR,  // Color de fondo para Citas
    },
    button: {
      backgroundColor: Colors.BACKGROUND,
      paddingVertical: 15,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: Colors.PRIMARYCOLOR,
      marginTop: 40,
      Color: '#000',
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
      Color: '#000',
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
      alignItems: 'flex-start',  // Alinea todo el contenido al inicio para mejorar la presentación
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: '80%',  // Ajusta el ancho del modal para mejor presentación en dispositivos más pequeños
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 15,
      color: Colors.PRIMARYCOLOR,  // Resalta el título con un color primario
    },
    modalTextTitle: {
      fontSize: 18,
      marginBottom: 8,
      fontWeight: 'bold',
      color: Colors.TEXT,  // Subtítulos en un color sutil pero visible
    },
    modalText: {
      fontSize: 16,
      marginBottom: 12,
      color: Colors.TEXT,  // Mantiene el texto principal en un color legible
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

