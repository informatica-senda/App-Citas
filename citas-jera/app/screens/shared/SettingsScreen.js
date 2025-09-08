// Importamos las bibliotecas y componentes necesarios para la aplicación
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Header from '@components/HeaderAdmin.js'; // Componente de encabezado personalizado
import { useNavigation } from '@react-navigation/native'; // Hook para la navegación entre pantallas
import styles from './SettingsStyles.js';

/**
 * Componente de la pantalla de ajustes.
 * Permite ver los responsables de las citas, acceder a una guía de uso y cerrar sesión.
 */
const SettingsScreen = ({ userRole }) => {
  // Estado para controlar la visibilidad del modal
  const [modalVisible, setModalVisible] = useState(false);
  // Estado para almacenar el contenido dinámico del modal
  const [modalContent, setModalContent] = useState('');

  const [logoutVisible, setLogoutVisible] = useState(false);

  const navigation = useNavigation();

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
    let helpContent;
    if (userRole === 'manager') {
        helpContent = (
            <ScrollView>
                <Text style={styles.modalTitle}>Guía de uso para Managers</Text>
                <Text style={styles.modalText}>1. Pantalla de Citas: Aquí puedes ver todas las citas de tus empleados...</Text>
                <Text style={styles.modalText}>2. Pantalla de Empleados: Aquí puedes ver todos los empleados...</Text>
                <Text style={styles.modalText}>3. Pantalla de Ajustes: Aquí puedes ver los responsables de las citas...</Text>
            </ScrollView>
        );
    } else if (userRole === 'teacher') {
        helpContent = (
            <ScrollView>
                <Text style={styles.modalTitle}>Guía de uso para Profesionales</Text>
                <Text style={styles.modalText}>1. Pantalla de Citas: Aquí puedes ver todas tus citas programadas...</Text>
                <Text style={styles.modalText}>2. Pantalla de Empleados: Aquí puedes ver la información de los usuarios...</Text>
                <Text style={styles.modalText}>3. Pantalla de Ajustes: Aquí puedes ver los responsables y guías...</Text>
            </ScrollView>
        );
    }

    setModalContent(helpContent);
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
        <TouchableOpacity style={styles.logoutButton} onPress={() => {setLogoutVisible(true)}}>
          <Text style={styles.buttonTextCerrarSesion}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Modal para mostrar información dinámica */}
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                {modalContent}
                <TouchableOpacity style={styles.buttonClose} onPress={() => setModalVisible(false)}>
                    <Text>Cerrar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <Modal visible={logoutVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.loadingText}>Deseas salir?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setLogoutVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => navigation.replace('LoginScreen')}>
                <Text style={styles.modalButtonText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SettingsScreen;
