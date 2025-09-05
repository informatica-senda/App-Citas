"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import Colors from "@styles/colors"
import Header from "@components/HeaderAdmin.js"
import AppointmentCalendarScreen from "@components/AppoimentCalendarScreen"
import ConfirmationModal from "@components/ConfirmationModal"
import { useResponsive } from "../../hooks/use-responsive"
import { db, auth } from "../../../firebaseConfig.js"
// Modificar las importaciones para incluir onSnapshot
import { collection, query, where, doc, updateDoc, getDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore"
import { format } from "date-fns"

const RequestScreen = ({ navigation }) => {
  // Estados para manejar las solicitudes y los modales
  const [requestsData, setRequestsData] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeFilter, setActiveFilter] = useState("Todos")
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [companyId, setCompanyId] = useState(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmedRequest, setConfirmedRequest] = useState(null)
  const [isConfirming, setIsConfirming] = useState(false)
  // Estado para indicar cuando hay actualizaciones en tiempo real
  const [isUpdating, setIsUpdating] = useState(false)
  const responsive = useResponsive()

  // Obtener el usuario actual y su companyId
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = auth.currentUser
        if (user) {
          const userDocRef = doc(db, "users", user.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            setCompanyId(userData.companyId)
          } else {
            setError("No se encontró información del usuario")
          }
        } else {
          setError("No hay usuario autenticado")
        }
      } catch (err) {
        console.error("Error fetching current user:", err)
        setError("Error al obtener información del usuario")
      }
    }

    fetchCurrentUser()
  }, [])

  // Función para configurar los listeners de solicitudes en tiempo real
  const setupRequestsListeners = useCallback(() => {
    if (!companyId) return () => {}

    setIsLoading(true)
    setError(null)

    try {
      // Obtener usuarios con rol 'user' y 'externalUser' de la misma compañía
      const usersQuery = query(
        collection(db, "users"),
        where("role", "in", ["user", "externalUser"]),
      )

      // Crear un listener para la consulta de usuarios
      const unsubscribeUsers = onSnapshot(
        usersQuery,
        async (userSnapshot) => {
          const userIds = []
          const userRoles = {}

          userSnapshot.forEach((doc) => {
            userIds.push(doc.id)
            userRoles[doc.id] = doc.data().role
          })

          if (userIds.length === 0) {
            setRequestsData([])
            setIsLoading(false)
            return
          }

          // Array para almacenar todas las funciones de desuscripción
          const unsubscribeFunctions = []
          // Objeto para almacenar todas las solicitudes
          const allRequests = {}

          // Para cada usuario, configurar un listener para sus solicitudes según su rol
          for (const userId of userIds) {
            let requestsQuery

            if (userRoles[userId] === "user") {
              // Para usuarios con rol 'user', mostrar citas con fecha asignada
              requestsQuery = query(collection(db, "dates"), where("userId", "==", userId), where("date", "!=", null), where("state", "==", false))
            } else {
              // Para usuarios con rol 'externalUser', mostrar todas las citas
              requestsQuery = query(collection(db, "dates"), where("userId", "==", userId), where("state", "==", false))
            }

            const unsubscribeRequests = onSnapshot(
              requestsQuery,
              async (requestSnapshot) => {
                setIsUpdating(true)

                // Procesar los cambios en las solicitudes
                for (const change of requestSnapshot.docChanges()) {
                  const requestDoc = change.doc
                  const requestData = requestDoc.data()
                  const requestId = requestDoc.id

                  // Si la solicitud fue eliminada, eliminarla del objeto
                  if (change.type === "removed") {
                    delete allRequests[requestId]
                    continue
                  }

                  // Obtener detalles del usuario
                  const userDocRef = doc(db, "users", requestData.userId)
                  const userDocSnap = await getDoc(userDocRef)
                  const userData = userDocSnap.exists() ? userDocSnap.data() : {}

                  // Formatear la fecha y hora si existe
                  let formattedDate = null
                  let formattedTime = ""

                  if (requestData.date && typeof requestData.date.toDate === "function") {
                    const dateObj = requestData.date.toDate()
                    formattedDate = format(dateObj, "dd/MM/yyyy")
                    formattedTime = format(dateObj, "HH:mm")
                  }

                  // Guardar la solicitud en el objeto
                  allRequests[requestId] = {
                    id: requestId,
                    name: `${userData.name || ""} ${userData.lastName || ""}`.trim() || "Cliente sin nombre",
                    service:
                      requestData.service === "psychology"
                        ? "Psicología"
                        : requestData.service === "nutrition"
                          ? "Nutrición"
                          : requestData.service || "Servicio",
                    date: requestData.date ? requestData.date.toDate() : null,
                    formattedDate: formattedDate,
                    formattedTime: formattedTime,
                    message: requestData.message || "Sin mensaje",
                    phone: userData.phone || "Sin teléfono",
                    email: userData.email || "Sin email",
                    userId: requestData.userId,
                    userRole: userRoles[requestData.userId],
                    state: requestData.state,
                    // Datos originales para referencia
                    rawData: requestData,
                  }
                }

                // Actualizar el estado con todas las solicitudes
                setRequestsData(Object.values(allRequests))
                setIsLoading(false)
                setIsUpdating(false)
              },
              (error) => {
                console.error("Error listening to requests:", error)
                setError("Error al escuchar cambios en las solicitudes")
                setIsLoading(false)
                setIsUpdating(false)
              },
            )

            unsubscribeFunctions.push(unsubscribeRequests)
          }

          // Devolver una función que desuscribe todos los listeners
          return () => {
            unsubscribeFunctions.forEach((unsubscribe) => unsubscribe())
          }
        },
        (error) => {
          console.error("Error listening to users:", error)
          setError("Error al escuchar cambios en los usuarios")
          setIsLoading(false)
        },
      )

      // Devolver una función que desuscribe el listener de usuarios
      return () => {
        unsubscribeUsers()
      }
    } catch (err) {
      console.error("Error setting up request listeners:", err)
      setError("Error al configurar los listeners de solicitudes")
      setIsLoading(false)
      return () => {}
    }
  }, [companyId])

  // Configurar los listeners cuando se obtiene el companyId
  useEffect(() => {
    let unsubscribe = () => {}

    if (companyId) {
      unsubscribe = setupRequestsListeners()
    }

    // Limpiar los listeners cuando el componente se desmonte o cuando cambie companyId
    return () => {
      unsubscribe()
    }
  }, [companyId, setupRequestsListeners])

  // Efecto para filtrar las solicitudes cuando cambia el filtro o el texto de búsqueda
  useEffect(() => {
    let result = [...requestsData]

    // Aplicar filtro por servicio
    if (activeFilter !== "Todos") {
      result = result.filter((request) => request.service === activeFilter)
    }

    // Aplicar filtro por texto de búsqueda
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      result = result.filter((request) => request.name.toLowerCase().includes(searchLower))
    }

    setFilteredRequests(result)
  }, [requestsData, activeFilter, searchText])

  // Función para manejar el tap en una solicitud
  const handleRequestPress = (request) => {
    setSelectedRequest(request)
    setShowActionModal(true)
  }

  // Función para denegar/cancelar una solicitud
  const handleDeny = async () => {
    if (selectedRequest) {
      try {
        // Eliminar la cita de Firebase
        const appointmentRef = doc(db, "dates", selectedRequest.id)
        await deleteDoc(appointmentRef)

        // Cerrar el modal
        setShowActionModal(false)
        Alert.alert("Cita cancelada", `La cita de ${selectedRequest.name} ha sido cancelada.`)
        setSelectedRequest(null)

        // No es necesario actualizar el estado manualmente ya que el listener detectará el cambio
      } catch (error) {
        console.error("Error canceling appointment:", error)
        Alert.alert("Error", "No se pudo cancelar la cita. Inténtalo de nuevo.")
      }
    }
  }

  // Función para confirmar una solicitud
  const handleConfirm = () => {
    setShowActionModal(false)
    setShowCalendar(true)
  }

  // Función para confirmar directamente una cita
  const handleDirectConfirm = async () => {
    if (!selectedRequest) return

    setIsConfirming(true)

    try {
      // Actualizar el estado de la cita a confirmado
      const appointmentRef = doc(db, "dates", selectedRequest.id)
      await updateDoc(appointmentRef, {
        state: true,
      })

      // Show the confirmation modal
      setConfirmedRequest(selectedRequest)
      setShowConfirmationModal(true)

      // No es necesario actualizar el estado manualmente ya que el listener detectará el cambio
    } catch (error) {
      console.error("Error confirming appointment:", error)
      Alert.alert("Error", "No se pudo confirmar la cita. Inténtalo de nuevo.")
    } finally {
      setIsConfirming(false)
      setShowActionModal(false)
    }
  }

  // Función para manejar la selección de fecha
  const handleDateConfirm = async (date) => {
    if (selectedRequest) {
      setIsConfirming(true)

      try {
        // Check if the selected date and time conflicts with any existing appointments
        const formattedDate = format(date, "yyyy-MM-dd")
        const formattedTime = format(date, "HH:mm")

        // Query to check for existing appointments at the same time
        const appointmentsQuery = query(
          collection(db, "dates"),
          where("state", "==", true), // Only check confirmed appointments
        )

        const appointmentSnapshots = await getDocs(appointmentsQuery)
        let hasConflict = false

        // Check each appointment for conflicts
        appointmentSnapshots.forEach((doc) => {
          // Skip the current appointment being confirmed
          if (doc.id === selectedRequest.id) return

          const appointmentData = doc.data()
          if (appointmentData.date) {
            const appointmentDate = appointmentData.date.toDate()
            const appointmentFormattedDate = format(appointmentDate, "yyyy-MM-dd")
            const appointmentFormattedTime = format(appointmentDate, "HH:mm")

            // Check if date and time match
            if (appointmentFormattedDate === formattedDate && appointmentFormattedTime === formattedTime) {
              hasConflict = true
            }
          }
        })

        if (hasConflict) {
          Alert.alert(
            "Conflicto de horario",
            "Ya existe una cita programada para esta fecha y hora. Por favor, selecciona otro horario.",
            [
              {
                text: "Seleccionar otro horario",
                onPress: () => {
                  setIsConfirming(false)
                  // Keep the calendar open to select another time
                },
              },
            ],
          )
          return
        }

        // No conflict, proceed with updating the appointment
        const appointmentRef = doc(db, "dates", selectedRequest.id)
        await updateDoc(appointmentRef, {
          date: date,
          // state: true, // Commented out as per your original code
        })

        // Save the confirmed appointment for the modal
        const confirmedAppointment = {
          ...selectedRequest,
          date: date,
        }
        setConfirmedRequest(confirmedAppointment)
        setShowConfirmationModal(true)
        setShowCalendar(false)

        // No es necesario actualizar el estado manualmente ya que el listener detectará el cambio
      } catch (error) {
        console.error("Error confirming appointment with date:", error)
        Alert.alert("Error", "No se pudo confirmar la cita. Inténtalo de nuevo.")
      } finally {
        setIsConfirming(false)
      }
    }
  }

  // Función para cambiar el filtro activo
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
  }

  // Función para formatear la fecha o devolver un string vacío si es null
  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString()
  }

  // Función para renderizar cada elemento de la lista
  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.requestItem, responsive.isDesktop && styles.requestItemDesktop]}
      onPress={() => handleRequestPress(item)}
    >
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={[styles.requestName, responsive.isDesktop && styles.requestNameDesktop]}>{item.name}</Text>
        </View>
        <View style={styles.serviceContainer}>
          {item.service === "Psicología" ? (
            <FontAwesome5 name="brain" size={responsive.isDesktop ? 20 : 18} color={Colors.PRIMARYCOLOR} />
          ) : (
            <Ionicons name="nutrition" size={responsive.isDesktop ? 22 : 20} color={Colors.PRIMARYCOLOR} />
          )}
          <Text style={[styles.requestService, responsive.isDesktop && styles.requestServiceDesktop]}>
            {item.service}
          </Text>
        </View>
        {item.formattedDate && (
          <View style={styles.dateTimeContainer}>
            <Ionicons name="calendar-outline" size={16} color={Colors.SECONDARYCOLOR} />
            <Text style={styles.dateTimeText}>{item.formattedDate}</Text>
            <Ionicons name="time-outline" size={16} color={Colors.SECONDARYCOLOR} style={styles.timeIcon} />
            <Text style={styles.dateTimeText}>{item.formattedTime}</Text>
          </View>
        )}
        {responsive.isDesktop && (
          <Text style={styles.requestMessage} numberOfLines={2}>
            {item.message}
          </Text>
        )}
      </View>
      {responsive.isDesktop && (
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.requestActionButton} onPress={() => handleRequestPress(item)}>
            <Text style={styles.requestActionButtonText}>Ver detalles</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )

  // Renderizar el panel de detalles para desktop
  const renderDetailsPanel = () => {
    if (!selectedRequest) {
      return (
        <View style={styles.noSelectionContainer}>
          <MaterialIcons name="description" size={80} color="#CCCCCC" />
          <Text style={styles.noSelectionText}>Selecciona una solicitud para ver sus detalles</Text>
        </View>
      )
    }

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>Detalles de la solicitud</Text>
        </View>

        <ScrollView style={styles.detailsContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Información del paciente</Text>
            <View style={styles.detailsItem}>
              <MaterialIcons name="person" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.detailsItemText}>{selectedRequest.name}</Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="email" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.detailsItemText}>{selectedRequest.email}</Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.detailsItemText}>{selectedRequest.phone}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Información de la cita</Text>
            <View style={styles.detailsItem}>
              <MaterialIcons name="medical-services" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.detailsItemText}>Servicio: {selectedRequest.service}</Text>
            </View>
            {selectedRequest.formattedDate && (
              <>
                <View style={styles.detailsItem}>
                  <MaterialIcons name="event" size={20} color={Colors.PRIMARYCOLOR} />
                  <Text style={styles.detailsItemText}>Fecha: {selectedRequest.formattedDate}</Text>
                </View>
                <View style={styles.detailsItem}>
                  <MaterialIcons name="access-time" size={20} color={Colors.PRIMARYCOLOR} />
                  <Text style={styles.detailsItemText}>Hora: {selectedRequest.formattedTime}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Mensaje</Text>
            <View style={styles.detailsMessageContainer}>
              <Text style={styles.detailsMessage}>{selectedRequest.message}</Text>
            </View>
          </View>

          <View style={styles.detailsActions}>
            <TouchableOpacity style={[styles.detailsActionButton, styles.denyButton]} onPress={handleDeny}>
              <Text style={styles.denyButtonText}>Cancelar cita</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.detailsActionButton, styles.confirmButton]}
              onPress={handleDirectConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }

  // Si el calendario está visible, renderizamos solo el calendario a pantalla completa
  if (showCalendar && selectedRequest) {
    return (
      <AppointmentCalendarScreen
        onClose={() => setShowCalendar(false)}
        onConfirm={handleDateConfirm}
        patientName={selectedRequest.name}
        service={selectedRequest.service}
        companyId={companyId}
      />
    )
  }

  // Renderizar el estado de carga
  if (isLoading) {
    return (
      <>
        <View style={[styles.headerCitas, responsive.isDesktop && styles.headerCitasDesktop]}>
          <Header header_text={"Solicitudes"} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      </>
    )
  }

  // Renderizar el estado de error
  if (error) {
    return (
      <>
        <View style={[styles.headerCitas, responsive.isDesktop && styles.headerCitasDesktop]}>
          <Header header_text={"Solicitudes"} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true)
              setError(null)
              // Trigger a re-fetch by updating the companyId state
              setCompanyId((prev) => prev)
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  // De lo contrario, renderizamos la pantalla normal de solicitudes
  return (
    <>
      {/* Encabezado de la pantalla */}
      <View style={[styles.headerCitas, responsive.isDesktop && styles.headerCitasDesktop]}>
        <Header header_text={"Solicitudes"} />
      </View>

      {responsive.isDesktop ? (
        // Layout para desktop - dos columnas
        <View style={styles.desktopContainer}>
          <View style={styles.desktopLeftPanel}>
            {/* Barra de búsqueda */}
            <View style={[styles.searchContainer, styles.searchContainerDesktop]}>
              <Ionicons name="search" size={20} color={Colors.SECONDARYCOLOR} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { outline: "none", WebkitTapHighlightColor: "transparent" }]}
                placeholder="Buscar por nombre..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={Colors.SECONDARYCOLOR}
                className="no-highlight"
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={20} color={Colors.SECONDARYCOLOR} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Indicador de actualización en tiempo real */}
            {isUpdating && (
              <View style={styles.updatingContainer}>
                <ActivityIndicator size="small" color={Colors.PRIMARYCOLOR} />
                <Text style={styles.updatingText}>Actualizando...</Text>
              </View>
            )}

            {/* Botones de filtro */}
            <View style={[styles.filterContainer, styles.filterContainerDesktop]}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  styles.filterButtonDesktop,
                  activeFilter === "Todos" && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange("Todos")}
              >
                <Text style={[styles.filterButtonText, activeFilter === "Todos" && styles.activeFilterText]}>
                  Todos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  styles.filterButtonDesktop,
                  activeFilter === "Psicología" && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange("Psicología")}
              >
                <FontAwesome5
                  name="brain"
                  size={16}
                  color={activeFilter === "Psicología" ? "white" : Colors.PRIMARYCOLOR}
                  style={styles.filterIcon}
                />
                <Text style={[styles.filterButtonText, activeFilter === "Psicología" && styles.activeFilterText]}>
                  Psicología
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  styles.filterButtonDesktop,
                  activeFilter === "Nutrición" && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange("Nutrición")}
              >
                <Ionicons
                  name="nutrition"
                  size={18}
                  color={activeFilter === "Nutrición" ? "white" : Colors.PRIMARYCOLOR}
                  style={styles.filterIcon}
                />
                <Text style={[styles.filterButtonText, activeFilter === "Nutrición" && styles.activeFilterText]}>
                  Nutrición
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lista de solicitudes */}
            {filteredRequests.length > 0 ? (
              <FlatList
                data={filteredRequests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContainer, styles.listContainerDesktop]}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchText
                    ? `No se encontraron solicitudes para "${searchText}"`
                    : activeFilter !== "Todos"
                      ? `No hay solicitudes de ${activeFilter}`
                      : "No hay solicitudes pendientes"}
                </Text>
              </View>
            )}
          </View>

          {/* Panel de detalles (solo en desktop) */}
          <View style={styles.desktopRightPanel}>{renderDetailsPanel()}</View>
        </View>
      ) : (
        // Layout para móvil - una columna
        <View style={styles.container}>
          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.SECONDARYCOLOR} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { outline: "none", WebkitTapHighlightColor: "transparent" }]}
              placeholder="Buscar por nombre..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={Colors.SECONDARYCOLOR}
              className="no-highlight"
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={20} color={Colors.SECONDARYCOLOR} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Indicador de actualización en tiempo real */}
          {isUpdating && (
            <View style={styles.updatingContainerMobile}>
              <ActivityIndicator size="small" color={Colors.PRIMARYCOLOR} />
              <Text style={styles.updatingText}>Actualizando...</Text>
            </View>
          )}

          {/* Botones de filtro */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, activeFilter === "Todos" && styles.activeFilterButton]}
              onPress={() => handleFilterChange("Todos")}
            >
              <Text style={[styles.filterButtonText, activeFilter === "Todos" && styles.activeFilterText]}>Todos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, activeFilter === "Psicología" && styles.activeFilterButton]}
              onPress={() => handleFilterChange("Psicología")}
            >
              <FontAwesome5
                name="brain"
                size={16}
                color={activeFilter === "Psicología" ? "white" : Colors.PRIMARYCOLOR}
                style={styles.filterIcon}
              />
              <Text style={[styles.filterButtonText, activeFilter === "Psicología" && styles.activeFilterText]}>
                Psicología
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, activeFilter === "Nutrición" && styles.activeFilterButton]}
              onPress={() => handleFilterChange("Nutrición")}
            >
              <Ionicons
                name="nutrition"
                size={18}
                color={activeFilter === "Nutrición" ? "white" : Colors.PRIMARYCOLOR}
                style={styles.filterIcon}
              />
              <Text style={[styles.filterButtonText, activeFilter === "Nutrición" && styles.activeFilterText]}>
                Nutrición
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de solicitudes */}
          {filteredRequests.length > 0 ? (
            <FlatList
              data={filteredRequests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText
                  ? `No se encontraron solicitudes para "${searchText}"`
                  : activeFilter !== "Todos"
                    ? `No hay solicitudes de ${activeFilter}`
                    : "No hay solicitudes pendientes"}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Modal de acciones (Confirmar/Cancelar) - Solo para móvil */}
      {!responsive.isDesktop && (
        <Modal
          visible={showActionModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowActionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Cita de {selectedRequest?.name}</Text>
              <Text style={styles.modalSubtitle}>Servicio: {selectedRequest?.service}</Text>

              {selectedRequest?.formattedDate && (
                <View style={styles.modalDateContainer}>
                  <Text style={styles.modalDateLabel}>Fecha y hora:</Text>
                  <Text style={styles.modalDateText}>
                    {selectedRequest.formattedDate} a las {selectedRequest.formattedTime}
                  </Text>
                </View>
              )}

              <Text style={styles.modalText}>¿Qué deseas hacer con esta cita?</Text>

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={[styles.modalButton, styles.denyButton]} onPress={handleDeny}>
                  <Text style={styles.denyButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleDirectConfirm}
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowActionModal(false)}>
                <Text style={styles.cancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        visible={showConfirmationModal}
        request={confirmedRequest}
        onClose={() => {
          setShowConfirmationModal(false)
          setConfirmedRequest(null)
        }}
      />
    </>
  )
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  headerCitas: {
    paddingTop: "10%",
    backgroundColor: "#ffffff",
  },
  headerCitasDesktop: {
    paddingTop: 0,
    paddingVertical: 8,
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  // Estilos para desktop
  desktopContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.BACKGROUND,
  },
  desktopLeftPanel: {
    width: "40%",
    borderRight: "1px solid #e0e0e0",
    padding: 20,
    backgroundColor: "#fff",
  },
  desktopRightPanel: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  // Estilos para la barra de búsqueda
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainerDesktop: {
    margin: 0,
    marginBottom: 16,
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: Colors.TEXTCOLOR,
  },
  // Estilos para los botones de filtro
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterContainerDesktop: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.PRIMARYCOLOR,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  filterButtonDesktop: {
    borderRadius: 8,
    paddingVertical: 10,
  },
  activeFilterButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  filterButtonText: {
    color: Colors.PRIMARYCOLOR,
    fontWeight: "500",
    fontSize: 14,
  },
  activeFilterText: {
    color: "white",
  },
  filterIcon: {
    marginRight: 5,
  },
  // Estilos para la lista
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  listContainerDesktop: {
    paddingTop: 0,
  },
  requestItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestItemDesktop: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  requestContent: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignItems: "center",
  },
  requestName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.TEXTCOLOR,
  },
  requestNameDesktop: {
    fontSize: 20,
  },
  requestDate: {
    fontSize: 14,
    color: Colors.SECONDARYCOLOR,
  },
  requestDateDesktop: {
    fontSize: 16,
  },
  serviceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  requestService: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.PRIMARYCOLOR,
    fontWeight: "500",
  },
  requestServiceDesktop: {
    fontSize: 18,
  },
  requestMessage: {
    fontSize: 14,
    color: Colors.TEXTCOLOR,
    marginTop: 8,
  },
  requestActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestActionButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  requestActionButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  // Estilos para "No hay solicitudes"
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
    textAlign: "center",
  },
  // Estilos para modales
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: Colors.TEXTCOLOR,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 15,
    color: Colors.PRIMARYCOLOR,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: Colors.TEXTCOLOR,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  denyButton: {
    backgroundColor: "#FF6347", // Tomato color
  },
  denyButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  cancelButtonText: {
    color: Colors.SECONDARYCOLOR,
    fontSize: 16,
  },
  // Estilos para el contenedor de carga
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
  },
  // Estilos para el contenedor de error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginTop: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  // Estilos para el panel de detalles en desktop
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
    height: "100%",
  },
  detailsHeader: {
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 15,
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },
  detailsTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  detailsContent: {
    padding: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.TEXTCOLOR,
    marginBottom: 10,
  },
  detailsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailsItemText: {
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
    marginLeft: 10,
  },
  detailsMessageContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 15,
  },
  detailsMessage: {
    fontSize: 16,
    color: Colors.TEXTCOLOR,
  },
  detailsActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  detailsActionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    minWidth: 120,
    alignItems: "center",
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSelectionText: {
    fontSize: 18,
    color: "#CCCCCC",
    marginTop: 10,
    textAlign: "center",
  },
  // Estilos para el indicador de actualización en tiempo real
  updatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: "center",
  },
  updatingContainerMobile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  updatingText: {
    fontSize: 14,
    color: Colors.PRIMARYCOLOR,
    marginLeft: 8,
    fontWeight: "500",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: Colors.SECONDARYCOLOR,
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 12,
  },
  modalDateContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  modalDateLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.TEXTCOLOR,
    marginBottom: 5,
  },
  modalDateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.PRIMARYCOLOR,
  },
})

export default RequestScreen
