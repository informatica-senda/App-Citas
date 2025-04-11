import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import colors from '@styles/colors.js';
import { useFocusEffect } from '@react-navigation/native';

const LogoutConfirmation = ({onCancel, onLogout }) => {
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
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="No"
        confirmText="Sí"
        confirmButtonColor={colors.RED}
        onCancelPressed={hideAlertHandler}
        onConfirmPressed={confirmLogoutHandler}
        titleStyle={styles.alertTitle}
        messageStyle={styles.alertMessage}
        contentContainerStyle={styles.alertContainer}
        cancelButtonStyle={styles.cancelButton}
        cancelButtonTextStyle={styles.cancelButtonText}
        confirmButtonStyle={styles.confirmButton}
        confirmButtonTextStyle={styles.confirmButtonText}
      />
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
