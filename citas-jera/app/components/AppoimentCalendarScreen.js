"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Calendar } from "react-native-calendars"
import { format, addDays, getDay, isAfter, isSameDay, parseISO, addMonths } from "date-fns"
import { es } from "date-fns/locale"
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import Colors from "@styles/colors"
import { useResponsive } from "../hooks/use-responsive"
import { db } from "../../firebaseConfig.js"
import { collection, query, where, doc, getDoc, onSnapshot } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const AppointmentCalendarScreen = ({ onClose, onConfirm, patientName, service, companyId }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [markedDates, setMarkedDates] = useState({})
  const [availableTimesForSelectedDate, setAvailableTimesForSelectedDate] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [companyHours, setCompanyHours] = useState({
    days: [],
    hours: [],
  })
  const [bookedAppointments, setBookedAppointments] = useState([])
  const responsive = useResponsive()

  // Mapeo de números de día a nombres en español
  const dayNumberToName = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
  }

  // Calcular la fecha mínima (3 días después de hoy)
  const today = new Date()
  const minDate = addDays(today, 3)
  const minDateString = format(minDate, "yyyy-MM-dd")

  // Cargar los horarios de la empresa y las citas existentes
  useEffect(() => {
    const fetchCompanyHoursAndAppointments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Obtener el ID de la empresa si no se proporcionó
        let fetchedCompanyId = companyId

        if (!fetchedCompanyId) {
          // Si no se proporcionó un companyId, intentar obtenerlo del usuario actual
          const auth = getAuth()
          const user = auth.currentUser
          if (user) {
            const userDocRef = doc(db, "users", user.uid)
            const userDocSnap = await getDoc(userDocRef)

            if (userDocSnap.exists()) {
              fetchedCompanyId = userDocSnap.data().companyId
            } else {
              throw new Error("No se encontró información del usuario")
            }
          } else {
            throw new Error("No hay usuario autenticado")
          }
        }

        // Obtener los horarios de la empresa
        const companyDocRef = doc(db, "companies", fetchedCompanyId)

        // Usar onSnapshot para escuchar cambios en los datos de la empresa
        const unsubscribeCompany = onSnapshot(
          companyDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const companyData = docSnap.data()
              setCompanyHours({
                days: companyData.days || [],
                hours: companyData.hours || [],
              })
            } else {
              setError("No se encontró información de la empresa")
            }
          },
          (error) => {
            console.error("Error listening to company data:", error)
            setError("Error al escuchar cambios en los datos de la empresa")
          },
        )

        // Obtener todas las citas confirmadas con un listener en tiempo real
        const appointmentsQuery = query(collection(db, "dates"), where("date", "!=", null))

        const unsubscribeAppointments = onSnapshot(
          appointmentsQuery,
          (snapshot) => {
            const appointments = []

            snapshot.forEach((doc) => {
              const data = doc.data()
              if (data.date) {
                const date = data.date.toDate()
                appointments.push({
                  id: doc.id,
                  date: format(date, "yyyy-MM-dd"),
                  time: format(date, "HH:mm"),
                  duration: data.duration || 60, // Duración en minutos, por defecto 60
                })
              }
            })

            setBookedAppointments(appointments)
            setIsLoading(false)
          },
          (error) => {
            console.error("Error listening to appointments:", error)
            setError("Error al escuchar cambios en las citas")
            setIsLoading(false)
          },
        )

        // Devolver una función de limpieza que cancela ambos listeners
        return () => {
          unsubscribeCompany()
          unsubscribeAppointments()
        }
      } catch (err) {
        console.error("Error fetching company hours and appointments:", err)
        setError(err.message || "Error al cargar los datos")
        setIsLoading(false)
      }
    }

    // Iniciar la carga y guardar la función de limpieza
    const unsubscribeAll = fetchCompanyHoursAndAppointments()

    // Limpiar los listeners cuando el componente se desmonte
    return () => {
      if (typeof unsubscribeAll === "function") {
        unsubscribeAll()
      }
    }
  }, [companyId])

  // Función para verificar si un día de la semana está disponible
  const isDayAvailable = (date) => {
    const day = getDay(date)
    return companyHours.days.includes(day)
  }

  // Función para verificar si una fecha es válida (día disponible y después de minDate)
  const isValidDate = (date) => {
    return isDayAvailable(date) && (isAfter(date, minDate) || isSameDay(date, minDate))
  }

  // Función para verificar si un horario específico está disponible (no hay conflictos con otras citas)
  const isTimeSlotAvailable = (dateString, timeString) => {
    // Convertir el horario seleccionado a minutos desde el inicio del día
    const [hours, minutes] = timeString.split(":").map(Number)
    const selectedTimeInMinutes = hours * 60 + minutes

    // Duración estándar de la cita (60 minutos)
    const duration = 60
    const selectedEndTimeInMinutes = selectedTimeInMinutes + duration

    // Verificar si hay alguna cita que se solape con este horario
    return !bookedAppointments.some((appointment) => {
      if (appointment.date !== dateString) return false

      const [appHours, appMinutes] = appointment.time.split(":").map(Number)
      const appTimeInMinutes = appHours * 60 + appMinutes
      const appEndTimeInMinutes = appTimeInMinutes + (appointment.duration || 60)

      // Hay conflicto si:
      // 1. El inicio de la nueva cita está dentro de una cita existente
      // 2. El fin de la nueva cita está dentro de una cita existente
      // 3. La nueva cita engloba completamente una cita existente
      return (
        (selectedTimeInMinutes >= appTimeInMinutes && selectedTimeInMinutes < appEndTimeInMinutes) ||
        (selectedEndTimeInMinutes > appTimeInMinutes && selectedEndTimeInMinutes <= appEndTimeInMinutes) ||
        (selectedTimeInMinutes <= appTimeInMinutes && selectedEndTimeInMinutes >= appEndTimeInMinutes)
      )
    })
  }

  // Función para verificar si una fecha tiene todos los horarios reservados
  const isFullyBooked = (dateString) => {
    // Si no hay horarios de empresa configurados, no podemos determinar
    if (!companyHours.hours || companyHours.hours.length === 0) return true

    // Verificar si hay al menos un horario disponible
    return !companyHours.hours.some((time) => isTimeSlotAvailable(dateString, time))
  }

  // Función para obtener los horarios disponibles para una fecha
  const getAvailableTimesForDate = (dateString) => {
    // Si no hay horarios de empresa configurados, devolver array vacío
    if (!companyHours.hours || companyHours.hours.length === 0) return []

    // Filtrar los horarios que están disponibles (no hay conflictos)
    return companyHours.hours.filter((time) => isTimeSlotAvailable(dateString, time))
  }

  // Función para generar las fechas marcadas en el calendario
  useEffect(() => {
    const generateMarkedDates = () => {
      const marked = {}

      // Marcar la fecha seleccionada
      if (selectedDate) {
        marked[selectedDate] = {
          selected: true,
          selectedColor: Colors.PRIMARYCOLOR,
        }
      }

      // Marcar los próximos 3 meses de fechas disponibles
      const startDate = minDate
      const endDate = addMonths(today, 3)

      let currentDate = startDate
      while (currentDate <= endDate) {
        const dateString = format(currentDate, "yyyy-MM-dd")

        if (isValidDate(currentDate)) {
          // Verificar si la fecha está completamente reservada
          if (isFullyBooked(dateString)) {
            // Fecha completamente reservada
            marked[dateString] = {
              ...marked[dateString],
              disabled: true,
              disableTouchEvent: true,
              textColor: "#d9e1e8",
              // Mejorar la indicación visual de fechas reservadas
              marked: true,
              dotColor: "red",
              // Añadir un círculo rojo alrededor de la fecha
              customStyles: {
                container: {
                  borderWidth: 1,
                  borderColor: "#ffcccc",
                  backgroundColor: "#fff8f8",
                },
              },
            }
          } else {
            // Es un día disponible (día en availableDays después de minDate)
            marked[dateString] = {
              ...marked[dateString],
              marked: true,
              dotColor: Colors.PRIMARYCOLOR,
              activeOpacity: 1,
            }
          }
        } else {
          // No es un día disponible
          marked[dateString] = {
            ...marked[dateString],
            disabled: true,
            disableTouchEvent: true,
            textColor: "#d9e1e8",
          }
        }

        // Avanzar al siguiente día
        currentDate = addDays(currentDate, 1)
      }

      return marked
    }

    // Solo generar las fechas marcadas si ya tenemos los datos de la empresa
    if (!isLoading && companyHours.days.length > 0) {
      setMarkedDates(generateMarkedDates())
    }
  }, [selectedDate, companyHours, bookedAppointments, isLoading])

  // Función para manejar la selección de fecha
  const handleDateSelect = (date) => {
    const selectedDateObj = parseISO(date.dateString)

    // Solo procesar la selección si es un día válido y no está completamente reservado
    if (isValidDate(selectedDateObj) && !isFullyBooked(date.dateString)) {
      setSelectedDate(date.dateString)
      setSelectedTime(null) // Resetear la hora seleccionada

      // Actualizar los horarios disponibles para esta fecha
      const availableTimes = getAvailableTimesForDate(date.dateString)
      setAvailableTimesForSelectedDate(availableTimes)
    }
    // No mostrar alertas si el día no es válido, simplemente ignorar la selección
  }

  // Función para manejar la selección de hora
  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const handleTimeSelectWithFeedback = (time) => {
    setSelectedTime(time)
  }

  // Función para confirmar la cita
  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      alert("Por favor, selecciona una fecha y hora")
      return
    }

    // Crear objeto de fecha con la fecha y hora seleccionadas
    const [year, month, day] = selectedDate.split("-")
    const [hours, minutes] = selectedTime.split(":")

    const appointmentDate = new Date(year, month - 1, day, hours, minutes)

    if (onConfirm) {
      onConfirm(appointmentDate)
    }
  }

  // Función para formatear la fecha en español
  const formatDateToSpanish = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
  }

  // Función para obtener el nombre del día de la semana
  const getDayName = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const day = getDay(date)

    return dayNumberToName[day]
  }

  // Generar texto de días disponibles para las instrucciones
  const getAvailableDaysText = () => {
    return companyHours.days.map((day) => dayNumberToName[day]).join(", ")
  }

  // Actualizar los horarios disponibles cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      const availableTimes = getAvailableTimesForDate(selectedDate)
      setAvailableTimesForSelectedDate(availableTimes)
    }
  }, [selectedDate, bookedAppointments])

  // Renderizar pantalla de carga
  if (isLoading) {
    return (
      <View style={[styles.mainContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
        <Text style={styles.loadingText}>Cargando horarios disponibles...</Text>
      </View>
    )
  }

  // Renderizar pantalla de error
  if (error) {
    return (
      <View style={[styles.mainContainer, styles.errorContainer]}>
        <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onClose}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Ordenar los horarios disponibles para mostrarlos cronológicamente
  const sortedAvailableTimes = [...availableTimesForSelectedDate].sort((a, b) => {
    const [aHours, aMinutes] = a.split(":").map(Number)
    const [bHours, bMinutes] = b.split(":").map(Number)

    const aMinutesTotal = aHours * 60 + aMinutes
    const bMinutesTotal = bHours * 60 + bMinutes

    return aMinutesTotal - bMinutesTotal
  })

  return (
    <View style={[styles.mainContainer, responsive.isWeb && styles.mainContainerWeb]}>
      <StatusBar backgroundColor={Colors.PRIMARYCOLOR} barStyle="light-content" />

      <View style={[styles.header, responsive.isDesktop && styles.headerDesktop]}>
        <TouchableOpacity
          style={[styles.backButton, responsive.isDesktop && styles.backButtonDesktop]}
          onPress={onClose}
        >
          <Ionicons name="arrow-back" size={responsive.isDesktop ? 28 : 24} color="white" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, responsive.isDesktop && styles.headerTitleDesktop]}>Programar Cita</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[styles.contentWrapper, responsive.isDesktop && styles.contentWrapperDesktop]}>
        {responsive.isDesktop ? (
          // Layout para desktop - dos columnas
          <View style={styles.desktopLayout}>
            <View style={styles.desktopLeftColumn}>
              {/* Información del paciente */}
              <View style={[styles.patientInfoContainer, styles.patientInfoContainerDesktop]}>
                <Text style={[styles.patientName, styles.patientNameDesktop]}>{patientName}</Text>
                <View style={styles.serviceContainer}>
                  {service === "Psicología" ? (
                    <FontAwesome5 name="brain" size={20} color={Colors.PRIMARYCOLOR} />
                  ) : (
                    <Ionicons name="nutrition" size={22} color={Colors.PRIMARYCOLOR} />
                  )}
                  <Text style={[styles.serviceText, styles.serviceTextDesktop]}>{service}</Text>
                </View>
              </View>

              {/* Instrucciones */}
              <View style={[styles.instructionsContainer, styles.instructionsContainerDesktop]}>
                <Text style={[styles.instructionsTitle, styles.instructionsTitleDesktop]}>
                  Selecciona una fecha y hora
                </Text>
                <Text style={[styles.instructionsText, styles.instructionsTextDesktop]}>
                  • Solo puedes seleccionar: {getAvailableDaysText()}
                  {"\n"}• Solo puedes seleccionar fechas a partir de 3 días después de hoy{"\n"}• Las fechas con punto
                  rojo están completamente reservadas
                </Text>
                <Text style={[styles.instructionsNote, styles.instructionsNoteDesktop]}>
                  Los días disponibles están marcados con un punto verde
                </Text>
              </View>

              {/* Horarios de la empresa */}
              <View style={[styles.businessHoursContainer, styles.businessHoursContainerDesktop]}>
                <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>Horarios disponibles</Text>
                <View style={styles.businessHoursContent}>
                  <View style={styles.businessHoursItem}>
                    <MaterialIcons name="access-time" size={20} color={Colors.PRIMARYCOLOR} />
                    <Text style={styles.businessHoursText}>Horarios: {companyHours.hours.join(", ")}</Text>
                  </View>
                  <View style={styles.businessHoursItem}>
                    <MaterialIcons name="event-available" size={20} color={Colors.PRIMARYCOLOR} />
                    <Text style={styles.businessHoursText}>Días: {getAvailableDaysText()}</Text>
                  </View>
                </View>
              </View>

              {/* Calendario */}
              <View style={[styles.calendarContainer, styles.calendarContainerDesktop]}>
                <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>Fecha</Text>
                <Calendar
                  minDate={minDateString}
                  onDayPress={handleDateSelect}
                  markedDates={markedDates}
                  firstDay={1} // Semana comienza en lunes
                  disableAllTouchEventsForDisabledDays={true}
                  theme={{
                    calendarBackground: "white",
                    textSectionTitleColor: Colors.TEXTCOLOR,
                    selectedDayBackgroundColor: Colors.PRIMARYCOLOR,
                    selectedDayTextColor: "white",
                    todayTextColor: Colors.PRIMARYCOLOR,
                    dayTextColor: Colors.TEXTCOLOR,
                    textDisabledColor: "#d9e1e8",
                    dotColor: Colors.PRIMARYCOLOR,
                    selectedDotColor: "white",
                    arrowColor: Colors.PRIMARYCOLOR,
                    monthTextColor: Colors.TEXTCOLOR,
                    indicatorColor: Colors.PRIMARYCOLOR,
                    textDayFontWeight: "300",
                    textMonthFontWeight: "bold",
                    textDayHeaderFontWeight: "500",
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                    // Corregir la deformación del día seleccionado
                    "stylesheet.day.basic": {
                      base: {
                        width: 40,
                        height: 40,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 20,
                      },
                      selected: {
                        borderRadius: 20,
                      },
                    },
                  }}
                />
              </View>
            </View>

            <View style={styles.desktopRightColumn}>
              {/* Selección de hora */}
              <View style={[styles.timeSelectionContainer, styles.timeSelectionContainerDesktop]}>
                <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>Hora</Text>

                {selectedDate ? (
                  <>
                    <Text style={[styles.selectedDateText, styles.selectedDateTextDesktop]}>
                      {formatDateToSpanish(selectedDate)} ({getDayName(selectedDate)})
                    </Text>

                    <View style={styles.timeButtonsContainerDesktop}>
                      {/* Mostrar todos los horarios disponibles */}
                      {sortedAvailableTimes.length > 0 ? (
                        sortedAvailableTimes.map((time) => (
                          <TouchableOpacity
                            key={time}
                            style={[
                              styles.timeButton,
                              styles.timeButtonDesktop,
                              selectedTime === time && styles.selectedTimeButton,
                            ]}
                            onPress={() => handleTimeSelect(time)}
                          >
                            <Text
                              style={[
                                styles.timeButtonText,
                                styles.timeButtonTextDesktop,
                                selectedTime === time && styles.selectedTimeText,
                              ]}
                            >
                              {time}
                            </Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.noTimesContainer}>
                          <MaterialIcons name="event-busy" size={24} color="#ff6b6b" />
                          <Text style={styles.noTimesText}>No hay horarios disponibles para esta fecha</Text>
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <View style={styles.noDateSelectedContainer}>
                    <Ionicons name="calendar-outline" size={48} color="#ccc" />
                    <Text style={styles.noDateSelectedText}>
                      Selecciona una fecha para ver los horarios disponibles
                    </Text>
                  </View>
                )}
              </View>

              {/* Botón de confirmar para desktop */}
              <View style={styles.footerDesktop}>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    styles.confirmButtonDesktop,
                    (!selectedDate || !selectedTime) && styles.disabledButton,
                  ]}
                  onPress={handleConfirm}
                  disabled={!selectedDate || !selectedTime}
                >
                  <Text style={[styles.confirmButtonText, styles.confirmButtonTextDesktop]}>Confirmar Cita</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // Layout para móvil - una columna con scroll completo
          <ScrollView
            style={styles.mobileScrollView}
            contentContainerStyle={styles.mobileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Información del paciente */}
            <View style={styles.patientInfoContainer}>
              <Text style={styles.patientName}>{patientName}</Text>
              <View style={styles.serviceContainer}>
                {service === "Psicología" ? (
                  <FontAwesome5 name="brain" size={18} color={Colors.PRIMARYCOLOR} />
                ) : (
                  <Ionicons name="nutrition" size={20} color={Colors.PRIMARYCOLOR} />
                )}
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            </View>

            {/* Instrucciones */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Selecciona una fecha y hora</Text>
              <Text style={styles.instructionsText}>
                • Solo puedes seleccionar: {getAvailableDaysText()}
                {"\n"}• Solo puedes seleccionar fechas a partir de 3 días después de hoy{"\n"}• Las fechas con punto
                rojo están completamente reservadas
              </Text>
              <Text style={styles.instructionsNote}>Los días disponibles están marcados con un punto verde</Text>
            </View>

            {/* Horarios de la empresa */}
            <View style={styles.businessHoursContainer}>
              <Text style={styles.sectionTitle}>Horarios disponibles</Text>
              <View style={styles.businessHoursContent}>
                <View style={styles.businessHoursItem}>
                  <MaterialIcons name="access-time" size={18} color={Colors.PRIMARYCOLOR} />
                  <Text style={styles.businessHoursText}>Horarios: {companyHours.hours.join(", ")}</Text>
                </View>
                <View style={styles.businessHoursItem}>
                  <MaterialIcons name="event-available" size={18} color={Colors.PRIMARYCOLOR} />
                  <Text style={styles.businessHoursText}>Días: {getAvailableDaysText()}</Text>
                </View>
              </View>
            </View>

            {/* Calendario */}
            <View style={styles.calendarContainer}>
              <Text style={styles.sectionTitle}>Fecha</Text>
              <Calendar
                minDate={minDateString}
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                firstDay={1} // Semana comienza en lunes
                disableAllTouchEventsForDisabledDays={true}
                theme={{
                  calendarBackground: "white",
                  textSectionTitleColor: Colors.TEXTCOLOR,
                  selectedDayBackgroundColor: Colors.PRIMARYCOLOR,
                  selectedDayTextColor: "white",
                  todayTextColor: Colors.PRIMARYCOLOR,
                  dayTextColor: Colors.TEXTCOLOR,
                  textDisabledColor: "#d9e1e8",
                  dotColor: Colors.PRIMARYCOLOR,
                  selectedDotColor: "white",
                  arrowColor: Colors.PRIMARYCOLOR,
                  monthTextColor: Colors.TEXTCOLOR,
                  indicatorColor: Colors.PRIMARYCOLOR,
                  textDayFontWeight: "300",
                  textMonthFontWeight: "bold",
                  textDayHeaderFontWeight: "500",
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
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

            {/* Selección de hora */}
            {selectedDate && (
              <View style={styles.timeSelectionContainer}>
                <Text style={styles.sectionTitle}>Hora</Text>
                <Text style={styles.selectedDateText}>
                  {formatDateToSpanish(selectedDate)} ({getDayName(selectedDate)})
                </Text>

                <View style={styles.timeButtonsContainer}>
                  {/* Mostrar todos los horarios disponibles */}
                  {sortedAvailableTimes.length > 0 ? (
                    sortedAvailableTimes.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeButton, selectedTime === time && styles.selectedTimeButton]}
                        onPress={() => handleTimeSelect(time)}
                      >
                        <Text style={[styles.timeButtonText, selectedTime === time && styles.selectedTimeText]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.noTimesContainer}>
                      <MaterialIcons name="event-busy" size={24} color="#ff6b6b" />
                      <Text style={styles.noTimesText}>No hay horarios disponibles para esta fecha</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Espacio adicional al final del scroll */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      </View>

      {/* Botón de confirmar para móvil */}
      {!responsive.isDesktop && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, (!selectedDate || !selectedTime) && styles.disabledButton]}
            onPress={handleConfirm}
            disabled={!selectedDate || !selectedTime}
          >
            <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  mainContainerWeb: {
    height: "100vh",
    width: "100%",
  },
  header: {
    backgroundColor: Colors.PRIMARYCOLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : Platform.OS === "web" ? 20 : 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerDesktop: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 5,
  },
  backButtonDesktop: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTitleDesktop: {
    fontSize: 22,
    fontWeight: "600",
  },
  placeholder: {
    width: 24,
  },
  contentWrapper: {
    flex: 1,
    position: "relative",
  },
  contentWrapperDesktop: {
    padding: 24,
  },
  // Estilos para desktop
  desktopLayout: {
    flexDirection: "row",
    maxWidth: 1200,
    margin: "0 auto",
    height: "calc(100vh - 120px)",
  },
  desktopLeftColumn: {
    flex: 1,
    marginRight: 24,
    overflow: "auto",
    paddingRight: 16,
  },
  desktopRightColumn: {
    flex: 1,
    marginLeft: 24,
    display: "flex",
    flexDirection: "column",
  },
  // Estilos para móvil
  mobileScrollView: {
    flex: 1,
    width: "100%",
  },
  mobileScrollContent: {
    padding: 16,
    paddingBottom: 80, // Espacio adicional al final
  },
  // Información del paciente
  patientInfoContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientInfoContainerDesktop: {
    padding: 24,
    borderRadius: 10,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
    marginBottom: 24,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXTCOLOR,
    marginBottom: 8,
  },
  patientNameDesktop: {
    fontSize: 22,
    marginBottom: 12,
  },
  serviceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceText: {
    fontSize: 16,
    color: Colors.PRIMARYCOLOR,
    marginLeft: 6,
  },
  serviceTextDesktop: {
    fontSize: 18,
    marginLeft: 8,
  },
  // Instrucciones
  instructionsContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.PRIMARYCOLOR,
  },
  instructionsContainerDesktop: {
    padding: 24,
    borderRadius: 10,
    marginBottom: 24,
    borderLeftWidth: 6,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.TEXTCOLOR,
    marginBottom: 8,
  },
  instructionsTitleDesktop: {
    fontSize: 18,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.SECONDARYCOLOR,
    lineHeight: 20,
    marginBottom: 8,
  },
  instructionsTextDesktop: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  instructionsNote: {
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.PRIMARYCOLOR,
  },
  instructionsNoteDesktop: {
    fontSize: 15,
  },
  // Horarios de la empresa
  businessHoursContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHoursContainerDesktop: {
    padding: 24,
    borderRadius: 10,
    marginBottom: 24,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  businessHoursContent: {
    marginTop: 8,
  },
  businessHoursItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  businessHoursText: {
    fontSize: 15,
    color: Colors.TEXTCOLOR,
    marginLeft: 10,
  },
  // Calendario
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarContainerDesktop: {
    padding: 24,
    borderRadius: 10,
    marginBottom: 24,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.TEXTCOLOR,
    marginBottom: 12,
  },
  sectionTitleDesktop: {
    fontSize: 18,
    marginBottom: 16,
  },
  // Selección de hora
  timeSelectionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSelectionContainerDesktop: {
    padding: 24,
    borderRadius: 10,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  selectedDateText: {
    fontSize: 14,
    color: Colors.SECONDARYCOLOR,
    marginBottom: 16,
    fontStyle: "italic",
  },
  selectedDateTextDesktop: {
    fontSize: 16,
    marginBottom: 20,
  },
  timeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  timeButtonsContainerDesktop: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 16,
  },
  timeButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    width: "30%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 10,
    marginHorizontal: "1.5%",
  },
  timeButtonDesktop: {
    width: "calc(33.33% - 16px)",
    padding: 16,
    marginHorizontal: 0,
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  selectedTimeButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  timeButtonText: {
    fontSize: 16,
    color: Colors.TEXTCOLOR,
    fontWeight: "500",
  },
  timeButtonTextDesktop: {
    fontSize: 18,
  },
  selectedTimeText: {
    color: "white",
  },
  noTimesText: {
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
    fontStyle: "italic",
    textAlign: "center",
    width: "100%",
    marginTop: 10,
  },
  noTimesTextDesktop: {
    fontSize: 18,
    marginTop: 20,
  },
  noDateSelectedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    height: "100%",
  },
  noDateSelectedText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    maxWidth: 300,
  },
  bottomPadding: {
    height: 40, // Espacio adicional al final del ScrollView
  },
  // Botón de confirmar
  footer: {
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerDesktop: {
    marginTop: "auto",
    padding: 24,
  },
  confirmButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  confirmButtonDesktop: {
    padding: 18,
    borderRadius: 8,
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButtonTextDesktop: {
    fontSize: 18,
  },
  // Estilos para estados de carga y error
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  errorContainer: {
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
  noTimesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8f8",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b6b",
    width: "100%",
  },
  noTimesText: {
    fontSize: 16,
    color: "#555",
    fontStyle: "italic",
    marginLeft: 8,
    flex: 1,
  },
  noTimesTextDesktop: {
    fontSize: 18,
  },
})

export default AppointmentCalendarScreen
