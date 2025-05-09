"use client"

import { useState, useEffect } from "react"
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  Text,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import { Calendar } from "react-native-calendars"
import { useNavigation } from "@react-navigation/native"
import Header from "@components/HeaderUser"
import AppointmentModal from "@components/AppointmentModal"
import Colors from "@styles/colors"
import UserDoc from "@screens/employee/UserDoc"
import LogoutModal from "@components/LogOutModal"
import ServiceSelectionModal from "@components/RequestServiceModal"
import AppointmentCalendarScreen from "@components/AppoimentCalendarScreen"
import { db, auth } from "../../../firebaseConfig.js"
import { collection, getDocs, addDoc, query, where, getDoc, doc } from "firebase/firestore"

const Tab = createBottomTabNavigator()

// Función para formatear la fecha en formato dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return "Sin fecha"

  const date = new Date(dateString)
  // Check if date is valid
  if (isNaN(date.getTime())) return "Sin fecha"

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Función para convertir timestamp de Firestore a formato de fecha YYYY-MM-DD
const formatFirestoreDate = (firestoreDate) => {
  if (!firestoreDate) return "Sin fecha"

  // Si es un timestamp de Firestore
  if (firestoreDate.toDate) {
    const date = firestoreDate.toDate()
    return date.toISOString().split("T")[0]
  }

  // Si es una cadena de fecha
  if (typeof firestoreDate === "string") {
    // Extraer la fecha de un formato como "6 de mayo de 2025, 12:00:00 a.m. UTC+2"
    const dateRegex = /(\d+) de (\w+) de (\d{4})/
    const match = firestoreDate.match(dateRegex)

    if (match) {
      const day = match[1]
      const monthName = match[2]
      const year = match[3]

      // Mapeo de nombres de meses en español a números
      const monthMap = {
        enero: "01",
        febrero: "02",
        marzo: "03",
        abril: "04",
        mayo: "05",
        junio: "06",
        julio: "07",
        agosto: "08",
        septiembre: "09",
        octubre: "10",
        noviembre: "11",
        diciembre: "12",
      }

      const month = monthMap[monthName.toLowerCase()]
      return `${year}-${month}-${day.padStart(2, "0")}`
    }
  }

  return "Sin fecha"
}

// Función para extraer la hora de un timestamp o cadena de fecha
const extractTime = (firestoreDate) => {
  if (!firestoreDate) return "Sin hora"

  // Si es un timestamp de Firestore
  if (firestoreDate.toDate) {
    const date = firestoreDate.toDate()
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Si es una cadena de fecha
  if (typeof firestoreDate === "string") {
    // Extraer la hora de un formato como "6 de mayo de 2025, 12:00:00 a.m. UTC+2"
    const timeRegex = /(\d{1,2}):(\d{2}):(\d{2})\s*([ap]\.m\.)/i
    const match = firestoreDate.match(timeRegex)

    if (match) {
      let hour = Number.parseInt(match[1])
      const minute = match[2]
      const ampm = match[4].toLowerCase()

      // Convertir a formato 24 horas si es necesario
      if (ampm === "p.m." && hour < 12) hour += 12
      if (ampm === "a.m." && hour === 12) hour = 0

      return `${hour.toString().padStart(2, "0")}:${minute}`
    }
  }

  return "Sin hora"
}

// Componente vacío para la pestaña de Cerrar App
const EmptyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header userName="Usuario" screenName="Perfil" />
    </SafeAreaView>
  )
}

const AppointmentsScreen = () => {
  const navigation = useNavigation()
  const [user, setUser] = useState({ name: "Usuario" })
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [markedDates, setMarkedDates] = useState({})
  const [serviceModalVisible, setServiceModalVisible] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all") // 'all', 'psychology', 'nutrition'
  const [statusFilter, setStatusFilter] = useState("all") // 'all', 'confirmed', 'pending'
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [error, setError] = useState(null)
  const [listOnlyView, setListOnlyView] = useState(false) // Nuevo estado para controlar la vista

  // Estados para el modal de cierre de sesión
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Get screen dimensions for responsive design
  const screenWidth = Dimensions.get("window").width
  const isDesktop = screenWidth >= 768
  const isWeb = Platform.OS === "web"

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentUser = auth.currentUser
      if (!currentUser) {
        console.log("No user is signed in")
        setLoading(false)
        return
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUser({
          name: userData.name || userData.firstName || "Usuario",
          id: currentUser.uid,
          role: userData.role || "user",
        })
      }

      const appointmentsQuery = query(collection(db, "dates"), where("userId", "==", currentUser.uid))
      const querySnapshot = await getDocs(appointmentsQuery)
      const appointmentsData = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()

        appointmentsData.push({
          id: doc.id,
          title: `Consulta de ${data.service === "psychology" ? "Psicología" : "Nutrición"}`,
          date: data.date ? formatFirestoreDate(data.date) : "Sin fecha",
          category: data.service || "other",
          time: data.date ? extractTime(data.date) : "Sin hora",
          doctor: data.teacherId ? `Dr. ${data.teacherId}` : "Sin asignar",
          state: data.state,
          rawData: data,
        })
      })

      setAppointments(appointmentsData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Error al cargar los datos. Por favor, intente de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch user data and appointments from Firebase
  useEffect(() => {
    fetchAppointments()
  }, [])

  // Preparar las fechas marcadas en el calendario
  useEffect(() => {
    // Crear un objeto para almacenar las fechas marcadas
    const marked = {}

    // Agrupar citas por fecha, teniendo en cuenta el filtro activo
    const appointmentsByDate = {}
    appointments.forEach((appointment) => {
      // Si hay un filtro activo diferente a "all", solo incluir las citas de esa categoría
      if (activeFilter !== "all" && appointment.category !== activeFilter) {
        return
      }

      if (!appointmentsByDate[appointment.date]) {
        appointmentsByDate[appointment.date] = []
      }
      appointmentsByDate[appointment.date].push(appointment)
    })

    // Crear marcas para cada fecha
    Object.entries(appointmentsByDate).forEach(([date, dateAppointments]) => {
      // Verificar si hay citas de psicología y nutrición en esta fecha
      const hasPsychology = dateAppointments.some((app) => app.category === "psychology")
      const hasNutrition = dateAppointments.some((app) => app.category === "nutrition")

      // Si hay ambos tipos, usar dots
      if (hasPsychology && hasNutrition) {
        marked[date] = {
          dots: [
            { key: "psychology", color: Colors.PSICOLOGIA },
            { key: "NUTRICIÓN", color: Colors.NUTRICIÓN },
          ],
          marked: true,
        }
      }
      // Si solo hay un tipo, usar un solo dot
      else {
        const dotColor = hasPsychology ? Colors.PSICOLOGIA : Colors.NUTRICIÓN
        marked[date] = {
          dots: [{ key: "single", color: dotColor }],
          marked: true,
        }
      }

      // Si esta fecha está seleccionada, añadir propiedad selected
      if (date === selectedDate) {
        marked[date] = {
          ...marked[date],
          selected: true,
          selectedColor:
            activeFilter === "psychology"
              ? Colors.PSICOLOGIA
              : activeFilter === "nutrition"
                ? Colors.NUTRICIÓN
                : Colors.PRIMARYCOLOR,
        }
      }
    })

    // Si la fecha seleccionada no tiene citas, asegurarse de que esté marcada como seleccionada
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor:
          activeFilter === "psychology"
            ? Colors.PSICOLOGIA
            : activeFilter === "nutrition"
              ? Colors.NUTRICIÓN
              : Colors.PRIMARYCOLOR,
      }
    }

    setMarkedDates(marked)
  }, [appointments, selectedDate, activeFilter])

  // Manejamos el botón de retroceso en Android para el modal de cierre de sesión
  useEffect(() => {
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (logoutModalVisible) {
          handleCancelLogout()
          return true
        }
        if (calendarVisible) {
          setCalendarVisible(false)
          return true
        }
        return false
      })

      return () => backHandler.remove()
    }
  }, [logoutModalVisible, calendarVisible])

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setModalVisible(true)
  }

  // Función para abrir el modal de selección de servicio
  const openServiceModal = () => {
    setServiceModalVisible(true)
  }

  // Función para alternar entre vista completa y vista de solo lista
  const toggleViewMode = () => {
    setListOnlyView(!listOnlyView)
  }

  // Modify the handleServiceConfirm function to show the calendar screen
  const handleServiceConfirm = async (serviceType) => {
    const serviceDisplayName = serviceType === "psychology" ? "Psicología" : "Nutrición"
    setSelectedService(serviceDisplayName)
    setSelectedService(serviceType)
    setServiceModalVisible(false)

    const currentUser = auth.currentUser

    if (!currentUser || !user) {
      console.warn("Usuario no autenticado o sin datos cargados")
      return
    }

    if (user.role === "user") {
      try {
        await addDoc(collection(db, "dates"), {
          userId: currentUser.uid,
          service: serviceType,
          state: false,
          teacherId: "",
          date: null, // placeholder hasta que se asigne
        })
        alert("Solicitud enviada correctamente.")
        // Aquí puedes refrescar la lista si es necesario
        fetchAppointments()
      } catch (error) {
        console.error("Error al crear cita:", error)
        alert("Error al crear la cita.")
      }
    } else if (user.role === "externalUser") {
      setCalendarVisible(true)
    }
  }

  // Add a function to handle when the calendar is closed
  const handleCalendarClose = () => {
    setCalendarVisible(false)
  }

  // Add a function to handle when an appointment is confirmed
  const handleAppointmentConfirm = async (appointmentDate) => {
    console.log(`Cita confirmada para: ${appointmentDate}`)
    setCalendarVisible(false)

    const currentUser = auth.currentUser

    if (!currentUser || !user || !selectedService) {
      alert("No se pudo confirmar la cita. Faltan datos.")
      return
    }

    try {
      await addDoc(collection(db, "dates"), {
        userId: currentUser.uid,
        service: selectedService.toLowerCase(), // guarda como 'psychology' o 'nutrition'
        state: false,
        teacherId: "", // puedes asignarlo luego
        date: appointmentDate,
      })

      alert("Cita creada correctamente.")

      // Opcional: refrescar lista de citas si es necesario
      if (typeof fetchAppointments === "function") {
        fetchAppointments() // Reemplaza con tu función real de recarga
      } else {
        console.warn("Función fetchAppointments no definida.")
      }
      // fetchAppointments();
    } catch (error) {
      console.error("Error al guardar la cita:", error)
      alert("Error al guardar la cita.")
    }
  }

  // Funciones para el modal de cierre de sesión
  const handleLogout = () => {
    setIsLoggingOut(true)

    setTimeout(() => {
      setIsLoggingOut(false)
      setLogoutModalVisible(false)
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      })
    }, 800)
  }

  const handleCancelLogout = () => {
    setLogoutModalVisible(false)
  }

  // Función para limpiar la selección de fecha
  const clearDateSelection = () => {
    setSelectedDate("")
  }

  // Función para manejar la selección de fecha en el calendario
  const handleDayPress = (day) => {
    // Si la fecha seleccionada es la misma que ya está seleccionada, la deseleccionamos
    if (day.dateString === selectedDate) {
      setSelectedDate("")
    } else {
      setSelectedDate(day.dateString)
    }
  }

  // Filtrar citas según el filtro activo y la fecha seleccionada
  const getFilteredAppointments = () => {
    return appointments.filter((appointment) => {
      const matchesFilter = activeFilter === "all" || appointment.category === activeFilter
      const matchesDate = !selectedDate || appointment.date === selectedDate
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "confirmed" && appointment.state === true) ||
        (statusFilter === "pending" && appointment.state === false)
      return matchesFilter && matchesDate && matchesStatus
    })
  }

  // Renderizar estado de carga
  const renderLoading = () => {
    return (
      <View style={styles.iosLoadingContainer}>
        <Text style={styles.iosLoadingText}>Cargando citas...</Text>
      </View>
    )
  }

  // Renderizar mensaje de error
  const renderError = () => {
    return (
      <View style={styles.iosErrorContainer}>
        <Text style={styles.iosErrorText}>{error}</Text>
        <TouchableOpacity
          style={styles.iosRetryButton}
          onPress={() => {
            // Refresh appointments
            setLoading(true)
            setError(null)
            // Re-fetch data (this would trigger the useEffect)
          }}
        >
          <Text style={styles.iosRetryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Renderizar la lista de citas
  const renderAppointmentsList = () => {
    const filteredAppointments = getFilteredAppointments()

    return (
      <View style={styles.iosAppointmentsList}>
        <View style={styles.iosSelectedDateHeader}>
          <View style={styles.iosTitleContainer}>
            {selectedDate && (
              <TouchableOpacity style={styles.iosClearDateButton} onPress={clearDateSelection}>
                <Ionicons name="close-circle" size={18} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.iosStatusFilterContainer}>
            <TouchableOpacity
              style={[styles.iosStatusFilterButton, statusFilter === "all" && styles.iosStatusFilterButtonActive]}
              onPress={() => setStatusFilter("all")}
            >
              <Ionicons name="apps" size={18} color={statusFilter === "all" ? "#FFFFFF" : "#8E8E93"} />
              <Text style={[styles.iosStatusFilterText, statusFilter === "all" && styles.iosStatusFilterTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iosStatusFilterButton,
                statusFilter === "confirmed" && styles.iosStatusFilterButtonConfirmed,
              ]}
              onPress={() => setStatusFilter("confirmed")}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={statusFilter === "confirmed" ? "#FFFFFF" : "#8E8E93"}
              />
              <Text
                style={[styles.iosStatusFilterText, statusFilter === "confirmed" && styles.iosStatusFilterTextActive]}
              >
                Confirmadas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iosStatusFilterButton, statusFilter === "pending" && styles.iosStatusFilterButtonPending]}
              onPress={() => setStatusFilter("pending")}
            >
              <Ionicons name="time" size={18} color={statusFilter === "pending" ? "#FFFFFF" : "#8E8E93"} />
              <Text
                style={[styles.iosStatusFilterText, statusFilter === "pending" && styles.iosStatusFilterTextActive]}
              >
                Pendientes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredAppointments.length === 0 ? (
          <View style={styles.iosEmptyStateContainer}>
            <Text style={styles.iosNoAppointmentsText}>
              {selectedDate
                ? "No hay citas para esta fecha"
                : statusFilter !== "all"
                  ? statusFilter === "confirmed"
                    ? "No hay citas confirmadas"
                    : "No hay citas pendientes"
                  : "No tienes citas programadas"}
            </Text>
            {(selectedDate || statusFilter !== "all") && (
              <TouchableOpacity
                style={styles.iosClearFilterButton}
                onPress={() => {
                  clearDateSelection()
                  setStatusFilter("all")
                }}
              >
                <Text style={styles.iosClearFilterButtonText}>Ver todas las citas</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={isDesktop && !listOnlyView ? styles.iosAppointmentsGridDesktop : undefined}>
            {filteredAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={[
                  styles.iosAppointmentItemCompact,
                  appointment.category === "psychology" ? styles.iosPsychologyItem : styles.iosNutritionItem,
                  isDesktop && !listOnlyView && styles.iosAppointmentItemDesktop,
                ]}
                onPress={() => handleSelectAppointment(appointment)}
                activeOpacity={0.7}
              >
                <View style={styles.iosAppointmentRow}>
                  <View style={styles.iosAppointmentMainInfo}>
                    <Text style={styles.iosAppointmentTitleCompact}>{appointment.title}</Text>
                    <View style={styles.iosAppointmentTimeRow}>
                      <Ionicons name="time-outline" size={14} color="#8E8E93" />
                      <Text style={styles.iosDetailTextCompact}>{appointment.time || "Sin hora"}</Text>
                      <Text style={styles.iosDateSeparator}>•</Text>
                      <Text style={styles.iosDetailTextCompact}>
                        {appointment.date ? formatDate(appointment.date) : "Sin fecha"}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.iosCategoryBadgeCompact,
                      appointment.category === "psychology" ? styles.iosPsychologyBadge : styles.iosNutritionBadge,
                    ]}
                  >
                    <Text style={styles.iosCategoryTextCompact}>
                      {appointment.category === "psychology" ? "Psic." : "Nutr."}
                    </Text>
                  </View>
                </View>
                <View style={styles.iosDoctorRow}>
                  <Ionicons name="person-outline" size={14} color="#8E8E93" />
                  <Text style={styles.iosDetailTextCompact}>{appointment.doctor}</Text>
                </View>
                {appointment.state !== undefined && (
                  <View style={styles.iosStatusRow}>
                    <View
                      style={[
                        styles.iosStatusIndicator,
                        appointment.state ? styles.iosStatusConfirmed : styles.iosStatusPending,
                      ]}
                    />
                    <Text style={styles.iosStatusText}>{appointment.state ? "Confirmada" : "Pendiente"}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    )
  }

  // Modificar la función renderAppointments para hacer las citas más compactas
  const renderAppointments = () => {
    if (loading) {
      return renderLoading()
    }

    if (error) {
      return renderError()
    }

    return renderAppointmentsList()
  }

  return (
    <SafeAreaView style={styles.iosSafeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.iosHeaderContainer}>
        <Header
          userName={user.name}
          screenName="Mis Citas"
          headerStyle={styles.iosHeader}
          titleStyle={styles.iosHeaderTitle}
        />
        <TouchableOpacity style={styles.iosViewToggleButton} onPress={toggleViewMode}>
          <Ionicons name={listOnlyView ? "calendar-outline" : "list-outline"} size={24} color={Colors.PRIMARYCOLOR} />
        </TouchableOpacity>
      </View>

      <View style={styles.iosContainer}>
        {/* Filtros de categoría con estilo iOS */}
        <View style={styles.iosFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.iosFilterScrollContent}
          >
            <TouchableOpacity
              style={[styles.iosFilterButton, activeFilter === "all" && styles.iosFilterButtonActive]}
              onPress={() => setActiveFilter("all")}
              activeOpacity={0.7}
            >
              <Text style={[styles.iosFilterText, activeFilter === "all" && styles.iosFilterTextActive]}>Todas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iosFilterButton, activeFilter === "psychology" && styles.iosPsychologyFilterActive]}
              onPress={() => setActiveFilter("psychology")}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="brain"
                size={14}
                color={activeFilter === "psychology" ? "#FFFFFF" : "#8E8E93"}
                style={styles.iosFilterIcon}
              />
              <Text style={[styles.iosFilterText, activeFilter === "psychology" && styles.iosFilterTextActive]}>
                Psicología
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iosFilterButton, activeFilter === "nutrition" && styles.iosNutritionFilterActive]}
              onPress={() => setActiveFilter("nutrition")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="food-apple"
                size={16}
                color={activeFilter === "nutrition" ? "#FFFFFF" : "#8E8E93"}
                style={styles.iosFilterIcon}
              />
              <Text style={[styles.iosFilterText, activeFilter === "nutrition" && styles.iosFilterTextActive]}>
                Nutrición
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {isDesktop && !listOnlyView ? (
          // Layout para desktop - dos columnas con estilo iOS (solo en modo vista completa)
          <View style={styles.iosContentContainerDesktop}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.iosScrollViewDesktop}
              contentContainerStyle={styles.iosScrollContentDesktop}
            >
              {/* Botones y calendario para desktop con estilo iOS */}
              <TouchableOpacity style={styles.iosRequestServiceButton} onPress={openServiceModal} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={styles.iosButtonIcon} />
                <Text style={styles.iosRequestServiceButtonText}>Solicitar nueva cita</Text>
              </TouchableOpacity>

              <View style={styles.iosCalendarContainer}>
                <Calendar
                  current={selectedDate || new Date().toISOString().split("T")[0]}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  markingType="multi-dot"
                  theme={{
                    backgroundColor: "#FFFFFF",
                    calendarBackground: "#FFFFFF",
                    textSectionTitleColor: "#000000",
                    selectedDayBackgroundColor: Colors.PRIMARYCOLOR,
                    selectedDayTextColor: "#FFFFFF",
                    todayTextColor: Colors.PRIMARYCOLOR,
                    dayTextColor: "#000000",
                    textDisabledColor: "#C7C7CC",
                    dotColor: Colors.PRIMARYCOLOR,
                    selectedDotColor: "#FFFFFF",
                    arrowColor: Colors.PRIMARYCOLOR,
                    monthTextColor: "#000000",
                    indicatorColor: Colors.PRIMARYCOLOR,
                    textDayFontFamily: "System",
                    textMonthFontFamily: "System",
                    textDayHeaderFontFamily: "System",
                    textDayFontWeight: "400",
                    textMonthFontWeight: "600",
                    textDayHeaderFontWeight: "500",
                    textDayFontSize: 17,
                    textMonthFontSize: 20,
                    textDayHeaderFontSize: 14,
                    "stylesheet.day.basic": {
                      base: {
                        width: 36,
                        height: 36,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 18,
                      },
                      selected: {
                        borderRadius: 18,
                      },
                    },
                  }}
                />
              </View>

              {selectedDate && (
                <TouchableOpacity
                  style={styles.iosClearDateButtonLarge}
                  onPress={clearDateSelection}
                  activeOpacity={0.8}
                >
                  <Text style={styles.iosClearDateButtonText}>Limpiar selección</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <ScrollView
              style={styles.iosAppointmentsScrollDesktop}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.iosAppointmentsScrollContent}
            >
              {renderAppointments()}
            </ScrollView>
          </View>
        ) : (
          // Layout para móvil o vista de solo lista - una columna con scroll completo
          <ScrollView
            style={styles.iosMobileScrollView}
            contentContainerStyle={styles.iosMobileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Botón de solicitar cita siempre visible */}
            <TouchableOpacity style={styles.iosRequestServiceButton} onPress={openServiceModal} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={styles.iosButtonIcon} />
              <Text style={styles.iosRequestServiceButtonText}>Solicitar nueva cita</Text>
            </TouchableOpacity>

            {/* Calendario solo visible en modo vista completa */}
            {!listOnlyView && (
              <>
                <View style={styles.iosCalendarContainer}>
                  <Calendar
                    current={selectedDate || new Date().toISOString().split("T")[0]}
                    onDayPress={handleDayPress}
                    markedDates={markedDates}
                    markingType="multi-dot"
                    theme={{
                      backgroundColor: "#FFFFFF",
                      calendarBackground: "#FFFFFF",
                      textSectionTitleColor: "#000000",
                      selectedDayBackgroundColor: Colors.PRIMARYCOLOR,
                      selectedDayTextColor: "#FFFFFF",
                      todayTextColor: Colors.PRIMARYCOLOR,
                      dayTextColor: "#000000",
                      textDisabledColor: "#C7C7CC",
                      dotColor: Colors.PRIMARYCOLOR,
                      selectedDotColor: "#FFFFFF",
                      arrowColor: Colors.PRIMARYCOLOR,
                      monthTextColor: "#000000",
                      indicatorColor: Colors.PRIMARYCOLOR,
                      textDayFontFamily: "System",
                      textMonthFontFamily: "System",
                      textDayHeaderFontFamily: "System",
                      textDayFontWeight: "400",
                      textMonthFontWeight: "600",
                      textDayHeaderFontWeight: "500",
                      textDayFontSize: 16,
                      textMonthFontSize: 18,
                      textDayHeaderFontSize: 14,
                      "stylesheet.day.basic": {
                        base: {
                          width: 32,
                          height: 32,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 16,
                        },
                        selected: {
                          borderRadius: 16,
                        },
                      },
                    }}
                  />
                </View>

                {selectedDate && (
                  <TouchableOpacity
                    style={styles.iosClearDateButtonLarge}
                    onPress={clearDateSelection}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.iosClearDateButtonText}>Limpiar selección</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Lista de citas para móvil con estilo iOS */}
            {renderAppointments()}
          </ScrollView>
        )}
      </View>

      {/* Modal de detalles de cita con estilo iOS */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          modalStyle={styles.iosModal}
          contentStyle={styles.iosModalContent}
          titleStyle={styles.iosModalTitle}
          textStyle={styles.iosModalText}
          buttonStyle={styles.iosModalButton}
          buttonTextStyle={styles.iosModalButtonText}
        />
      )}

      {/* Modal de selección de servicio con estilo iOS */}
      <ServiceSelectionModal
        visible={serviceModalVisible}
        onClose={() => setServiceModalVisible(false)}
        onConfirm={handleServiceConfirm}
        modalStyle={styles.iosModal}
        contentStyle={styles.iosModalContent}
        titleStyle={styles.iosModalTitle}
        textStyle={styles.iosModalText}
        buttonStyle={styles.iosModalButton}
        buttonTextStyle={styles.iosModalButtonText}
      />

      {/* Modal de cierre de sesión con estilo iOS */}
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
        modalStyle={styles.iosModal}
        contentStyle={styles.iosModalContent}
        titleStyle={styles.iosModalTitle}
        textStyle={styles.iosModalText}
        buttonStyle={styles.iosModalButton}
        buttonTextStyle={styles.iosModalButtonText}
      />

      {/* AppointmentCalendarScreen como overlay con estilo iOS */}
      {calendarVisible && (
        <View style={styles.iosCalendarScreenOverlay}>
          <AppointmentCalendarScreen
            onClose={handleCalendarClose}
            onConfirm={handleAppointmentConfirm}
            patientName={user.name}
            service={selectedService}
            screenStyle={styles.iosCalendarScreen}
            headerStyle={styles.iosCalendarScreenHeader}
            titleStyle={styles.iosCalendarScreenTitle}
            buttonStyle={styles.iosCalendarScreenButton}
            buttonTextStyle={styles.iosCalendarScreenButtonText}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

const HomeUser = () => {
  const navigation = useNavigation()
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState("Citas")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [userData, setUserData] = useState(null)

  // Get screen dimensions for responsive design
  const screenWidth = Dimensions.get("window").width
  const isDesktop = screenWidth >= 768

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) return

        const userDoc = await getDoc(doc(db, "users", currentUser.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data())
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  // Función para alternar la visibilidad de la barra lateral
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  const handleLogout = () => {
    setIsLoggingOut(true)

    setTimeout(() => {
      setIsLoggingOut(false)
      setLogoutModalVisible(false)
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      })
    }, 800)
  }

  const handleCancelLogout = () => {
    setLogoutModalVisible(false)
  }

  // Renderizar la barra lateral con estilo iOS
  const renderSidebar = () => {
    if (!isDesktop) return null

    return (
      <View style={[styles.iosSidebarContainer, !sidebarExpanded && styles.iosSidebarCollapsed]}>
        <View style={styles.iosSidebarHeader}>
          {sidebarExpanded ? (
            <>
              <Text style={styles.iosSidebarLogo}>Senda</Text>
              <TouchableOpacity style={styles.iosSidebarToggleButton} onPress={toggleSidebar}>
                <MaterialCommunityIcons name="chevron-left" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.iosSidebarToggleButtonCollapsed} onPress={toggleSidebar}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.iosSidebarContent}>
          <TouchableOpacity
            style={[
              styles.iosSidebarItem,
              activeTab === "Citas" && styles.iosSidebarItemActive,
              !sidebarExpanded && styles.iosSidebarItemCollapsed,
            ]}
            onPress={() => setActiveTab("Citas")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={24}
              color={activeTab === "Citas" ? Colors.PRIMARYCOLOR : "#8E8E93"}
            />
            {sidebarExpanded && (
              <Text style={[styles.iosSidebarItemText, activeTab === "Citas" && styles.iosSidebarItemTextActive]}>
                Mis Citas
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iosSidebarItem,
              activeTab === "Documentos" && styles.iosSidebarItemActive,
              !sidebarExpanded && styles.iosSidebarItemCollapsed,
            ]}
            onPress={() => setActiveTab("Documentos")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="file-document-multiple"
              size={24}
              color={activeTab === "Documentos" ? Colors.PRIMARYCOLOR : "#8E8E93"}
            />
            {sidebarExpanded && (
              <Text style={[styles.iosSidebarItemText, activeTab === "Documentos" && styles.iosSidebarItemTextActive]}>
                Documentos
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.iosSidebarFooter}>
          <TouchableOpacity
            style={[styles.iosLogoutButton, !sidebarExpanded && styles.iosLogoutButtonCollapsed]}
            onPress={() => setLogoutModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#8E8E93" />
            {sidebarExpanded && <Text style={styles.iosLogoutButtonText}>Cerrar Sesión</Text>}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Renderizar el contenido principal
  const renderContent = () => {
    if (isDesktop) {
      return (
        <View style={styles.iosDesktopContentContainer}>
          {activeTab === "Citas" ? <AppointmentsScreen /> : <UserDoc />}
        </View>
      )
    }

    // En móvil, usamos el Tab.Navigator con estilo iOS
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName
            if (route.name === "Citas") {
              iconName = "calendar-clock"
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />
            } else if (route.name === "Documentos") {
              iconName = "file-document-multiple"
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />
            } else if (route.name === "Cerrar Sesión") {
              iconName = "logout"
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />
            }
            return null
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: "#8E8E93",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F2F2F7",
            paddingTop: 5,
            height: Platform.OS === "ios" ? 85 : 65,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            paddingBottom: Platform.OS === "ios" ? 0 : 5,
          },
        })}
      >
        <Tab.Screen name="Citas" component={AppointmentsScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Documentos" component={UserDoc} options={{ headerShown: false }} />

        {/* Pestaña para cerrar sesión */}
        <Tab.Screen
          name="Cerrar Sesión"
          component={EmptyScreen}
          options={{ headerShown: false }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault()
              setLogoutModalVisible(true)
            },
          })}
        />
      </Tab.Navigator>
    )
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Modal de cierre de sesión con estilo iOS */}
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
        modalStyle={styles.iosModal}
        contentStyle={styles.iosModalContent}
        titleStyle={styles.iosModalTitle}
        textStyle={styles.iosModalText}
        buttonStyle={styles.iosModalButton}
        buttonTextStyle={styles.iosModalButtonText}
      />

      {isDesktop ? (
        <View style={styles.iosDesktopLayout}>
          {renderSidebar()}
          {renderContent()}
        </View>
      ) : (
        renderContent()
      )}
    </>
  )
}

const styles = StyleSheet.create({
  // Estilos generales con estilo iOS
  iosSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  iosContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  iosHeaderContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? 40 : Platform.OS === "web" ? 0 : 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    position: "relative",
  },
  iosHeader: {
    backgroundColor: "#FFFFFF",
  },
  iosHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.5,
  },
  iosViewToggleButton: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "android" ? 50 : 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    zIndex: 10,
  },

  // Filtros con estilo iOS
  iosFilterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  iosFilterScrollContent: {
    paddingHorizontal: 16,
  },
  iosFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  iosFilterButtonActive: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  iosFilterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3A3A3C",
  },
  iosFilterTextActive: {
    color: "#FFFFFF",
  },
  iosFilterIcon: {
    marginRight: 6,
  },

  // Botones con estilo iOS
  iosRequestServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  iosRequestServiceButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  iosButtonIcon: {
    marginRight: 8,
  },
  iosClearDateButtonLarge: {
    backgroundColor: "#F2F2F7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  iosClearDateButtonText: {
    color: Colors.PRIMARYCOLOR,
    fontSize: 16,
    fontWeight: "500",
  },

  // Calendario con estilo iOS
  iosCalendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },

  // Lista de citas con estilo iOS
  iosAppointmentsList: {
    marginTop: 8,
  },
  iosAppointmentsGridDesktop: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iosSelectedDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iosSelectedDateText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000000",
    letterSpacing: 0.5,
  },
  iosClearDateButton: {
    padding: 6,
    borderRadius: 16,
  },
  // Nuevo estilo compacto para las citas
  iosAppointmentItemCompact: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  iosAppointmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iosAppointmentMainInfo: {
    flex: 1,
  },
  iosAppointmentTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iosDoctorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  iosDateSeparator: {
    marginHorizontal: 4,
    color: "#8E8E93",
    fontSize: 12,
  },
  iosPsychologyItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.PSICOLOGIA,
  },
  iosNutritionItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.NUTRICIÓN,
  },
  iosAppointmentItemDesktop: {
    width: "calc(50% - 8px)",
    marginBottom: 12,
  },
  iosAppointmentTitleCompact: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  iosCategoryBadgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  iosCategoryTextCompact: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  iosDetailTextCompact: {
    marginLeft: 4,
    color: "#3A3A3C",
    fontSize: 13,
    fontWeight: "400",
  },

  // Estado vacío con estilo iOS
  iosEmptyStateContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  iosNoAppointmentsText: {
    fontSize: 17,
    color: "#8E8E93",
    marginBottom: 16,
    textAlign: "center",
  },
  iosClearFilterButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  iosClearFilterButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Estilos específicos para móvil con estilo iOS
  iosMobileScrollView: {
    flex: 1,
  },
  iosMobileScrollContent: {
    padding: 16,
    paddingBottom: 80,
  },

  // Estilos para la barra lateral en desktop con estilo iOS
  iosDesktopLayout: {
    flexDirection: "row",
    height: "100vh",
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  iosSidebarContainer: {
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#F2F2F7",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  iosSidebarCollapsed: {
    width: 70,
  },
  iosSidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iosSidebarLogo: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.PRIMARYCOLOR,
  },
  iosSidebarContent: {
    flex: 1,
    padding: 16,
  },
  iosSidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  iosSidebarItemActive: {
    backgroundColor: "#F2F2F7",
  },
  iosSidebarItemText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#8E8E93",
    marginLeft: 12,
  },
  iosSidebarItemTextActive: {
    color: Colors.PRIMARYCOLOR,
    fontWeight: "600",
  },
  iosSidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  iosLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
  },
  iosLogoutButtonText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#8E8E93",
    marginLeft: 12,
  },
  iosDesktopContentContainer: {
    flex: 1,
    height: "100%",
    overflow: "auto",
  },
  iosSidebarToggleButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    padding: 5,
    borderRadius: 15,
    backgroundColor: "#F2F2F7",
  },
  iosSidebarToggleButtonCollapsed: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: "#F2F2F7",
  },
  iosSidebarItemCollapsed: {
    justifyContent: "center",
    padding: 12,
  },
  iosLogoutButtonCollapsed: {
    justifyContent: "center",
    padding: 12,
  },

  // Estilos para layout desktop
  iosContentContainerDesktop: {
    flexDirection: "row",
    flex: 1,
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
    padding: 16,
  },
  iosScrollViewDesktop: {
    flex: 1,
    maxWidth: "50%",
    paddingRight: 16,
  },
  iosScrollContentDesktop: {
    paddingBottom: 20,
  },
  iosAppointmentsScrollDesktop: {
    flex: 1,
    padding: 16,
    maxWidth: "50%",
    paddingLeft: 16,
  },
  iosAppointmentsScrollContent: {
    paddingBottom: 40,
  },

  // Estilos para modales con estilo iOS
  iosModal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  iosModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iosModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  iosModalText: {
    fontSize: 17,
    color: "#000000",
    marginBottom: 20,
    textAlign: "center",
  },
  iosModalButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  iosModalButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  // Estilos para el calendario overlay con estilo iOS
  iosCalendarScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 1000,
  },
  iosCalendarScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  iosCalendarScreenHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    paddingVertical: 16,
  },
  iosCalendarScreenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  iosCalendarScreenButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  iosCalendarScreenButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  // Estilos para citas compactas
  iosAppointmentItemCompact: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  iosAppointmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iosAppointmentMainInfo: {
    flex: 1,
  },
  iosAppointmentTitleCompact: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  iosAppointmentTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iosDetailTextCompact: {
    marginLeft: 4,
    color: "#3A3A3C",
    fontSize: 13,
    fontWeight: "400",
  },
  iosDateSeparator: {
    marginHorizontal: 4,
    color: "#8E8E93",
    fontSize: 13,
  },
  iosCategoryBadgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  iosCategoryTextCompact: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  iosDoctorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iosPsychologyFilterActive: {
    backgroundColor: Colors.PSICOLOGIA,
    borderColor: Colors.PSICOLOGIA,
  },
  iosNutritionFilterActive: {
    backgroundColor: Colors.NUTRICIÓN,
    borderColor: Colors.NUTRICIÓN,
  },
  iosPsychologyBadge: {
    backgroundColor: Colors.PSICOLOGIA,
  },
  iosNutritionBadge: {
    backgroundColor: Colors.NUTRICIÓN,
  },

  // Nuevos estilos para estados de carga y error
  iosLoadingContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  iosLoadingText: {
    fontSize: 17,
    color: "#8E8E93",
    textAlign: "center",
  },
  iosErrorContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  iosErrorText: {
    fontSize: 17,
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  iosRetryButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  iosRetryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Estilos para el estado de la cita
  iosStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  iosStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  iosStatusConfirmed: {
    backgroundColor: "#34C759", // Verde iOS
  },
  iosStatusPending: {
    backgroundColor: "#FF9500", // Naranja iOS
  },
  iosStatusText: {
    fontSize: 13,
    color: "#3A3A3C",
  },

  // Estilos para filtros de estado
  iosConfirmedFilterActive: {
    backgroundColor: "#34C759", // Verde iOS
    borderColor: "#34C759",
  },
  iosPendingFilterActive: {
    backgroundColor: "#FF9500", // Naranja iOS
    borderColor: "#FF9500",
  },
  // Estilos para los iconos de filtrado por estado
  iosTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iosStatusFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
    width: "100%",
  },
  iosStatusFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  iosStatusFilterButtonActive: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  iosStatusFilterButtonConfirmed: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  iosStatusFilterButtonPending: {
    backgroundColor: "#FF9500",
    borderColor: "#FF9500",
  },
  iosStatusFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3A3A3C",
    marginLeft: 4,
  },
  iosStatusFilterTextActive: {
    color: "#FFFFFF",
  },
  iosStatusFilterIcon: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 20,
  },
  iosStatusFilterActive: {
    backgroundColor: "#F2F2F7",
  },
})

export default HomeUser
