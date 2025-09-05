import { View, Text, Modal, StyleSheet, TouchableOpacity, Platform } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import Colors from "@styles/colors.js"
import { useResponsive } from "../hooks/use-responsive"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "../../firebaseConfig" // Adjust this import path to your Firebase config

const AppointmentModalAdmin = ({ appointment, visible, onClose, onDelete, onModify }) => {
  const responsive = useResponsive()

  const handleDelete = async () => {
    if (onDelete && appointment?.id) {
      try {
        // Delete from Firebase
        await deleteDoc(doc(db, "dates", appointment.id))
        console.log("Appointment deleted successfully")

        // Call the onDelete callback to update the UI
        onDelete(appointment.id)

        // Close the modal
        onClose()
      } catch (error) {
        console.error("Error deleting appointment: ", error)
        // You could add UI feedback for errors here if needed
      }
    }else{
    }
  }

  if (!appointment) return null

  // Asignar el nombre del encargado según la categoría de la cita
  const encargado = appointment.category === "psychology" ? "Fernando Rodríguez" : "Julieta Murcia"
  const empleado = appointment.employee

  // Formatear la fecha para mostrarla en formato más legible
  const formatDate = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={[styles.overlay, responsive.isDesktop && styles.overlayDesktop]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.modalContainer, responsive.isDesktop && styles.modalContainerDesktop]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header con título y botón de cerrar */}
          <View style={[styles.modalHeader, responsive.isDesktop && styles.modalHeaderDesktop]}>
            <Text style={[styles.modalTitle, responsive.isDesktop && styles.modalTitleDesktop]}>
              Detalles de la Cita
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, responsive.isDesktop && styles.closeButtonDesktop]}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Contenido principal */}
          <View style={[styles.modalContent, responsive.isDesktop && styles.modalContentDesktop]}>
            {/* Título de la cita */}
            <Text style={[styles.appointmentTitle, responsive.isDesktop && styles.appointmentTitleDesktop]}>
              {appointment.title}
            </Text>

            {/* Indicador de categoría */}
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: appointment.category === "psychology" ? Colors.PRIMARYCOLOR : Colors.PRIMARYCOLOR,
                },
                responsive.isDesktop && styles.categoryBadgeDesktop,
              ]}
            >
              <Text style={[styles.categoryText, responsive.isDesktop && styles.categoryTextDesktop]}>
                {appointment.category === "psychology" ? "Psicología" : "Nutrición"}
              </Text>
            </View>

            {/* Información de la cita */}
            <View style={[styles.infoSection, responsive.isDesktop && styles.infoSectionDesktop]}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="account" size={responsive.isDesktop ? 22 : 20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Profesional</Text>
                    <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>{empleado}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="account-tie" size={responsive.isDesktop ? 22 : 20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Encargado</Text>
                    <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>{encargado}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="calendar" size={responsive.isDesktop ? 22 : 20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Fecha</Text>
                    <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                      {formatDate(appointment.date)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="clock-outline" size={responsive.isDesktop ? 22 : 20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Hora</Text>
                    <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                      {appointment.time}
                    </Text>
                  </View>
                </View>
              </View>

              {appointment.phone && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="phone" size={responsive.isDesktop ? 22 : 20} color="#666" />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Teléfono</Text>
                      <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                        {appointment.phone}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Botones de acción */}
          <View style={[styles.actionButtons, responsive.isDesktop && styles.actionButtonsDesktop]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.deleteButton,
                responsive.isDesktop && styles.deleteButtonDesktop,
                { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }, // Add both left and right border radius
              ]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="delete-outline" size={responsive.isDesktop ? 24 : 22} color="#fff" />
              <Text style={[styles.actionButtonText, responsive.isDesktop && styles.actionButtonTextDesktop]}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayDesktop: {
    ...Platform.select({
      web: {
        backdropFilter: "blur(5px)",
      },
    }),
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalContainerDesktop: {
    maxWidth: 480,
    borderRadius: 20,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    transform: "translateY(-20px)",
    transition: "transform 0.3s ease-out",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalHeaderDesktop: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.PRIMARYCOLOR,
  },
  modalTitleDesktop: {
    fontSize: 22,
    letterSpacing: "-0.5px",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonDesktop: {
    padding: 6,
    borderRadius: 20,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "#f3f4f6",
        },
      },
    }),
  },
  modalContent: {
    padding: 20,
  },
  modalContentDesktop: {
    padding: 24,
  },
  appointmentTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  appointmentTitleDesktop: {
    fontSize: 26,
    color: "#1a1a1a",
    marginBottom: 16,
    letterSpacing: "-0.5px",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryBadgeDesktop: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 24,
  },
  categoryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  categoryTextDesktop: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: "0.3px",
  },
  infoSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoSectionDesktop: {
    backgroundColor: "#f5f7fa",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  infoLabelDesktop: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  infoValueDesktop: {
    fontSize: 17,
    color: "#1f2937",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButtonsDesktop: {
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
    borderBottomLeftRadius: 16,
  },
  deleteButtonDesktop: {
    paddingVertical: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20, // Add this line
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "#ff5252",
        },
      },
    }),
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  actionButtonTextDesktop: {
    fontSize: 17,
    letterSpacing: "0.3px",
  },
})

export default AppointmentModalAdmin
