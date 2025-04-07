// AppointmentsScreen.js - Updated to match the reference design
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@components/HeaderAdmin.js';
import Colors from '@styles/colors';
import AppointmentModalAdmin from '@components/AppointmentModalAdmin';
import { useResponsive } from '../../hooks/use-responsive';

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
  },
  {
    id: "4",
    employee: "Juan Pérez",
    date: "2025-04-10",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
  },
  {
    id: "5",
    employee: "Juan Pérez",
    date: "2025-04-10",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
  },
  {
    id: "6",
    employee: "Juan Pérez",
    date: "2025-04-10",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
  },
  {
    id: "7",
    employee: "Juan Pérez",
    date: "2025-04-10",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
  },
  {
    id: "8",
    employee: "Juan Pérez",
    date: "2025-04-10",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
  },
  {
    id: "9",
    employee: "Juan Pérez",
    date: "2025-04-10",
    time: "16:30",
    category: "psychology",
    phone: "123-456-7890",
    title: "Terapia Cognitiva",
    client: "Laura Martínez",
    status: "pending",
  },
];

// Función para formatear la fecha en formato dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const AppointmentsScreen = () => {
  // Estados
  const [filter, setFilter] = useState("all");
  const [appointments] = useState(APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const responsive = useResponsive();

  // Preparar las fechas marcadas en el calendario
  useEffect(() => {
    const marked = {};

    // Agrupar citas por fecha
    const appointmentsByDate = {};
    appointments.forEach((appointment) => {
      if (!appointmentsByDate[appointment.date]) {
        appointmentsByDate[appointment.date] = [];
      }
      appointmentsByDate[appointment.date].push(appointment);
    });

    // Crear marcas para cada fecha
    Object.entries(appointmentsByDate).forEach(([date, dateAppointments]) => {
      // Verificar si hay citas de psicología y nutrición en esta fecha
      const hasPsychology = dateAppointments.some((app) => app.category === "psychology");
      const hasNutrition = dateAppointments.some((app) => app.category === "nutrition");

      // Si hay ambos tipos, usar dots
      if (hasPsychology && hasNutrition) {
        marked[date] = {
          dots: [
            { key: "psychology", color: Colors.PRIMARYCOLOR },
            { key: "nutrition", color: Colors.SECONDARYCOLOR },
          ],
          marked: true,
        };
      }
      // Si solo hay un tipo, usar un solo dot
      else {
        const dotColor = hasPsychology ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR;
        marked[date] = {
          dots: [{ key: "single", color: dotColor }],
          marked: true,
        };
      }

      // Si esta fecha está seleccionada, añadir propiedad selected
      if (date === selectedDate) {
        marked[date] = {
          ...marked[date],
          selected: true,
          selectedColor: 
            filter === "psychology" 
              ? Colors.PRIMARYCOLOR 
              : filter === "nutrition" 
                ? Colors.SECONDARYCOLOR 
                : Colors.PRIMARYCOLOR,
        };
      }
    });

    // Si la fecha seleccionada no tiene citas, asegurarse de que esté marcada como seleccionada
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: 
          filter === "psychology" 
            ? Colors.PRIMARYCOLOR 
            : filter === "nutrition" 
              ? Colors.SECONDARYCOLOR 
              : Colors.PRIMARYCOLOR,
      };
    }

    setMarkedDates(marked);
  }, [appointments, selectedDate, filter]);

  // Función para manejar la selección de un día en el calendario
  const onDayPress = (day) => {
    // Si la fecha seleccionada es la misma que ya está seleccionada, la deseleccionamos
    if (day.dateString === selectedDate) {
      setSelectedDate("");
    } else {
      setSelectedDate(day.dateString);
    }
  };

  // Función para limpiar la selección de fecha
  const clearDateSelection = () => {
    setSelectedDate("");
  };

  // Filtrar citas según el filtro activo y la fecha seleccionada
  const getFilteredAppointments = () => {
    return appointments.filter((appointment) => {
      const matchesFilter = filter === "all" || appointment.category === filter;
      const matchesDate = !selectedDate || appointment.date === selectedDate;
      return matchesFilter && matchesDate;
    });
  };

  // Obtener estilos para botones de filtro
  const getFilterButtonStyle = (filterType) => {
    const isActive = filter === filterType;
    
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
    };
  };

  // Renderizar las citas filtradas
  const renderAppointments = () => {
    const filteredAppointments = getFilteredAppointments();

    if (selectedDate && filteredAppointments.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.noAppointmentsText}>No hay citas para esta fecha</Text>
          <TouchableOpacity style={styles.clearFilterButton} onPress={clearDateSelection}>
            <Text style={styles.clearFilterButtonText}>Ver todas las citas</Text>
          </TouchableOpacity>
        </View>
      );
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
                { borderLeftColor: appointment.category === "psychology" ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR },
                responsive.isDesktop && styles.appointmentItemDesktop,
              ]}
              onPress={() => setSelectedAppointment(appointment)}
            >
              <View style={styles.appointmentHeader}>
                <Text style={[styles.appointmentTitle, responsive.isDesktop && styles.appointmentTitleDesktop]}>
                  {appointment.title}
                </Text>
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        appointment.category === "psychology" ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR,
                    },
                    responsive.isDesktop && styles.categoryBadgeDesktop,
                  ]}
                >
                  <Text style={[styles.categoryText, responsive.isDesktop && styles.categoryTextDesktop]}>
                    {appointment.category === "psychology" ? "Psicología" : "Nutrición"}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={responsive.isDesktop ? 18 : 16} color="#666" />
                    <Text style={[styles.detailText, responsive.isDesktop && styles.detailTextDesktop]}>
                      {appointment.client}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={responsive.isDesktop ? 18 : 16} color="#666" />
                    <Text style={[styles.detailText, responsive.isDesktop && styles.detailTextDesktop]}>
                      {appointment.time}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="medical-outline" size={responsive.isDesktop ? 18 : 16} color="#666" />
                    <Text style={[styles.detailText, responsive.isDesktop && styles.detailTextDesktop]}>
                      {appointment.employee}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="call-outline" size={responsive.isDesktop ? 18 : 16} color="#666" />
                    <Text style={[styles.detailText, responsive.isDesktop && styles.detailTextDesktop]}>
                      {appointment.phone}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: appointment.status === "confirmed" ? "#4CAF50" : "#FFC107" },
                    ]}
                  />
                  <Text style={[styles.statusText, responsive.isDesktop && styles.statusTextDesktop]}>
                    {appointment.status === "confirmed" ? "Confirmada" : "Pendiente"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, responsive.isWeb && styles.safeAreaWeb]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <View style={[styles.headerContainer, responsive.isDesktop && styles.headerContainerDesktop]}>
        <Header header_text="Citas" />
      </View>

      <View style={styles.container}>
        {/* Título de la sección */}
        <View style={[styles.titleContainer, responsive.isDesktop && styles.titleContainerDesktop]}>
          <Text style={[styles.screenTitle, responsive.isDesktop && styles.screenTitleDesktop]}>
            Calendario de Citas
          </Text>
        </View>

        {/* Filtros */}
        <View style={[styles.filterContainer, responsive.isDesktop && styles.filterContainerDesktop]}>
          <TouchableOpacity style={getFilterButtonStyle("all").button} onPress={() => setFilter("all")}>
            {filter === "all" && <View style={styles.activeIndicator} />}
            <Text style={getFilterButtonStyle("all").text}>Todas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={getFilterButtonStyle("psychology").button} onPress={() => setFilter("psychology")}>
            {filter === "psychology" && <View style={[styles.activeIndicator, styles.psychologyIndicator]} />}
            <FontAwesome5
              name="brain"
              size={responsive.isDesktop ? 12 : 14}
              color={getFilterButtonStyle("psychology").icon}
              style={styles.filterIcon}
            />
            <Text style={getFilterButtonStyle("psychology").text}>Psicología</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={getFilterButtonStyle("nutrition").button} onPress={() => setFilter("nutrition")}>
            {filter === "nutrition" && <View style={[styles.activeIndicator, styles.nutritionIndicator]} />}
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
              <View style={styles.calendarActionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.todayButton,
                    {
                      backgroundColor:
                        filter === "psychology"
                          ? Colors.PRIMARYCOLOR
                          : filter === "nutrition"
                            ? Colors.SECONDARYCOLOR
                            : Colors.PRIMARYCOLOR,
                    },
                    styles.todayButtonDesktop,
                  ]}
                  onPress={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setSelectedDate(today);
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
                  onDayPress={onDayPress}
                  markedDates={markedDates}
                  markingType="multi-dot"
                  theme={{
                    backgroundColor: "#fff",
                    calendarBackground: "#fff",
                    textSectionTitleColor: "#333",
                    selectedDayBackgroundColor: 
                      filter === "psychology"
                        ? Colors.PRIMARYCOLOR
                        : filter === "nutrition"
                          ? Colors.SECONDARYCOLOR
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
            <View style={styles.calendarActionsContainer}>
              <TouchableOpacity
                style={[
                  styles.todayButton,
                  {
                    backgroundColor:
                      filter === "psychology"
                        ? Colors.PRIMARYCOLOR
                        : filter === "nutrition"
                          ? Colors.SECONDARYCOLOR
                          : Colors.PRIMARYCOLOR,
                  },
                ]}
                onPress={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setSelectedDate(today);
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
                onDayPress={onDayPress}
                markedDates={markedDates}
                markingType="multi-dot"
                theme={{
                  backgroundColor: "#fff",
                  calendarBackground: "#fff",
                  textSectionTitleColor: "#333",
                  selectedDayBackgroundColor: 
                    filter === "psychology"
                      ? Colors.PRIMARYCOLOR
                      : filter === "nutrition"
                        ? Colors.SECONDARYCOLOR
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

      {/* Modal para mostrar los detalles de la cita seleccionada */}
      <AppointmentModalAdmin
        appointment={selectedAppointment}
        visible={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </SafeAreaView>
  );
};

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
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleContainerDesktop: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottom: "1px solid #e5e7eb",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  screenTitleDesktop: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1f2937",
  },
  contentContainerDesktop: {
    flexDirection: "row",
    flex: 1,
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
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
    position: "relative",
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
  filterButtonActive: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterButtonPsychology: {
    borderColor: Colors.PRIMARYCOLOR,
  },
  filterButtonNutrition: {
    borderColor: Colors.SECONDARYCOLOR,
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
  filterTextActive: {
    fontWeight: "700",
    color: "#333",
  },
  filterIcon: {
    marginRight: 6,
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
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  nutritionIndicator: {
    backgroundColor: Colors.SECONDARYCOLOR,
  },
  // Botones del calendario
  calendarActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
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
    marginHorizontal: 16,
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
    marginHorizontal: 0,
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
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  statusTextDesktop: {
    fontSize: 13,
    color: "#4b5563",
  },
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
    marginTop: 12,
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
  scrollPadding: {
    height: 40,
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
});

export default AppointmentsScreen;