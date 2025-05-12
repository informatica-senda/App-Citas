import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import Colors from "@styles/colors"

const ConfirmationModal = ({ visible, request, onClose, onConfirm, onDeny }) => {
  if (!request) return null

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Solicitud Confirmada</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={60} color={Colors.PRIMARYCOLOR} />
            </View>

            <Text style={styles.confirmationText}>La solicitud ha sido aceptada exitosamente</Text>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Información del paciente</Text>
              <View style={styles.detailsItem}>
                <MaterialIcons name="person" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.detailsItemText}>{request.name}</Text>
              </View>
              <View style={styles.detailsItem}>
                <MaterialIcons name="email" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.detailsItemText}>{request.email}</Text>
              </View>
              <View style={styles.detailsItem}>
                <MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.detailsItemText}>{request.phone}</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Información de la solicitud</Text>
              <View style={styles.detailsItem}>
                <MaterialIcons name="medical-services" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.detailsItemText}>Servicio: {request.service}</Text>
              </View>
              <View style={styles.detailsItem}>
                <MaterialIcons name="event" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.detailsItemText}>
                  Fecha de solicitud: {new Date(request.date).toLocaleDateString()} a las{" "}
                  {new Date(request.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    width: "90%",
    maxWidth: 500,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
    maxHeight: "80%",
  },
  successIcon: {
    alignItems: "center",
    marginVertical: 20,
  },
  confirmationText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: Colors.TEXTCOLOR,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    borderBottom: "1px solid #eee",
    paddingBottom: 8,
  },
  detailsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailsItemText: {
    fontSize: 15,
    color: "#555",
    marginLeft: 12,
  },
  doneButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default ConfirmationModal
