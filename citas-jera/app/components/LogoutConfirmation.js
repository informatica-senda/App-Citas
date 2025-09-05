import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Dialog from 'react-native-dialog';
import colors from '@styles/colors.js';
import { useFocusEffect } from '@react-navigation/native';

const LogoutConfirmation = ({ onCancel, onLogout }) => {
  const [showAlert, setShowAlert] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setShowAlert(true); // Mostrar el modal cada vez que el usuario entra a la pestaña "Exit"
      return () => setShowAlert(false); // Asegurar que se reinicia al salir
    }, [])
  );

  const hideAlertHandler = () => {
    setShowAlert(false);
    onCancel(); // Regresar a la pantalla anterior
  };

  const confirmLogoutHandler = () => {
    hideAlertHandler();
    onLogout(); // Llama a la función de cierre de sesión
  };

  return (
    <View style={styles.container}>
      <Dialog.Container visible={showAlert}
        onBackdropPress={hideAlertHandler}>
        <Dialog.Title style={styles.alertTitle}>Cerrar Sesión</Dialog.Title>
        <Dialog.Description style={styles.alertMessage}>
          ¿Estás seguro de que deseas cerrar sesión?
        </Dialog.Description>

        <Dialog.Button label="No"
          onPress={hideAlertHandler}
          style={styles.cancelButtonText} />

        <Dialog.Button label="Sí"
          onPress={confirmLogoutHandler}
          style={styles.confirmButtonText}
          color={colors.RED} />
      </Dialog.Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  alertContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 25,
  },
  alertTitle: {
    fontSize: 20,
    color: colors.DARKGREY,
  },
  alertMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.RED,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default LogoutConfirmation;
