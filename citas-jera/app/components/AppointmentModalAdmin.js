import { View, Text, Modal, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@styles/colors.js";
import { useResponsive } from "../hooks/use-responsive";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";

const AppointmentModalAdmin = ({ appointment, visible, onClose, onDelete, viewerRole }) => {
  const responsive = useResponsive();

  const [clientPhone, setClientPhone] = useState(null);
  const [employeePhone, setEmployeePhone] = useState(null);
  const [clientName, setClientName] = useState(null);
  const [employeeName, setEmployeeName] = useState(null);
  const [companyName, setCompanyName] = useState(null);

  // Fallbacks: si no llegan datos desde el padre, resuélvelos por ids
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!appointment) return;

      setClientName(appointment.client ?? null);
      setEmployeeName(appointment.employee ?? null);
      setClientPhone(appointment.clientPhone ?? appointment.phone ?? null);
      setEmployeePhone(appointment.employeePhone ?? null);

      try {
        // Cliente
        if ((!appointment.client || !appointment.clientPhone) && appointment.userId) {
          const uref = doc(db, "users", appointment.userId);
          const usnap = await getDoc(uref);
          if (!cancelled && usnap.exists()) {
            const u = usnap.data();
            if (!appointment.client) {
              const name = `${u.name || ""} ${u.lastName || ""}`.trim() || null;
              setClientName((prev) => prev ?? name);
            }
            if (!appointment.clientPhone && !appointment.phone) {
              setClientPhone((prev) => prev ?? (u.phone || null));
            }
          }
        }
        // Profesional
        if ((!appointment.employee || !appointment.employeePhone) && appointment.teacherId) {
          const tref = doc(db, "users", appointment.teacherId);
          const tsnap = await getDoc(tref);
          if (!cancelled && tsnap.exists()) {
            const t = tsnap.data();
            if (!appointment.employee) {
              const name = `${t.name || ""} ${t.lastName || ""}`.trim() || null;
              setEmployeeName((prev) => prev ?? name);
            }
            if (!appointment.employeePhone) {
              setEmployeePhone((prev) => prev ?? (t.phone || null));
            }
          }
        }
        // Empresa
        if (appointment.companyId) {
          const cref = doc(db, "companies", appointment.companyId);
          const csnap = await getDoc(cref);
          if (!cancelled && csnap.exists()) {
            const c = csnap.data();
            setCompanyName(c?.name ?? null);
          } else {
            setCompanyName((prev) => prev ?? null);
          }
        } else {
          setCompanyName(null);
        }
      } catch (e) {
        console.warn("ModalAdmin fallback fetch error:", e);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [appointment?.id, appointment?.userId, appointment?.teacherId, appointment?.companyId]);

  const handleDelete = async () => {
    if (onDelete && appointment?.id) {
      try {
        await deleteDoc(doc(db, "dates", appointment.id));
        onDelete(appointment.id);
        onClose();
      } catch (error) {
        console.error("Error deleting appointment: ", error);
      }
    }
  };

  if (!visible) return null;
  if (!appointment) return null;

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Sin fecha") return "Sin fecha";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  const categoryLabel = appointment.category === "psychology" ? "Psicología" : "Nutrición";
  const isTeacherView = viewerRole === "teacher";

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <TouchableOpacity
        style={[styles.overlay, responsive.isDesktop && styles.overlayDesktop]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.modalContainer, responsive.isDesktop && styles.modalContainerDesktop]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={[styles.modalHeader, responsive.isDesktop && styles.modalHeaderDesktop]}>
            <Text style={[styles.modalTitle, responsive.isDesktop && styles.modalTitleDesktop]}>Detalles de la Cita</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, responsive.isDesktop && styles.closeButtonDesktop]}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <View style={[styles.modalContent, responsive.isDesktop && styles.modalContentDesktop]}>
            <Text style={[styles.appointmentTitle, responsive.isDesktop && styles.appointmentTitleDesktop]}>
              {appointment.title ?? `Cita de ${categoryLabel}`}
            </Text>

            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: Colors.PRIMARYCOLOR },
                responsive.isDesktop && styles.categoryBadgeDesktop,
              ]}
            >
              <Text style={[styles.categoryText, responsive.isDesktop && styles.categoryTextDesktop]}>
                {categoryLabel}
              </Text>
            </View>

            <View style={[styles.infoSection, responsive.isDesktop && styles.infoSectionDesktop]}>
              {isTeacherView ? (
                // ===== Vista TEACHER =====
                <>
                  {/* Cliente */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="account" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Cliente</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {clientName ?? "No especificado"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Teléfono cliente */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="phone" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Teléfono cliente</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {clientPhone ?? "No disponible"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Empresa */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="office-building" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Empresa</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {companyName ?? "No asignada"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Fecha */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="calendar" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Fecha</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {appointment.date ? formatDate(appointment.date) : "No asignada"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Hora */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="clock-outline" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Hora</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {appointment.time || "Sin hora"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                // ===== Vista MANAGER (tal y como la tenías)
                <>
                  {/* Cliente */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="account" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Cliente</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {clientName ?? "No especificado"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Profesional */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="account-tie" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Profesional</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {employeeName ?? "Sin asignar"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Teléfono cliente */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="phone" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Teléfono cliente</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {clientPhone ?? "No disponible"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Teléfono profesional */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="phone-in-talk" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Teléfono profesional</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {employeePhone ?? "No disponible"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Fecha */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="calendar" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Fecha</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {appointment.date ? formatDate(appointment.date) : "No asignada"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Hora */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="clock-outline" size={responsive.isDesktop ? 22 : 20} color="#666" />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, responsive.isDesktop && styles.infoLabelDesktop]}>Hora</Text>
                        <Text style={[styles.infoValue, responsive.isDesktop && styles.infoValueDesktop]}>
                          {appointment.time || "Sin hora"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Acciones */}
          <View style={[styles.actionButtons, responsive.isDesktop && styles.actionButtonsDesktop]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.deleteButton,
                responsive.isDesktop && styles.deleteButtonDesktop,
                { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
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
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", alignItems: "center" },
  overlayDesktop: Platform.select({ web: { backdropFilter: "blur(5px)" }, default: {} }),
  modalContainer: {
    width: "90%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 10,
  },
  modalContainerDesktop: {
    maxWidth: 480, borderRadius: 20,
    transform: [{ translateY: -20 }],
    ...(Platform.OS === "web" ? { boxShadow: "0 10px 25px rgba(0,0,0,0.2)", transition: "transform 0.3s ease-out" } : {}),
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  modalHeaderDesktop: { paddingVertical: 20, paddingHorizontal: 24, borderBottomColor: "#f0f0f0" },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: Colors.PRIMARYCOLOR },
  modalTitleDesktop: { fontSize: 22, letterSpacing: -0.5 },
  closeButton: { padding: 4 },
  closeButtonDesktop: Platform.select({
    web: { padding: 6, borderRadius: 20, cursor: "pointer", transition: "all 0.2s ease" },
    default: { padding: 6, borderRadius: 20 },
  }),
  modalContent: { padding: 20 },
  modalContentDesktop: { padding: 24 },
  appointmentTitle: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 12 },
  appointmentTitleDesktop: { fontSize: 26, color: "#1a1a1a", marginBottom: 16, letterSpacing: -0.5 },
  categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  categoryBadgeDesktop: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, marginBottom: 24,
    ...(Platform.OS === "web" ? { boxShadow: "0 2px 4px rgba(0,0,0,0.05)" } : {}),
  },
  categoryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  categoryTextDesktop: { fontSize: 15, fontWeight: "500", letterSpacing: 0.3 },
  infoSection: { backgroundColor: "#f9f9f9", borderRadius: 12, padding: 16, marginBottom: 8 },
  infoSectionDesktop: {
    backgroundColor: "#f5f7fa", borderRadius: 14, padding: 20, marginBottom: 16,
    ...(Platform.OS === "web" ? { boxShadow: "0 2px 4px rgba(0,0,0,0.05)" } : {}),
  },
  infoRow: { marginBottom: 16 },
  infoItem: { flexDirection: "row", alignItems: "flex-start" },
  infoTextContainer: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 14, color: "#666", marginBottom: 2 },
  infoLabelDesktop: { fontSize: 15, color: "#4b5563", marginBottom: 4 },
  infoValue: { fontSize: 16, color: "#333", fontWeight: "500" },
  infoValueDesktop: { fontSize: 17, color: "#1f2937", fontWeight: "600" },
  actionButtons: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#eee" },
  actionButtonsDesktop: { borderTopColor: "#f0f0f0" },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  deleteButton: { backgroundColor: "#ff6b6b", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  deleteButtonDesktop: Platform.select({
    web: { paddingVertical: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, transition: "all 0.2s ease" },
    default: { paddingVertical: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  }),
  actionButtonText: { color: "#fff", fontWeight: "600", fontSize: 16, marginLeft: 8 },
  actionButtonTextDesktop: { fontSize: 17, letterSpacing: 0.3 },
});

export default AppointmentModalAdmin;
