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
import { useResponsive } from "../../hooks/use-responsive"

const Tab = createBottomTabNavigator()

// Array of appointments data
const APPOINTMENTS = [
  {
    id: 1,
    title: "Consulta de Psicología",
    date: "2025-04-08",
    category: "psychology",
    time: "10:00",
    doctor: "Dr. García",
  },
  {
    id: 2,
    title: "Consulta de Nutrición",
    date: "2025-04-08",
    category: "nutrition",
    time: "14:30",
    doctor: "Dra. Martínez",
  },
  {
    id: 3,
    title: "Terapia Cognitiva",
    date: "2025-04-10",
    category: "psychology",
    time: "11:15",
    doctor: "Dr. García",
  },
  {
    id: 4,
    title: "Plan Alimenticio",
    date: "2025-04-12",
    category: "nutrition",
    time: "09:00",
    doctor: "Dra. Martínez",
  },
  {
    id: 5,
    title: "Evaluación Psicológica",
    date: "2025-04-15",
    category: "psychology",
    time: "16:00",
    doctor: "Dra. López",
  },
  {
    id: 6,
    title: "Control de Peso",
    date: "2025-04-18",
    category: "nutrition",
    time: "12:30",
    doctor: "Dr. Rodríguez",
  },
  { id: 7, title: "Terapia de Grupo", date: "2025-04-20", category: "psychology", time: "17:00", doctor: "Dr. García" },
  {
    id: 8,
    title: "Asesoría Nutricional",
    date: "2025-04-22",
    category: "nutrition",
    time: "10:45",
    doctor: "Dra. Martínez",
  },
  {
    id: 9,
    title: "Consulta de Seguimiento",
    date: "2025-04-25",
    category: "psychology",
    time: "15:30",
    doctor: "Dra. López",
  },
  {
    id: 10,
    title: "Plan Deportivo",
    date: "2025-04-28",
    category: "nutrition",
    time: "11:00",
    doctor: "Dr. Rodríguez",
  },
]

// Función para formatear la fecha en formato dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
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
  const [user, setUser] = useState({ name: "Juan" })
  const [appointments] = useState(APPOINTMENTS)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [markedDates, setMarkedDates] = useState({})
  const [serviceModalVisible, setServiceModalVisible] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all") // 'all', 'psychology', 'nutrition'

  // Estados para el modal de cierre de sesión
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Get responsive information
  const responsive = useResponsive()

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
        return false
      })

      return () => backHandler.remove()
    }
  }, [logoutModalVisible])

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setModalVisible(true)
  }

  // Función para abrir el modal de selección de servicio
  const openServiceModal = () => {
    setServiceModalVisible(true)
  }

  // Función para manejar la confirmación de selección de servicio
  const handleServiceConfirm = (serviceType) => {
    console.log(`Servicio seleccionado: ${serviceType}`)
    setServiceModalVisible(false)
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
      return matchesFilter && matchesDate
    })
  }

  // Renderizar las citas filtradas
  const renderAppointments = () => {
    const filteredAppointments = getFilteredAppointments()

    if (selectedDate && filteredAppointments.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noAppointmentsText}>No hay citas para esta fecha</Text>
          <TouchableOpacity style={styles.clearFilterButton} onPress={clearDateSelection}>
            <Text style={styles.clearFilterButtonText}>Ver todas las citas</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.appointmentsList}>
        {selectedDate ? (
          <View style={styles.selectedDateHeader}>
            <Text style={[styles.selectedDateText, responsive.isDesktop && styles.selectedDateTextDesktop]}>
              Citas para {formatDate(selectedDate)}
            </Text>
            <TouchableOpacity style={styles.clearDateButton} onPress={clearDateSelection}>
              <Ionicons name="close-circle" size={20} color="#666" />
              <Text style={styles.clearDateButtonText}>Limpiar fecha</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.selectedDateText, responsive.isDesktop && styles.selectedDateTextDesktop]}>
            Todas las citas
          </Text>
        )}

        <View style={responsive.isDesktop ? styles.appointmentsGridDesktop : undefined}>
          {filteredAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={[
                styles.appointmentItem,
                { borderLeftColor: appointment.category === "psychology" ? Colors.PSICOLOGIA : Colors.NUTRICIÓN },
                responsive.isDesktop && styles.appointmentItemDesktop,
              ]}
              onPress={() => handleSelectAppointment(appointment)}
            >
              <View style={styles.appointmentHeader}>
                <Text style={[styles.appointmentTitle, responsive.isDesktop && styles.appointmentTitleDesktop]}>
                  {appointment.title}
                </Text>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: appointment.category === "psychology" ? Colors.PSICOLOGIA : Colors.NUTRICIÓN },
                    responsive.isDesktop && styles.categoryBadgeDesktop,
                  ]}
                >
                  <Text style={[styles.categoryText, responsive.isDesktop && styles.categoryTextDesktop]}>
                    {appointment.category === "psychology" ? "Psicología" : "Nutrición"}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={responsive.isDesktop ? 18 : 16} color="#666" />
                  <Text style={[styles.detailText, responsive.isDesktop && styles.detailTextDesktop]}>
                    {appointment.time}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={responsive.isDesktop ? 18 : 16} color="#666" />
                  <Text style={[styles.detailText, responsive.isDesktop && styles.detailTextDesktop]}>
                    {formatDate(appointment.date)}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="person-outline" size={responsive.isDesktop ? 18 : 16} color="#666" />
                  <Text style={[styles.detailText, responsive.isDesktop && styles.detailTextDesktop]}>
                    {appointment.doctor}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  // Reemplazar los estilos de los botones de filtro activos para mejorar el contraste
  const getFilterButtonStyle = (filterType) => {
    const isActive = activeFilter === filterType

    // Usar un enfoque diferente para los botones activos
    // Mantenemos el texto oscuro pero cambiamos otros elementos visuales
    return {
      button: [
        styles.filterButton,
        isActive && styles.filterButtonActive,
        filterType === "psychology" && isActive && styles.filterButtonPsychology,
        filterType === "nutrition" && isActive && styles.filterButtonNutrition,
        responsive.isDesktop && styles.filterButtonDesktop,
      ],
      text: [styles.filterText, isActive && styles.filterTextActive, responsive.isDesktop && styles.filterTextDesktop],
      icon: isActive ? "#333" : "#666",
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, responsive.isWeb && styles.safeAreaWeb]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={[styles.headerContainer, responsive.isDesktop && styles.headerContainerDesktop]}>
        <Header userName={user.name} screenName="Mis Citas" />
      </View>

      <View style={styles.container}>
        {/* Filtros de categoría */}
        <View style={[styles.filterContainer, responsive.isDesktop && styles.filterContainerDesktop]}>
          <TouchableOpacity style={getFilterButtonStyle("all").button} onPress={() => setActiveFilter("all")}>
            {activeFilter === "all" && <View style={styles.activeIndicator} />}
            <Text style={getFilterButtonStyle("all").text}>Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getFilterButtonStyle("psychology").button}
            onPress={() => setActiveFilter("psychology")}
          >
            {activeFilter === "psychology" && <View style={[styles.activeIndicator, styles.psychologyIndicator]} />}
            <FontAwesome5
              name="brain"
              size={responsive.isDesktop ? 12 : 14}
              color={getFilterButtonStyle("psychology").icon}
              style={styles.filterIcon}
            />
            <Text style={getFilterButtonStyle("psychology").text}>Psicología</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getFilterButtonStyle("nutrition").button}
            onPress={() => setActiveFilter("nutrition")}
          >
            {activeFilter === "nutrition" && <View style={[styles.activeIndicator, styles.nutritionIndicator]} />}
            <MaterialCommunityIcons
              name="food-apple"
              size={responsive.isDesktop ? 14 : 16}
              color={getFilterButtonStyle("nutrition").icon}
              style={styles.filterIcon}
            />
            <Text style={getFilterButtonStyle("nutrition").text}>Nutrición</Text>
          </TouchableOpacity>
        </View>

        {responsive.isDesktop ? (
          // Layout para desktop - dos columnas
          <View style={styles.contentContainerDesktop}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollViewDesktop}
              contentContainerStyle={styles.scrollContentDesktop}
            >
              {/* Botones y calendario para desktop */}
              <TouchableOpacity
                style={[styles.requestServiceButton, styles.requestServiceButtonDesktop]}
                onPress={openServiceModal}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={[styles.requestServiceButtonText, styles.requestServiceButtonTextDesktop]}>
                  Solicitar nueva cita
                </Text>
              </TouchableOpacity>

              <View style={styles.calendarActionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.todayButton,
                    {
                      backgroundColor:
                        activeFilter === "psychology"
                          ? Colors.PSICOLOGIA
                          : activeFilter === "nutrition"
                            ? Colors.NUTRICIÓN
                            : Colors.PRIMARYCOLOR,
                    },
                    styles.todayButtonDesktop,
                  ]}
                  onPress={() => {
                    const today = new Date().toISOString().split("T")[0]
                    setSelectedDate(today)
                  }}
                >
                  <Ionicons name="today-outline" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={[styles.todayButtonText, styles.todayButtonTextDesktop]}>Hoy</Text>
                </TouchableOpacity>

                {selectedDate && (
                  <TouchableOpacity
                    style={[styles.clearAllButton, styles.clearAllButtonDesktop]}
                    onPress={clearDateSelection}
                  >
                    <Ionicons name="calendar-clear-outline" size={18} color="#fff" style={styles.buttonIcon} />
                    <Text style={[styles.clearAllButtonText, styles.clearAllButtonTextDesktop]}>Ver todas</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.calendarContainer, styles.calendarContainerDesktop]}>
                <Calendar
                  current={selectedDate || new Date().toISOString().split("T")[0]}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  markingType="multi-dot"
                  theme={{
                    backgroundColor: "#fff",
                    calendarBackground: "#fff",
                    textSectionTitleColor: "#333",
                    selectedDayBackgroundColor:
                      activeFilter === "psychology"
                        ? Colors.PSICOLOGIA
                        : activeFilter === "nutrition"
                          ? Colors.NUTRICIÓN
                          : Colors.PRIMARYCOLOR,
                    selectedDayTextColor: "#fff",
                    todayTextColor: Colors.PRIMARYCOLOR,
                    dayTextColor: "#333",
                    textDisabledColor: "#d9e1e8",
                    dotColor: Colors.PRIMARYCOLOR,
                    selectedDotColor: "#fff",
                    arrowColor: Colors.PRIMARYCOLOR,
                    monthTextColor: "#333",
                    indicatorColor: Colors.PRIMARYCOLOR,
                    textDayFontFamily: "System",
                    textMonthFontFamily: "System",
                    textDayHeaderFontFamily: "System",
                    textDayFontWeight: "400",
                    textMonthFontWeight: "700",
                    textDayHeaderFontWeight: "600",
                    textDayFontSize: 18,
                    textMonthFontSize: 20,
                    textDayHeaderFontSize: 16,
                    // Corregir la deformación del día seleccionado
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
              <View style={styles.scrollPadding} />
            </ScrollView>

            <ScrollView style={styles.appointmentsScrollDesktop} showsVerticalScrollIndicator={false}>
              {renderAppointments()}
              <View style={styles.scrollPadding} />
            </ScrollView>
          </View>
        ) : (
          // Layout para móvil - una columna con scroll completo
          <ScrollView
            style={styles.mobileScrollView}
            contentContainerStyle={styles.mobileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Botones y calendario para móvil */}
            <TouchableOpacity style={styles.requestServiceButton} onPress={openServiceModal}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.requestServiceButtonText}>Solicitar nueva cita</Text>
            </TouchableOpacity>

            <View style={styles.calendarActionsContainer}>
              <TouchableOpacity
                style={[
                  styles.todayButton,
                  {
                    backgroundColor:
                      activeFilter === "psychology"
                        ? Colors.PSICOLOGIA
                        : activeFilter === "nutrition"
                          ? Colors.NUTRICIÓN
                          : Colors.PRIMARYCOLOR,
                  },
                ]}
                onPress={() => {
                  const today = new Date().toISOString().split("T")[0]
                  setSelectedDate(today)
                }}
              >
                <Ionicons name="today-outline" size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.todayButtonText}>Hoy</Text>
              </TouchableOpacity>

              {selectedDate && (
                <TouchableOpacity style={styles.clearAllButton} onPress={clearDateSelection}>
                  <Ionicons name="calendar-clear-outline" size={16} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.clearAllButtonText}>Ver todas</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate || new Date().toISOString().split("T")[0]}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                markingType="multi-dot"
                theme={{
                  backgroundColor: "#fff",
                  calendarBackground: "#fff",
                  textSectionTitleColor: "#333",
                  selectedDayBackgroundColor:
                    activeFilter === "psychology"
                      ? Colors.PSICOLOGIA
                      : activeFilter === "nutrition"
                        ? Colors.NUTRICIÓN
                        : Colors.PRIMARYCOLOR,
                  selectedDayTextColor: "#fff",
                  todayTextColor: Colors.PRIMARYCOLOR,
                  dayTextColor: "#333",
                  textDisabledColor: "#d9e1e8",
                  dotColor: Colors.PRIMARYCOLOR,
                  selectedDotColor: "#fff",
                  arrowColor: Colors.PRIMARYCOLOR,
                  monthTextColor: "#333",
                  indicatorColor: Colors.PRIMARYCOLOR,
                  textDayFontFamily: "System",
                  textMonthFontFamily: "System",
                  textDayHeaderFontFamily: "System",
                  textDayFontWeight: "400",
                  textMonthFontWeight: "700",
                  textDayHeaderFontWeight: "600",
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                  // Corregir la deformación del día seleccionado
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

            {/* Lista de citas para móvil */}
            {renderAppointments()}

            {/* Espacio adicional al final del scroll */}
            <View style={styles.scrollPadding} />
          </ScrollView>
        )}
      </View>

      {/* Modal de detalles de cita */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}

      {/* Modal de selección de servicio */}
      <ServiceSelectionModal
        visible={serviceModalVisible}
        onClose={() => setServiceModalVisible(false)}
        onConfirm={handleServiceConfirm}
      />

      {/* Modal de cierre de sesión */}
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </SafeAreaView>
  )
}

const HomeEmployee = () => {
  const navigation = useNavigation()
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const responsive = useResponsive()
  const [activeTab, setActiveTab] = useState("Citas")
  // Añadir un nuevo estado para controlar la visibilidad de la barra lateral
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Añadir una función para alternar la visibilidad de la barra lateral
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

  // Modificar el renderSidebar para incluir el botón de colapsar y la lógica de expansión/colapso
  const renderSidebar = () => {
    if (!responsive.isDesktop) return null

    return (
      <View style={[styles.sidebarContainer, !sidebarExpanded && styles.sidebarCollapsed]}>
        <View style={styles.sidebarHeader}>
          {sidebarExpanded ? (
            <>
              <Text style={styles.sidebarLogo}>Senda</Text>
              <TouchableOpacity style={styles.sidebarToggleButton} onPress={toggleSidebar}>
                <MaterialCommunityIcons name="chevron-left" size={24} color="#555" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.sidebarToggleButtonCollapsed} onPress={toggleSidebar}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#555" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={[
              styles.sidebarItem,
              activeTab === "Citas" && styles.sidebarItemActive,
              !sidebarExpanded && styles.sidebarItemCollapsed,
            ]}
            onPress={() => setActiveTab("Citas")}
          >
            <MaterialCommunityIcons
              name={activeTab === "Citas" ? "calendar-clock" : "calendar-clock-outline"}
              size={24}
              color={activeTab === "Citas" ? Colors.PRIMARYCOLOR : "#555"}
            />
            {sidebarExpanded && (
              <Text style={[styles.sidebarItemText, activeTab === "Citas" && styles.sidebarItemTextActive]}>
                Mis Citas
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sidebarItem,
              activeTab === "Documentos" && styles.sidebarItemActive,
              !sidebarExpanded && styles.sidebarItemCollapsed,
            ]}
            onPress={() => setActiveTab("Documentos")}
          >
            <MaterialCommunityIcons
              name={activeTab === "Documentos" ? "file-document-multiple" : "file-document-multiple-outline"}
              size={24}
              color={activeTab === "Documentos" ? Colors.PRIMARYCOLOR : "#555"}
            />
            {sidebarExpanded && (
              <Text style={[styles.sidebarItemText, activeTab === "Documentos" && styles.sidebarItemTextActive]}>
                Documentos
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarFooter}>
          <TouchableOpacity
            style={[styles.logoutButton, !sidebarExpanded && styles.logoutButtonCollapsed]}
            onPress={() => setLogoutModalVisible(true)}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#555" />
            {sidebarExpanded && <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Renderizar el contenido principal
  const renderContent = () => {
    if (responsive.isDesktop) {
      return (
        <View style={styles.desktopContentContainer}>
          {activeTab === "Citas" ? <AppointmentsScreen /> : <UserDoc />}
        </View>
      )
    }

    // En móvil, usamos el Tab.Navigator normal
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName
            if (route.name === "Citas") {
              iconName = focused ? "calendar-clock" : "calendar-clock-outline"
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />
            } else if (route.name === "Documentos") {
              iconName = focused ? "file-document-multiple" : "file-document-multiple-outline"
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />
            } else if (route.name === "Cerrar Sesión") {
              iconName = "logout"
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />
            }
            return null
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: "#777",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#eee",
            paddingTop: 5,
            height: Platform.OS === "ios" ? 85 : 65,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
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
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Modal de cierre de sesión */}
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {responsive.isDesktop ? (
        <View style={styles.desktopLayout}>
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  safeAreaWeb: {
    height: "100vh",
  },
  headerContainer: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingTop: Platform.OS === "android" ? 40 : Platform.OS === "web" ? 0 : 0,
  },
  headerContainerDesktop: {
    paddingVertical: 8,
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainerDesktop: {
    flexDirection: "row",
    flex: 1,
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
    padding: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  scrollViewDesktop: {
    flex: 1,
    maxWidth: "50%",
    paddingRight: 16,
  },
  scrollContentDesktop: {
    paddingBottom: 20,
  },
  appointmentsScrollDesktop: {
    flex: 1,
    padding: 16,
    maxWidth: "50%",
    paddingLeft: 16,
  },
  scrollPadding: {
    height: 40,
  },
  // Filtros
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterContainerDesktop: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomColor: "#e5e7eb",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  filterButtonDesktop: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    transition: "all 0.2s ease",
    maxWidth: 160,
  },
  activeFilterButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  activeFilterButtonPsychology: {
    backgroundColor: Colors.PSICOLOGIA,
  },
  activeFilterButtonNutrition: {
    backgroundColor: Colors.NUTRICIÓN,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  filterTextDesktop: {
    fontSize: 13,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
  },
  filterIcon: {
    marginRight: 6,
  },
  // Botones
  requestServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  requestServiceButtonDesktop: {
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease",
  },
  requestServiceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  requestServiceButtonTextDesktop: {
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: "0.3px",
  },
  calendarActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  todayButtonDesktop: {
    padding: 12,
    borderRadius: 6,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  },
  todayButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  todayButtonTextDesktop: {
    fontSize: 15,
    fontWeight: "500",
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  clearAllButtonDesktop: {
    padding: 12,
    borderRadius: 6,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  },
  clearAllButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  clearAllButtonTextDesktop: {
    fontSize: 15,
    fontWeight: "500",
  },
  buttonIcon: {
    marginRight: 8,
  },
  // Calendario
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  calendarContainerDesktop: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 24,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  // Lista de citas
  appointmentsList: {
    marginTop: 8,
  },
  appointmentsGridDesktop: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  selectedDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  selectedDateTextDesktop: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 20,
  },
  clearDateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  clearDateButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  appointmentItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentItemDesktop: {
    width: "calc(50% - 8px)",
    marginBottom: 16,
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.07)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  appointmentTitleDesktop: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeDesktop: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextDesktop: {
    fontSize: 13,
    fontWeight: "500",
  },
  appointmentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
  },
  detailTextDesktop: {
    fontSize: 15,
    color: "#4b5563",
  },
  // Estado vacío
  emptyStateContainer: {
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 16,
  },
  clearFilterButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearFilterButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Estilos específicos para móvil
  mobileScrollView: {
    flex: 1,
    width: "100%",
  },
  mobileScrollContent: {
    padding: 16,
    paddingBottom: 80, // Espacio adicional al final
  },
  // Estilos para la barra lateral en desktop
  desktopLayout: {
    flexDirection: "row",
    height: "100vh",
    width: "100%",
  },
  sidebarContainer: {
    width: 260,
    backgroundColor: "#fff",
    borderRight: "1px solid #e5e7eb",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "1px 0 5px rgba(0, 0, 0, 0.05)",
    transition: "width 0.3s ease",
  },
  sidebarCollapsed: {
    width: 70,
  },
  sidebarHeader: {
    padding: 20,
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarLogo: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.PRIMARYCOLOR,
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  sidebarItemActive: {
    backgroundColor: "#f3f4f6",
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginLeft: 12,
  },
  sidebarItemTextActive: {
    color: Colors.PRIMARYCOLOR,
    fontWeight: "600",
  },
  sidebarFooter: {
    padding: 16,
    borderTop: "1px solid #f3f4f6",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginLeft: 12,
  },
  desktopContentContainer: {
    flex: 1,
    height: "100%",
    overflow: "auto",
  },
  sidebarToggleButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#f3f4f6",
  },
  sidebarToggleButtonCollapsed: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#f3f4f6",
    alignSelf: "center",
  },
  sidebarItemCollapsed: {
    justifyContent: "center",
    padding: 12,
  },
  logoutButtonCollapsed: {
    justifyContent: "center",
    padding: 12,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 1.5,
  },
  psychologyIndicator: {
    backgroundColor: Colors.PSICOLOGIA,
  },
  nutritionIndicator: {
    backgroundColor: Colors.NUTRICIÓN,
  },
  filterButtonActive: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterButtonPsychology: {
    borderColor: Colors.PSICOLOGIA,
  },
  filterButtonNutrition: {
    borderColor: Colors.NUTRICIÓN,
  },
  filterTextActive: {
    fontWeight: "700",
    color: "#333",
  },
})

export default HomeEmployee

