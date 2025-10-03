"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import Colors from "@styles/colors"
import { useResponsive } from "../../hooks/use-responsive"
import { db } from "../../../firebaseConfig.js"
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { auth } from "../../../firebaseConfig"

// Botones de "Ver Citas Confirmadas" eliminados

const EmployeeDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const responsive = useResponsive()
  const isWeb = Platform.OS === "web"

  const { employee } = route.params || {
    // Valores por defecto en caso de que no se pasen parÃƒÂ¡metros
    employee: {
      name: "Empleado",
      code: "EMP000",
      phone: "No disponible",
      role: "No asignado",
      email: "No disponible",
      department: "No asignado",
      startDate: "No disponible",
    },
  }

  const { company } = route.params || {
    // Valores por defecto en caso de que no se pasen parÃƒÂ¡metros
    employee: {
      name: "Empresa Demo",
      code: "DEMO25",
      phone: "No disponible",
      role: "No asignado",
      email: "No disponible",
      department: "No asignado",
      startDate: "No disponible",
      address: "No disponible",
    },
  }

  const [employeeData, setEmployeeData] = useState(employee)
  const [companyData, setCompanyData] = useState(company)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [authUser, setAuthUser] = useState(null)

  // Cargar datos adicionales del empleado si es necesario
  useEffect(() => {
    const fetchAdditionalData = async () => {
      // Si ya tenemos todos los datos necesarios, no hacemos otra consulta
      if (employee.rawData) {
        return
      }

      // Si tenemos el ID del empleado pero necesitamos mÃƒÂ¡s datos
      if (employee.id) {
        setIsLoading(true)
        try {
          const companyDocRef = doc(db, "companies", employee.companyId)
          const companyDocSnap = await getDoc(companyDocRef)
          const employeeDocRef = doc(db, "users", employee.id)
          const employeeDocSnap = await getDoc(employeeDocRef)

          if (employeeDocSnap.exists()&& companyDocSnap.exists()) {
            const data = employeeDocSnap.data()
            const companyData = companyDocSnap.data()
            consoleq.log("Company Data:", companyData)
            setEmployeeData({
              ...employee,
              email: data.email || "No disponible",
              dni: data.dni || "No disponible",
              department: data.department || "No asignado",
              startDate: data.startDate || "No disponible",
              address: companyData.address || "No disponible",
              subject: data.subject || "No asignado",
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

  // Fetch authenticated user data
  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const user = auth.currentUser
        if (user) {
          const userDocRef = doc(db, "users", user.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            setAuthUser(userData)
          }
        }
      } catch (err) {
        console.error("Error fetching authenticated user:", err)
      }
    }

    fetchAuthUser()
  }, [])

  // Fetch confirmed appointments for this employee
  

  

  // FunciÃƒÂ³n para manejar el botÃƒÂ³n de volver atrÃƒÂ¡s
  const handleGoBack = () => {
    navigation.goBack()
  }

  // Eliminado: manejador para abrir el modal de citas confirmadas

  // Render the employee information section consistently across all views
  const renderEmployeeInfoSection = () => (
    <View style={[styles.infoSection, responsive.isDesktop && styles.infoSectionDesktop]}>
      <Text style={[styles.sectionTitle, responsive.isDesktop && styles.sectionTitleDesktop]}>
        Información de Contacto
      </Text>

      <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
          <MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Telefono</Text>
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
    </View>
  )

  

  // Eliminado: secciÃƒÂ³n de botÃƒÂ³n para ver citas confirmadas

  // For web platform in desktop mode, render a simplified view that matches the screenshot
  if (isWeb && responsive.isDesktop) {
    return (
      <View style={styles.webDesktopContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
            <Text style={styles.loadingText}>Cargando informaciÃƒÂ³n...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
              <Text style={styles.retryButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.webDesktopScrollView}>
            {/* Profile Header */}
            <View style={styles.webProfileHeader}>
              <View style={styles.webAvatarContainer}>
                <Text style={styles.webAvatarText}>
                  {employeeData.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.webProfileInfo}>
                <Text style={styles.webEmployeeName}>{employeeData.name}</Text>
                <Text style={styles.webEmployeeRole}>{employeeData.role}</Text>
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.webSection}>
              <Text style={styles.webSectionTitle}>InformaciÃƒÂ³n de contacto</Text>

              <View style={styles.webInfoRow}>
                <MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.webInfoText}>{employeeData.phone}</Text>
              </View>

              <View style={styles.webInfoRow}>
                <MaterialIcons name="email" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.webInfoText}>{employeeData.email || "No disponible"}</Text>
              </View>

              <View style={styles.webInfoRow}>
                <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.webInfoText}>DNI: {employeeData.dni || "No disponible"}</Text>
              </View>
            </View>

            {/* Job Information */}
            <View style={styles.webSection}>
              <Text style={styles.webSectionTitle}>InformaciÃƒÂ³n laboral</Text>

              <View style={styles.webInfoRow}>
                <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.webInfoText}>CÃƒÂ³digo: {employeeData.code}</Text>
              </View>

              <View style={styles.webInfoRow}>
                <MaterialIcons name="work" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.webInfoText}>Cargo: {employeeData.role}</Text>
              </View>

              {employeeData.subject && (
                <View style={styles.webInfoRow}>
                  <MaterialIcons name="school" size={20} color={Colors.PRIMARYCOLOR} />
                  <Text style={styles.webInfoText}>
                    Especialidad:{" "}
                    {employeeData.subject === "psychology"
                      ? "PsicologÃƒÂ­a"
                      : employeeData.subject === "nutrition"
                        ? "NutriciÃƒÂ³n"
                        : employeeData.subject}
                  </Text>
                </View>
              )}

              {authUser && (
                <>
                  <View style={styles.webInfoRow}>
                    <MaterialIcons name="person" size={20} color={Colors.PRIMARYCOLOR} />
                    <Text style={styles.webInfoText}>Tu Rol: {authUser.role || "No asignado"}</Text>
                  </View>

                  {authUser.subject && (
                    <View style={styles.webInfoRow}>
                      <MaterialIcons name="school" size={20} color={Colors.PRIMARYCOLOR} />
                      <Text style={styles.webInfoText}>
                        Tu Especialidad:{" "}
                        {authUser.subject === "psychology"
                          ? "PsicologÃƒÂ­a"
                          : authUser.subject === "nutrition"
                            ? "NutriciÃƒÂ³n"
                            : authUser.subject}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            
          </ScrollView>
        )}

        

              
      </View>
    )
  }
  return (
    <View style={[styles.container, responsive.isWeb && { height: "100vh" }]}>
      <StatusBar backgroundColor={Colors.PRIMARYCOLOR} barStyle="light-content" />

      {/* Encabezado con botÃƒÂ³n de volver */}
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
          <Text style={styles.loadingText}>Cargando informaciÃƒÂ³n...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Layout para mÃƒÂ³vil - una columna con scroll
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, responsive.isWeb && { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* SecciÃƒÂ³n de perfil */}
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
          </View>

          {/* SecciÃƒÂ³n de informaciÃƒÂ³n */}
          {renderEmployeeInfoSection()}

          
          
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
  desktopScrollView: {
    flex: 1,
  },
  desktopContainer: {
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
  // Estilos para mÃƒÂ³vil
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
  // Web-specific styles for the desktop split-screen layout
  webDesktopContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    height: "100%",
  },
  webDesktopScrollView: {
    flex: 1,
    padding: 20,
  },
  webProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  webAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PRIMARYCOLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  webAvatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  webProfileInfo: {
    flex: 1,
  },
  webEmployeeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  webEmployeeRole: {
    fontSize: 16,
    color: "#666666",
  },
  webSection: {
    marginBottom: 30,
    borderBottom: "1px solid #EEEEEE",
    paddingBottom: 20,
  },
  webSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  webInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  webInfoText: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
  },
  // Web-specific styles for the desktop split-screen layout
  webDesktopContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    height: "100%",
  },
  webDesktopScrollView: {
    flex: 1,
    padding: 20,
  },
  webProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  webAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PRIMARYCOLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  webAvatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  webProfileInfo: {
    flex: 1,
  },
  webEmployeeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  webEmployeeRole: {
    fontSize: 16,
    color: "#666666",
  },
  webSection: {
    marginBottom: 30,
    borderBottom: "1px solid #EEEEEE",
    paddingBottom: 20,
  },
  webSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  webInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  webInfoText: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
  },
})

export default EmployeeDetailScreen
