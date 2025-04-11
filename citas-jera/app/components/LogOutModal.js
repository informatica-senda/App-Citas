import { View, StyleSheet, Text, Modal, TouchableOpacity, ActivityIndicator, Platform } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Colors from "@styles/colors"
import { useResponsive } from "../hooks/use-responsive"

// Componente para el modal de cierre de sesión
const LogoutModal = ({ visible, onCancel, onConfirm, isLoggingOut }) => {
  const responsive = useResponsive()

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, responsive.isDesktop && styles.modalViewDesktop]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="logout" size={responsive.isDesktop ? 60 : 50} color={Colors.PRIMARYCOLOR} />
          </View>

          <Text style={[styles.modalTitle, responsive.isDesktop && styles.modalTitleDesktop]}>Cerrar Sesión</Text>

          <Text style={[styles.modalText, responsive.isDesktop && styles.modalTextDesktop]}>
            ¿Estás seguro que deseas cerrar sesión?
          </Text>

          <View style={[styles.modalButtons, responsive.isDesktop && styles.modalButtonsDesktop]}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel, responsive.isDesktop && styles.buttonCancelDesktop]}
              onPress={onCancel}
              disabled={isLoggingOut}
            >
              <Text style={[styles.buttonCancelText, responsive.isDesktop && styles.buttonTextDesktop]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonConfirm, responsive.isDesktop && styles.buttonConfirmDesktop]}
              onPress={onConfirm}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.buttonConfirmText, responsive.isDesktop && styles.buttonTextDesktop]}>
                  Confirmar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    ...Platform.select({
      web: {
        backdropFilter: "blur(5px)",
      },
    }),
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewDesktop: {
    padding: 32,
    borderRadius: 24,
    maxWidth: 450,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    transform: "translateY(-20px)",
    transition: "transform 0.3s ease-out",
  },
  iconContainer: {
    backgroundColor: "rgba(22, 107, 255, 0.1)",
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      web: {
        transition: "all 0.2s ease",
        transform: "scale(1)",
        ":hover": {
          transform: "scale(1.05)",
        },
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  modalTitleDesktop: {
    fontSize: 24,
    marginBottom: 16,
    color: "#1a1a1a",
    letterSpacing: "-0.5px",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  modalTextDesktop: {
    fontSize: 17,
    lineHeight: 26,
    color: "#4b5563",
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButtonsDesktop: {
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    minWidth: "45%",
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonCancelDesktop: {
    padding: 14,
    borderRadius: 10,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#f3f4f6",
      borderColor: "#c1c5cb",
    },
  },
  buttonConfirm: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  buttonConfirmDesktop: {
    padding: 14,
    borderRadius: 10,
    boxShadow: "0 2px 5px rgba(22, 107, 255, 0.3)",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#0055e6",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(22, 107, 255, 0.4)",
    },
  },
  buttonCancelText: {
    color: "#666",
    fontWeight: "bold",
  },
  buttonConfirmText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonTextDesktop: {
    fontSize: 16,
    letterSpacing: "0.3px",
  },
})

export default LogoutModal

