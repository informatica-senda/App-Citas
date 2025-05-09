"use client"

// AppointmentsScreen.js - Updated to match the HomeUser design
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native"
import { Calendar } from "react-native-calendars"
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import Header from "@components/HeaderUser.js"
import Colors from "@styles/colors"
import AppointmentModalAdmin from "@components/AppointmentModalAdmin"

// Sample appointment data
const APPOINTMENTS = [
  {
    id: "1",
    employee: "Juan Pérez",
    date: "2025-04-10",
    time: "14:00",
    category: "psychology",
    phone: "123-456-7890",
    title: "Cita de Psicología",
    client: "María García",
    status: "confirmed",
    state: true,
  },
  {
    id: "2",
    employee: "Ana López",
    date: "2025-04-10",
    time: "14:00",
    category: "nutrition",
    phone: "098-765-4321",
    title: "Cita de Nutrición",
    client: "Carlos Rodríguez",
    status: "confirmed",
    state: true,
  },
  {
    id: "3",
    employee: "Juan Pérez",
    date: "2025-04-10",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
    state: false,
  },
  {
    id: "4",
    employee: "Juan Pérez",
    date: "2025-04-12",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
    state: false,
  },
  {
    id: "5",
    employee: "Juan Pérez",
    date: "2025-04-15",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
    state: false,
  },
  {
    id: "6",
    employee: "Ana López",
    date: "2025-04-15",
    time: "16:30",
    category: "nutrition",
    phone: "123-456-7890",
    title: "Consulta Nutricional",
    client: "Pedro Sánchez",
    status: "pending",
    state: false,
  },
  {
    id: "7",
    employee: "Juan Pérez",
    date: "2025-04-18",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
    state: false,
  },
  {
    id: "8",
    employee: "Ana López",
    date: "2025-04-18",
    time: "16:30",
    category: "nutrition",
    phone: "123-456-7890",
    title: "Consulta Nutricional",
    client: "Sofía Rodríguez",
    status: "confirmed",
    state: true,
  },
  {
    id: "9",
    employee: "Juan Pérez",
    date: "2025-04-20",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
    state: false,
  },
]

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

const AppointmentsScreen = () => {
  // Estados
  const [activeFilter, setActiveFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all") // 'all', 'confirmed', 'pending'
  const [appointments] = useState(APPOINTMENTS)
  const [selectedDate, setSelectedDate] = useState("")
  const [markedDates, setMarkedDates] = useState({})
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [listOnlyView, setListOnlyView] = useState(false) // Estado para controlar la vista

  // Get screen dimensions for responsive design
  const screenWidth = Dimensions.get("window").width
  const isDesktop = screenWidth >= 768
  const isWeb = Platform.OS === "web"

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
            { key: "nutrition", color: Colors.NUTRICIÓN },
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

  // Función para manejar la selección de fecha en el calendario
  const handleDayPress = (day) => {
    // Si la fecha seleccionada es la misma que ya está seleccionada, la deseleccionamos
    if (day.dateString === selectedDate) {
      setSelectedDate("")
    } else {
      setSelectedDate(day.dateString)
    }
  }

  // Función para limpiar la selección de fecha
  const clearDateSelection = () => {
    setSelectedDate("")
  }

  // Función para alternar entre vista completa y vista de solo lista
  const toggleViewMode = () => {
    setListOnlyView(!listOnlyView)
  }

  // Función para seleccionar una cita
  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setModalVisible(true)
  }

  // Filtrar citas según el filtro activo, la fecha seleccionada y el estado
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
              <Ionicons name="checkmark-circle" size={18} color={statusFilter === "confirmed" ? "#FFFFFF" : "#8E8E93"} />
              <Text style={[styles.iosStatusFilterText, statusFilter === "confirmed" && styles.iosStatusFilterTextActive]}>
                Confirmadas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iosStatusFilterButton,
                statusFilter === "pending" && styles.iosStatusFilterButtonPending,
              ]}
              onPress={() => setStatusFilter("pending")}
            >
              <Ionicons name="time" size={18} color={statusFilter === "pending" ? "#FFFFFF" : "#8E8E93"} />
              <Text style={[styles.iosStatusFilterText, statusFilter === "pending" && styles.iosStatusFilterTextActive]}>
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
                  : "No hay citas programadas"}
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
                  <Text style={styles.iosDetailTextCompact}>{appointment.client}</Text>
                </View>
                <View style={styles.iosDoctorRow}>
                  <Ionicons name="medical-outline" size={14} color="#8E8E93" />
                  <Text style={styles.iosDetailTextCompact}>{appointment.employee}</Text>
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

  return (
    <SafeAreaView style={styles.iosSafeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.iosHeaderContainer}>
        <Header
          userName="Administrador"
          screenName="Citas"
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
              {renderAppointmentsList()}
            </ScrollView>
          </View>
        ) : (
          // Layout para móvil o vista de solo lista - una columna con scroll completo
          <ScrollView
            style={styles.iosMobileScrollView}
            contentContainerStyle={styles.iosMobileScrollContent}
            showsVerticalScrollIndicator={false}
          >
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
            {renderAppointmentsList()}
          </ScrollView>
        )}
      </View>

      {/* Modal para mostrar los detalles de la cita seleccionada */}
      <AppointmentModalAdmin
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
    </SafeAreaView>
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
  iosPsychologyFilterActive: {
    backgroundColor: Colors.PSICOLOGIA,
    borderColor: Colors.PSICOLOGIA,
  },
  iosNutritionFilterActive: {
    backgroundColor: Colors.NUTRICIÓN,
    borderColor: Colors.NUTRICIÓN,
  },

  // Botones con estilo iOS
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
  iosTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  iosPsychologyBadge: {
    backgroundColor: Colors.PSICOLOGIA,
  },
  iosNutritionBadge: {
    backgroundColor: Colors.NUTRICIÓN,
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
})

export default AppointmentsScreen
