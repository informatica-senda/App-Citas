"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from "react-native"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import Colors from "@styles/colors"
import { useResponsive } from "../../hooks/use-responsive"
import { db } from "../../../firebaseConfig.js"
import { doc, getDoc } from "firebase/firestore"

const EmployeeDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const responsive = useResponsive()

  const { employee } = route.params || {
    // Valores por defecto en caso de que no se pasen parámetros
    employee: {
      name: "Empleado",
      code: "EMP000",
      phone: "No disponible",
      role: "No asignado",
      email: "No disponible",
      department: "No asignado",
      startDate: "No disponible",
      address: "No disponible",
    },
  }

  const [employeeData, setEmployeeData] = useState(employee)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar datos adicionales del empleado si es necesario
  useEffect(() => {
    const fetchAdditionalData = async () => {
      // Si ya tenemos todos los datos necesarios, no hacemos otra consulta
      if (employee.rawData) {
        return
      }

      // Si tenemos el ID del empleado pero necesitamos más datos
      if (employee.id) {
        setIsLoading(true)
        try {
          const employeeDocRef = doc(db, "users", employee.id)
          const employeeDocSnap = await getDoc(employeeDocRef)

          if (employeeDocSnap.exists()) {
            const data = employeeDocSnap.data()
            setEmployeeData({
              ...employee,
              email: data.email || "No disponible",
              dni: data.dni || "No disponible",
              department: data.department || "No asignado",
              startDate: data.startDate || "No disponible",
              address: data.address || "No disponible",
              rawData: data,
            })
          }
        } catch (err) {
          console.error("Error fetching employee details:", err)
          setError("Error al cargar los detalles del empleado")
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchAdditionalData()
  }, [employee])

  // Función para manejar el botón de volver atrás
  const handleGoBack = () => {
    navigation.goBack()
  }

  // Modificar el componente View principal para aplicar estilos condicionales
  return (
    <View style={[styles.container, responsive.isWeb && { height: "100vh" }]}>
      <StatusBar backgroundColor={Colors.PRIMARYCOLOR} barStyle="light-content" />

      {/* Encabezado con botón de volver */}
      <View style={[styles.header, responsive.isDesktop && styles.headerDesktop]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Empleado</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : responsive.isDesktop ? (
        // Layout para desktop - dos columnas
        <View style={styles.desktopContainer}>
          {/* Columna izquierda - Perfil e información de contacto */}
          <View style={styles.desktopLeftColumn}>
            {/* Sección de perfil */}
            <View style={[styles.profileSection, styles.profileSectionDesktop]}>
              <View style={[styles.avatarLarge, styles.avatarLargeDesktop]}>
                <Text style={[styles.avatarLargeText, styles.avatarLargeTextDesktop]}>
                  {employeeData.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </Text>
              </View>
              <Text style={[styles.employeeName, styles.employeeNameDesktop]}>{employeeData.name}</Text>
              <Text style={[styles.employeeRole, styles.employeeRoleDesktop]}>{employeeData.role}</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{employeeData.code}</Text>
              </View>
            </View>

            {/* Sección de información de contacto */}
            <View style={[styles.infoSection, styles.infoSectionDesktop]}>
              <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>Información de Contacto</Text>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{employeeData.phone}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="email" size={20} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{employeeData.email || "No disponible"}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>DNI</Text>
                  <Text style={styles.infoValue}>{employeeData.dni || "No disponible"}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="location-on" size={20} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{employeeData.address || "No disponible"}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Columna derecha - Detalles laborales */}
          <View style={styles.desktopRightColumn}>
            {/* Sección de detalles laborales */}
            <View style={[styles.infoSection, styles.infoSectionDesktop]}>
              <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>Detalles Laborales</Text>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="business" size={20} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Departamento</Text>
                  <Text style={styles.infoValue}>{employeeData.department || "No asignado"}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="date-range" size={20} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Fecha de Inicio</Text>
                  <Text style={styles.infoValue}>{employeeData.startDate || "No disponible"}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="work" size={20} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Cargo</Text>
                  <Text style={styles.infoValue}>{employeeData.role}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Código de Empleado</Text>
                  <Text style={styles.infoValue}>{employeeData.code}</Text>
                </View>
              </View>
            </View>

            {/* Sección de historial (ejemplo adicional para desktop) */}
            <View style={[styles.infoSection, styles.infoSectionDesktop]}>
              <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>Historial</Text>

              <View style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>ENE 2023</Text>
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>Incorporación a la empresa</Text>
                  <Text style={styles.historyDescription}>Se unió al equipo como {employeeData.role}</Text>
                </View>
              </View>

              <View style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>MAR 2023</Text>
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>Capacitación completada</Text>
                  <Text style={styles.historyDescription}>Completó el programa de capacitación inicial</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : (
        // Layout para móvil - una columna con scroll
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, responsive.isWeb && { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Sección de perfil */}
          <View style={styles.profileSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {employeeData.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </Text>
            </View>
            <Text style={styles.employeeName}>{employeeData.name}</Text>
            <Text style={styles.employeeRole}>{employeeData.role}</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{employeeData.code}</Text>
            </View>
          </View>

          {/* Sección de información */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{employeeData.phone}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="email" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{employeeData.email || "No disponible"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>DNI</Text>
                <Text style={styles.infoValue}>{employeeData.dni || "No disponible"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="location-on" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{employeeData.address || "No disponible"}</Text>
              </View>
            </View>
          </View>

          {/* Sección de detalles laborales */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Detalles Laborales</Text>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="business" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Departamento</Text>
                <Text style={styles.infoValue}>{employeeData.department || "No asignado"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="date-range" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de Inicio</Text>
                <Text style={styles.infoValue}>{employeeData.startDate || "No disponible"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="work" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cargo</Text>
                <Text style={styles.infoValue}>{employeeData.role}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Código de Empleado</Text>
                <Text style={styles.infoValue}>{employeeData.code}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerDesktop: {
    paddingTop: 16,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Estilos para desktop
  desktopContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 24,
    backgroundColor: "#f8f9fa",
  },
  desktopLeftColumn: {
    width: "35%",
    marginRight: 24,
  },
  desktopRightColumn: {
    flex: 1,
  },
  // Estilos para móvil
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileSectionDesktop: {
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.PRIMARYCOLOR,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLargeDesktop: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  avatarLargeText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  avatarLargeTextDesktop: {
    fontSize: 42,
  },
  employeeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  employeeNameDesktop: {
    fontSize: 28,
    marginBottom: 6,
  },
  employeeRole: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  employeeRoleDesktop: {
    fontSize: 18,
    marginBottom: 16,
  },
  codeContainer: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  codeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoSectionDesktop: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 24,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  sectionTitleDesktop: {
    fontSize: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
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
  // Estilos para historial (solo desktop)
  historyItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyDate: {
    width: 80,
    marginRight: 16,
  },
  historyDateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.PRIMARYCOLOR,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  historyDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  // Estilos para estados de carga y error
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    marginTop: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollViewContent: {
    paddingBottom: 50,
    flexGrow: 1,
  },
})

export default EmployeeDetailScreen
