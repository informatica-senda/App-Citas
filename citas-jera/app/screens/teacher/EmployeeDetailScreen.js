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
  Modal,
  FlatList,
  Platform,
} from "react-native"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import Colors from "@styles/colors"
import { useResponsive } from "../../hooks/use-responsive"
import { db } from "../../../firebaseConfig.js"
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { auth } from "../../../firebaseConfig"

// Create a completely separate web-specific component for the appointments button
const WebAppointmentsButton = ({ onPress }) => {
  return (
    <div
      style={{
        marginTop: "20px",
        marginBottom: "20px",
        width: "100%",
      }}
    >
      <button
        onClick={onPress}
        style={{
          backgroundColor: Colors.PRIMARYCOLOR,
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <span style={{ marginRight: "8px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 16L11 18L15 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Ver Citas Confirmadas
      </button>
    </div>
  )
}

// Regular React Native button for mobile
const MobileAppointmentsButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.appointmentsButton} onPress={onPress} activeOpacity={0.8}>
      <MaterialIcons name="event-available" size={20} color="#FFFFFF" style={styles.appointmentsButtonIcon} />
      <Text style={styles.appointmentsButtonText}>Ver Citas Confirmadas</Text>
    </TouchableOpacity>
  )
}

const EmployeeDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const responsive = useResponsive()
  const isWeb = Platform.OS === "web"

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
    },
  }

  const { company } = route.params || {
    // Valores por defecto en caso de que no se pasen parámetros
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
  const [showAppointments, setShowAppointments] = useState(false)
  const [employeeAppointments, setEmployeeAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [appointmentsError, setAppointmentsError] = useState(null)
  const [sortOrder, setSortOrder] = useState("newest")
  const [authUser, setAuthUser] = useState(null)

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
  const fetchEmployeeAppointments = useCallback(() => {
    if (!employeeData.id) return () => {}

    setLoadingAppointments(true)
    setAppointmentsError(null)

    try {
      // Get the current user's role and subject from employeeData, with null checks
      const currentUserRole = authUser?.role || ""
      const currentUserSubject = authUser?.subject || ""
      const currentUser = auth.currentUser
      const userId = currentUser?.uid

      // Base query - filter by teacherId and state
      let appointmentsQuery = query(collection(db, "dates"), where("state", "==", true))

      // Add additional filtering for teachers based on subject
      if (currentUserRole === "teacher") {
        if (currentUserSubject === "psychology") {
          appointmentsQuery = query(
            collection(db, "dates"),
            where("teacherId", "==", userId),
            where("state", "==", true),
            where("service", "==", "psychology"),
            where("userId", "==", employeeData.id),
          )
        } else if (currentUserSubject === "nutrition") {
          appointmentsQuery = query(
            collection(db, "dates"),
            where("teacherId", "==", userId),
            where("state", "==", true),
            where("service", "==", "nutrition"),
            where("userId", "==", employeeData.id),
          )
        }
      }else{
        appointmentsQuery = query(
            collection(db, "dates"),
            where("state", "==", true),
            where("userId", "==", employeeData.id),
          )
      }

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        appointmentsQuery,
        async (snapshot) => {
          const appointmentsData = []

          for (const docSnapshot of snapshot.docs) {
            const appointmentData = docSnapshot.data()

            // Get user details if available
            let userData = {}
            if (appointmentData.userId) {
              const userDocRef = doc(db, "users", appointmentData.userId)
              const userDocSnap = await getDoc(userDocRef)
              userData = userDocSnap.exists() ? userDocSnap.data() : {}
            }

            // Format date and time
            let formattedDate = "Sin fecha"
            let formattedTime = "Sin hora"

            if (appointmentData.date && typeof appointmentData.date.toDate === "function") {
              const dateObj = appointmentData.date.toDate()

              // Format date as dd/mm/yyyy
              const day = String(dateObj.getDate()).padStart(2, "0")
              const month = String(dateObj.getMonth() + 1).padStart(2, "0")
              const year = dateObj.getFullYear()
              formattedDate = `${day}/${month}/${year}`

              // Format time as HH:MM
              const hours = String(dateObj.getHours()).padStart(2, "0")
              const minutes = String(dateObj.getMinutes()).padStart(2, "0")
              formattedTime = `${hours}:${minutes}`
            }

            appointmentsData.push({
              id: docSnapshot.id,
              date: formattedDate,
              time: formattedTime,
              category: appointmentData.service || "",
              title: `Cita de ${appointmentData.service ? appointmentData.service.charAt(0).toUpperCase() + appointmentData.service.slice(1) : "Servicio"}`,
              client: `${userData.name || ""} ${userData.lastName || ""}`.trim() || "Cliente sin nombre",
              phone: userData.phone || "Sin teléfono",
              rawData: appointmentData,
            })
          }

          setEmployeeAppointments(appointmentsData)
          setLoadingAppointments(false)
        },
        (error) => {
          console.error("Error fetching employee appointments:", error)
          setAppointmentsError("Error al cargar las citas del empleado")
          setLoadingAppointments(false)
        },
      )

      return unsubscribe
    } catch (err) {
      console.error("Error setting up appointments listener:", err)
      setAppointmentsError("Error al configurar el listener de citas")
      setLoadingAppointments(false)
      return () => {}
    }
  }, [employeeData.id, authUser])

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
  }

  // Set up and clean up appointments listener when showing appointments
  useEffect(() => {
    let unsubscribe = () => {}

    if (showAppointments && employeeData.id) {
      unsubscribe = fetchEmployeeAppointments()
    }

    return () => {
      unsubscribe()
    }
  }, [showAppointments, employeeData.id, fetchEmployeeAppointments])

  // Función para manejar el botón de volver atrás
  const handleGoBack = () => {
    navigation.goBack()
  }

  // Handle opening appointments modal
  const handleOpenAppointments = () => {
    setShowAppointments(true)
  }

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
  )

  // Render the employee job details section consistently across all views
  const renderEmployeeJobSection = () => (
    <View style={[styles.infoSection, responsive.isDesktop && styles.infoSectionDesktop]}>
      <Text style={[styles.sectionTitle, responsive.isDesktop && styles.sectionTitleDesktop]}>Detalles Laborales</Text>

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

      {employeeData.subject && (
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <MaterialIcons name="school" size={20} color={Colors.PRIMARYCOLOR} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Especialidad</Text>
            <Text style={styles.infoValue}>
              {employeeData.subject === "psychology"
                ? "Psicología"
                : employeeData.subject === "nutrition"
                  ? "Nutrición"
                  : employeeData.subject}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
          <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Código de Empleado</Text>
          <Text style={styles.infoValue}>{employeeData.code}</Text>
        </View>
      </View>

      {authUser && (
        <>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="person" size={20} color={Colors.PRIMARYCOLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tu Rol</Text>
              <Text style={styles.infoValue}>{authUser.role || "No asignado"}</Text>
            </View>
          </View>

          {authUser.subject && (
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="school" size={20} color={Colors.PRIMARYCOLOR} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tu Especialidad</Text>
                <Text style={styles.infoValue}>
                  {authUser.subject === "psychology"
                    ? "Psicología"
                    : authUser.subject === "nutrition"
                      ? "Nutrición"
                      : authUser.subject}
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  )

  // Render the appointments button section consistently across all views
  const renderAppointmentsSection = () => {
    // For web platform, use the web-specific button
    if (isWeb && responsive.isDesktop) {
      return (
        <View style={[styles.infoSection, styles.infoSectionDesktop]}>
          <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>Citas</Text>
          <WebAppointmentsButton onPress={handleOpenAppointments} />
        </View>
      )
    }

    // For mobile or non-desktop web, use the React Native button
    return (
      <View style={[styles.infoSection, responsive.isDesktop && styles.infoSectionDesktop]}>
        <Text style={[styles.sectionTitle, responsive.isDesktop && styles.sectionTitleDesktop]}>Citas</Text>
        <MobileAppointmentsButton onPress={handleOpenAppointments} />
      </View>
    )
  }

  // For web platform in desktop mode, render a simplified view that matches the screenshot
  if (isWeb && responsive.isDesktop) {
    return (
      <View style={styles.webDesktopContainer}>
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
              <Text style={styles.webSectionTitle}>Información de contacto</Text>

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
              <Text style={styles.webSectionTitle}>Información laboral</Text>

              <View style={styles.webInfoRow}>
                <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
                <Text style={styles.webInfoText}>Código: {employeeData.code}</Text>
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
                      ? "Psicología"
                      : employeeData.subject === "nutrition"
                        ? "Nutrición"
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
                          ? "Psicología"
                          : authUser.subject === "nutrition"
                            ? "Nutrición"
                            : authUser.subject}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Appointments Button - Web Specific */}
            <WebAppointmentsButton onPress={handleOpenAppointments} />
          </ScrollView>
        )}

        {/* Modal para mostrar las citas confirmadas */}
        <Modal
          visible={showAppointments}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowAppointments(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Citas Confirmadas</Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowAppointments(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {loadingAppointments ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
                  <Text style={styles.loadingText}>Cargando citas...</Text>
                </View>
              ) : appointmentsError ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
                  <Text style={styles.errorText}>{appointmentsError}</Text>
                </View>
              ) : employeeAppointments.length === 0 ? (
                <View style={styles.emptyAppointmentsContainer}>
                  <MaterialIcons name="event-busy" size={60} color="#CCCCCC" />
                  <Text style={styles.emptyAppointmentsText}>No hay citas confirmadas</Text>
                </View>
              ) : (
                <FlatList
                  data={employeeAppointments.sort((a, b) => {
                    // Convert string dates to Date objects for comparison
                    const dateA = a.date.split("/").reverse().join("-")
                    const dateB = b.date.split("/").reverse().join("-")
                    const timeA = a.time
                    const timeB = b.time

                    const dateTimeA = new Date(`${dateA}T${timeA}`)
                    const dateTimeB = new Date(`${dateB}T${timeB}`)

                    return sortOrder === "newest" ? dateTimeB - dateTimeA : dateTimeA - dateTimeB
                  })}
                  keyExtractor={(item) => item.id}
                  ListHeaderComponent={() => (
                    <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
                      <MaterialIcons
                        name={sortOrder === "newest" ? "arrow-downward" : "arrow-upward"}
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.sortButtonText}>
                        {sortOrder === "newest" ? "Más recientes primero" : "Más antiguas primero"}
                      </Text>
                    </TouchableOpacity>
                  )}
                  renderItem={({ item }) => (
                    <View style={styles.appointmentItem}>
                      <View style={styles.appointmentHeader}>
                        <Text style={styles.appointmentTitle}>{item.title}</Text>
                        <View
                          style={[
                            styles.categoryBadge,
                            item.category === "psychology" ? styles.psychologyBadge : styles.nutritionBadge,
                          ]}
                        >
                          <Text style={styles.categoryText}>
                            {item.category === "psychology" ? "Psicología" : "Nutrición"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.appointmentDetail}>
                        <MaterialIcons name="access-time" size={16} color="#666" />
                        <Text style={styles.appointmentDetailText}>
                          {item.date} - {item.time}
                        </Text>
                      </View>

                      <View style={styles.appointmentDetail}>
                        <MaterialIcons name="person" size={16} color="#666" />
                        <Text style={styles.appointmentDetailText}>{item.client}</Text>
                      </View>

                      <View style={styles.appointmentDetail}>
                        <MaterialIcons name="phone" size={16} color="#666" />
                        <Text style={styles.appointmentDetailText}>{item.phone}</Text>
                      </View>
                    </View>
                  )}
                  contentContainerStyle={styles.appointmentsList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    )
  }

  // For mobile or non-desktop web, use the original layout
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
          {renderEmployeeInfoSection()}

          {/* Sección de detalles laborales */}
          {renderEmployeeJobSection()}

          {/* Botón para ver citas confirmadas */}
          {renderAppointmentsSection()}
        </ScrollView>
      )}

      {/* Modal para mostrar las citas confirmadas */}
      <Modal
        visible={showAppointments}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAppointments(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Citas Confirmadas</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowAppointments(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {loadingAppointments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
                <Text style={styles.loadingText}>Cargando citas...</Text>
              </View>
            ) : appointmentsError ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
                <Text style={styles.errorText}>{appointmentsError}</Text>
              </View>
            ) : employeeAppointments.length === 0 ? (
              <View style={styles.emptyAppointmentsContainer}>
                <MaterialIcons name="event-busy" size={60} color="#CCCCCC" />
                <Text style={styles.emptyAppointmentsText}>No hay citas confirmadas</Text>
              </View>
            ) : (
              <FlatList
                data={employeeAppointments.sort((a, b) => {
                  // Convert string dates to Date objects for comparison
                  const dateA = a.date.split("/").reverse().join("-")
                  const dateB = b.date.split("/").reverse().join("-")
                  const timeA = a.time
                  const timeB = b.time

                  const dateTimeA = new Date(`${dateA}T${timeA}`)
                  const dateTimeB = new Date(`${dateB}T${timeB}`)

                  return sortOrder === "newest" ? dateTimeB - dateTimeA : dateTimeA - dateTimeB
                })}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                  <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
                    <MaterialIcons
                      name={sortOrder === "newest" ? "arrow-downward" : "arrow-upward"}
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.sortButtonText}>
                      {sortOrder === "newest" ? "Más recientes primero" : "Más antiguas primero"}
                    </Text>
                  </TouchableOpacity>
                )}
                renderItem={({ item }) => (
                  <View style={styles.appointmentItem}>
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.appointmentTitle}>{item.title}</Text>
                      <View
                        style={[
                          styles.categoryBadge,
                          item.category === "psychology" ? styles.psychologyBadge : styles.nutritionBadge,
                        ]}
                      >
                        <Text style={styles.categoryText}>
                          {item.category === "psychology" ? "Psicología" : "Nutrición"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.appointmentDetail}>
                      <MaterialIcons name="access-time" size={16} color="#666" />
                      <Text style={styles.appointmentDetailText}>
                        {item.date} - {item.time}
                      </Text>
                    </View>

                    <View style={styles.appointmentDetail}>
                      <MaterialIcons name="person" size={16} color="#666" />
                      <Text style={styles.appointmentDetailText}>{item.client}</Text>
                    </View>

                    <View style={styles.appointmentDetail}>
                      <MaterialIcons name="phone" size={16} color="#666" />
                      <Text style={styles.appointmentDetailText}>{item.phone}</Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.appointmentsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
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
  // Estilos para el botón de citas
  appointmentsButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  appointmentsButtonIcon: {
    marginRight: 8,
  },
  appointmentsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos para el modal de citas
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  modalCloseButton: {
    padding: 4,
  },
  emptyAppointmentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyAppointmentsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  appointmentsList: {
    paddingBottom: 20,
  },
  appointmentItem: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.PRIMARYCOLOR,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  psychologyBadge: {
    backgroundColor: Colors.PSICOLOGIA || "#8996F2",
  },
  nutritionBadge: {
    backgroundColor: Colors.NUTRICIÓN || "#6EB566",
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  appointmentDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  appointmentDetailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  sortButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sortButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "90%",
    maxWidth: 550,
    maxHeight: "85%",
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    letterSpacing: 0.2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyAppointmentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  emptyAppointmentsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  appointmentsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  appointmentItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 0,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    backgroundColor: "#FAFAFA",
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 8,
  },
  psychologyBadge: {
    backgroundColor: Colors.PSICOLOGIA,
  },
  nutritionBadge: {
    backgroundColor: Colors.NUTRICIÓN,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  appointmentDetail: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  appointmentDetailText: {
    fontSize: 14,
    color: "#555555",
    marginLeft: 12,
    letterSpacing: 0.2,
    flex: 1,
  },
  sortButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sortButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
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
