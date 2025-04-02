import { View, Text, Modal, StyleSheet, TouchableOpacity, Linking } from "react-native"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import Colors from "@styles/colors.js"

const AppointmentModal = ({ appointment, visible, onClose }) => {
  // Función para abrir WhatsApp con el número correspondiente
  const handleWhatsAppAccess = () => {
    if (appointment) {
      // Determinar el número de teléfono dependiendo de la categoría
      const phoneNumber = appointment.category === "psychology" ? "+34637645417" : "+34637645418"
      Linking.openURL(`whatsapp://send?phone=${phoneNumber}`).catch(() => {
        alert("Asegúrate de tener WhatsApp instalado en tu dispositivo")
      })
    }
  }

  if (!appointment) return null

  // Asignar el nombre del encargado según la categoría de la cita
  const encargado = appointment.category === "psychology" ? "Fernando Rodríguez" : "Julieta Murcia"
  const phoneNumber = appointment.category === "psychology" ? "+34637645417" : "+34637645418"

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
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}
          onResponderRelease={(e) => e.stopPropagation()}
        >
          {/* Header con título y botón de cerrar */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de la Cita</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Contenido principal */}
          <View style={styles.modalContent}>
            {/* Título de la cita */}
            <Text style={styles.appointmentTitle}>{appointment.title}</Text>

            {/* Indicador de categoría */}
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: appointment.category === "psychology" ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR,
                },
              ]}
            >
              {appointment.category === "psychology" ? (
                <FontAwesome5 name="brain" size={14} color="#fff" style={styles.categoryIcon} />
              ) : (
                <Ionicons name="nutrition-outline" size={16} color="#fff" style={styles.categoryIcon} />
              )}
              <Text style={styles.categoryText}>
                {appointment.category === "psychology" ? "Psicología" : "Nutrición"}
              </Text>
            </View>

            {/* Información de la cita */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Fecha</Text>
                    <Text style={styles.infoValue}>{formatDate(appointment.date)}</Text>
                  </View>
                </View>
              </View>

              {appointment.time && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Hora</Text>
                      <Text style={styles.infoValue}>{appointment.time}</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="account-tie" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Profesional</Text>
                    <Text style={styles.infoValue}>{encargado}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="phone" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>{phoneNumber}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Nota informativa */}
            <View style={styles.noteContainer}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.noteText}>Puedes contactar con tu profesional a través de WhatsApp.</Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.whatsappButton,
                { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
              ]}
              onPress={handleWhatsAppAccess}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>WhatsApp</Text>
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.PRIMARYCOLOR,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  appointmentTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
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
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    borderBottomRightRadius: 16,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
})

export default AppointmentModal

