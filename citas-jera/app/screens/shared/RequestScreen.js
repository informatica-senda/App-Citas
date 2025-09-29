'use client'

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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
import { collection, query, where, doc, updateDoc, getDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore"
import { format } from "date-fns"
import styles from './RequestStyles.js'

const RequestScreen = ({ userRole }) => {
  // States for handling requests and modals
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
  const [isUpdating, setIsUpdating] = useState(false)
  const responsive = useResponsive()

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

  const setupRequestsListeners = useCallback(() => {
    if (!companyId) return () => {}

    setIsLoading(true)
    setError(null)

    try {
      let usersQuery;
      if (userRole === 'manager') {
        usersQuery = query(collection(db, "users"), where("companyId", "==", companyId))
      } else { // teacher
        usersQuery = query(collection(db, "users"), where("role", "in", ["user", "externalUser"]))
      }

      const unsubscribeUsers = onSnapshot(usersQuery, async (userSnapshot) => {
        const userIds = userSnapshot.docs.map(doc => doc.id)
        const userRoles = userSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().role
          return acc
        }, {})

        if (userIds.length === 0) {
          setRequestsData([])
          setIsLoading(false)
          return
        }

        const allRequests = {}
        const unsubscribeFunctions = userIds.map(userId => {
          let requestsQuery;
          if (userRole === 'manager') {
            requestsQuery = query(
              collection(db, "dates"),
              where("userId", "==", userId),
              where("state", "==", false),
              where("date", "==", null)
            )
          } else { // teacher
            if (userRoles[userId] === "user") {
              requestsQuery = query(collection(db, "dates"), where("userId", "==", userId), where("date", "!=", null), where("state", "==", false))
            } else {
              requestsQuery = query(collection(db, "dates"), where("userId", "==", userId), where("state", "==", false))
            }
          }

          return onSnapshot(requestsQuery, async (requestSnapshot) => {
            setIsUpdating(true)
            for (const change of requestSnapshot.docChanges()) {
              const requestDoc = change.doc
              const requestData = requestDoc.data()
              const requestId = requestDoc.id

              if (change.type === "removed") {
                delete allRequests[requestId]
                continue
              }

              const userDocRef = doc(db, "users", requestData.userId)
              const userDocSnap = await getDoc(userDocRef)
              const userData = userDocSnap.exists() ? userDocSnap.data() : {}

              let formattedDate = null
              let formattedTime = ""
              if (requestData.date && typeof requestData.date.toDate === "function") {
                const dateObj = requestData.date.toDate()
                formattedDate = format(dateObj, "dd/MM/yyyy")
                formattedTime = format(dateObj, "HH:mm")
              }

              allRequests[requestId] = {
                id: requestId,
                name: `${userData.name || ""} ${userData.lastName || ""}`.trim() || "Cliente sin nombre",
                service: requestData.service === "psychology" ? "Psicología" : requestData.service === "nutrition" ? "Nutrición" : requestData.service || "Servicio",
                date: requestData.date ? requestData.date.toDate() : null,
                formattedDate: formattedDate,
                formattedTime: formattedTime,
                message: requestData.message || "Sin mensaje",
                phone: userData.phone || "Sin teléfono",
                email: userData.email || "Sin email",
                userId: requestData.userId,
                userRole: userRoles[requestData.userId],
                state: requestData.state,
                rawData: requestData,
              }
            }
            setRequestsData(Object.values(allRequests))
            setIsLoading(false)
            setIsUpdating(false)
          }, (error) => {
            console.error("Error listening to requests:", error)
            setError("Error al escuchar cambios en las solicitudes")
            setIsLoading(false)
            setIsUpdating(false)
          })
        })

        return () => {
          unsubscribeFunctions.forEach((unsubscribe) => unsubscribe())
        }
      }, (error) => {
        console.error("Error listening to users:", error)
        setError("Error al escuchar cambios en los usuarios")
        setIsLoading(false)
      })

      return () => {
        unsubscribeUsers()
      }
    } catch (err) {
      console.error("Error setting up request listeners:", err)
      setError("Error al configurar los listeners de solicitudes")
      setIsLoading(false)
      return () => {}
    }
  }, [companyId, userRole])

  useEffect(() => {
    let unsubscribe = () => {}
    if (companyId) {
      unsubscribe = setupRequestsListeners()
    }
    return () => {
      unsubscribe()
    }
  }, [companyId, setupRequestsListeners])

  useEffect(() => {
    let result = [...requestsData]
    if (activeFilter !== "Todos") {
      result = result.filter((request) => request.service === activeFilter)
    }
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      result = result.filter((request) => request.name.toLowerCase().includes(searchLower))
    }
    setFilteredRequests(result)
  }, [requestsData, activeFilter, searchText])

  const handleRequestPress = (request) => {
    setSelectedRequest(request)
    setShowActionModal(true)
  }

  const handleDeny = async () => {
    if (selectedRequest) {
      try {
        const appointmentRef = doc(db, "dates", selectedRequest.id)
        await deleteDoc(appointmentRef)
        setShowActionModal(false)
        Alert.alert(userRole === 'manager' ? "Solicitud denegada" : "Cita cancelada", `La ${userRole === 'manager' ? 'solicitud' : 'cita'} de ${selectedRequest.name} ha sido ${userRole === 'manager' ? 'denegada' : 'cancelada'}.`)
        setSelectedRequest(null)
      } catch (error) {
        console.error(`Error ${userRole === 'manager' ? 'denying' : 'canceling'} appointment:`, error)
        Alert.alert("Error", `No se pudo ${userRole === 'manager' ? 'denegar la solicitud' : 'cancelar la cita'}. Inténtalo de nuevo.`)
      }
    }
  }

  const handleConfirm = () => {
    setShowActionModal(false)
    setShowCalendar(true)
  }

  const handleDirectConfirm = async () => {
    if (!selectedRequest) return
    setIsConfirming(true)
    try {
        if (userRole === 'manager' && selectedRequest.date) {
            const formattedDate = format(selectedRequest.date, "yyyy-MM-dd")
            const formattedTime = format(selectedRequest.date, "HH:mm")
            const appointmentsQuery = query(collection(db, "dates"), where("state", "==", true))
            const appointmentSnapshots = await getDocs(appointmentsQuery)
            let hasConflict = false
            appointmentSnapshots.forEach((doc) => {
                if (doc.id === selectedRequest.id) return
                const appointmentData = doc.data()
                if (appointmentData.date) {
                    const appointmentDate = appointmentData.date.toDate()
                    if (format(appointmentDate, "yyyy-MM-dd") === formattedDate && format(appointmentDate, "HH:mm") === formattedTime) {
                        hasConflict = true
                    }
                }
            })

            if (hasConflict) {
                Alert.alert("Conflicto de horario", "Ya existe una cita programada para esta fecha y hora.",
                    [{ text: "Programar otro horario", onPress: () => { setIsConfirming(false); setShowActionModal(false); setShowCalendar(true); } }, { text: "Cancelar", onPress: () => { setIsConfirming(false); setShowActionModal(false); }, style: "cancel" },
                    ]);
                return;
            }
        }

      const appointmentRef = doc(db, "dates", selectedRequest.id)
      await updateDoc(appointmentRef, { state: true })
      setConfirmedRequest(selectedRequest)
      setShowConfirmationModal(true)
    } catch (error) {
      console.error("Error confirming appointment:", error)
      Alert.alert("Error", "No se pudo confirmar la cita. Inténtalo de nuevo.")
    } finally {
      setIsConfirming(false)
      setShowActionModal(false)
    }
  }

  const handleDateConfirm = async (date) => {
    if (selectedRequest) {
      setIsConfirming(true)
      try {
        const formattedDate = format(date, "yyyy-MM-dd")
        const formattedTime = format(date, "HH:mm")
        const appointmentsQuery = query(collection(db, "dates"), where("state", "==", true))
        const appointmentSnapshots = await getDocs(appointmentsQuery)
        let hasConflict = false
        appointmentSnapshots.forEach((doc) => {
          if (doc.id === selectedRequest.id) return
          const appointmentData = doc.data()
          if (appointmentData.date) {
            const appointmentDate = appointmentData.date.toDate()
            if (format(appointmentDate, "yyyy-MM-dd") === formattedDate && format(appointmentDate, "HH:mm") === formattedTime) {
              hasConflict = true
            }
          }
        })

        if (hasConflict) {
          Alert.alert("Conflicto de horario", "Ya existe una cita programada para esta fecha y hora. Por favor, selecciona otro horario.", [{ text: "Seleccionar otro horario", onPress: () => setIsConfirming(false) }])
          return
        }

        const appointmentRef = doc(db, "dates", selectedRequest.id)
        await updateDoc(appointmentRef, { date: date })
        const confirmedAppointment = { ...selectedRequest, date: date }
        setConfirmedRequest(confirmedAppointment)
        setShowConfirmationModal(true)
        setShowCalendar(false)
      } catch (error) {
        console.error("Error confirming appointment with date:", error)
        Alert.alert("Error", "No se pudo confirmar la cita. Inténtalo de nuevo.")
      } finally {
        setIsConfirming(false)
      }
    }
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString()
  }

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity style={[styles.requestItem, responsive.isDesktop && styles.requestItemDesktop]} onPress={() => handleRequestPress(item)}>
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={[styles.requestName, responsive.isDesktop && styles.requestNameDesktop]}>{item.name}</Text>
          {userRole === 'manager' && item.date && <Text style={[styles.requestDate, responsive.isDesktop && styles.requestDateDesktop]}>{formatDate(item.date)}</Text>}
        </View>
        <View style={styles.serviceContainer}>
          {item.service === "Psicología" ? <FontAwesome5 name="brain" size={responsive.isDesktop ? 20 : 18} color={Colors.PRIMARYCOLOR} /> : <Ionicons name="nutrition" size={responsive.isDesktop ? 22 : 20} color={Colors.PRIMARYCOLOR} />}
          <Text style={[styles.requestService, responsive.isDesktop && styles.requestServiceDesktop]}>{item.service}</Text>
        </View>
        {userRole === 'teacher' && item.formattedDate && (
          <View style={styles.dateTimeContainer}>
            <Ionicons name="calendar-outline" size={16} color={Colors.SECONDARYCOLOR} />
            <Text style={styles.dateTimeText}>{item.formattedDate}</Text>
            <Ionicons name="time-outline" size={16} color={Colors.SECONDARYCOLOR} style={styles.timeIcon} />
            <Text style={styles.dateTimeText}>{item.formattedTime}</Text>
          </View>
        )}
        {responsive.isDesktop && <Text style={styles.requestMessage} numberOfLines={2}>{item.message}</Text>}
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
        <View style={styles.detailsHeader}><Text style={styles.detailsTitle}>Detalles de la solicitud</Text></View>
        <ScrollView style={styles.detailsContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Información del paciente</Text>
            <View style={styles.detailsItem}><MaterialIcons name="person" size={20} color={Colors.PRIMARYCOLOR} /><Text style={styles.detailsItemText}>{selectedRequest.name}</Text></View>
            <View style={styles.detailsItem}><MaterialIcons name="email" size={20} color={Colors.PRIMARYCOLOR} /><Text style={styles.detailsItemText}>{selectedRequest.email}</Text></View>
            <View style={styles.detailsItem}><MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} /><Text style={styles.detailsItemText}>{selectedRequest.phone}</Text></View>
          </View>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>{userRole === 'manager' ? 'Información de la solicitud' : 'Información de la cita'}</Text>
            <View style={styles.detailsItem}><MaterialIcons name="medical-services" size={20} color={Colors.PRIMARYCOLOR} /><Text style={styles.detailsItemText}>Servicio: {selectedRequest.service}</Text></View>
            {userRole === 'manager' && selectedRequest.date && <View style={styles.detailsItem}><MaterialIcons name="event" size={20} color={Colors.PRIMARYCOLOR} /><Text style={styles.detailsItemText}>Fecha de solicitud: {formatDate(selectedRequest.date)}</Text></View>}
            {userRole === 'teacher' && selectedRequest.formattedDate && (<><View style={styles.detailsItem}><MaterialIcons name="event" size={20} color={Colors.PRIMARYCOLOR} /><Text style={styles.detailsItemText}>Fecha: {selectedRequest.formattedDate}</Text></View><View style={styles.detailsItem}><MaterialIcons name="access-time" size={20} color={Colors.PRIMARYCOLOR} /><Text style={styles.detailsItemText}>Hora: {selectedRequest.formattedTime}</Text></View></>)}
          </View>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Mensaje</Text>
            <View style={styles.detailsMessageContainer}><Text style={styles.detailsMessage}>{selectedRequest.message}</Text></View>
          </View>
          <View style={styles.detailsActions}>
            <TouchableOpacity style={[styles.detailsActionButton, styles.denyButton]} onPress={handleDeny}><Text style={styles.denyButtonText}>{userRole === 'manager' ? 'Denegar' : 'Cancelar cita'}</Text></TouchableOpacity>
            {userRole === 'manager' && !selectedRequest.date ? <TouchableOpacity style={[styles.detailsActionButton, styles.confirmButton]} onPress={handleConfirm} disabled={isConfirming}>{isConfirming ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>Programar</Text>}</TouchableOpacity> : <TouchableOpacity style={[styles.detailsActionButton, styles.confirmButton]} onPress={handleDirectConfirm} disabled={isConfirming}>{isConfirming ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>Confirmar</Text>}</TouchableOpacity>}
          </View>
        </ScrollView>
      </View>
    )
  }

  if (showCalendar && selectedRequest) {
    return <AppointmentCalendarScreen onClose={() => setShowCalendar(false)} onConfirm={handleDateConfirm} patientName={selectedRequest.name} service={selectedRequest.service} companyId={companyId} />
  }

  if (isLoading) {
    return (<><View style={[styles.headerCitas, responsive.isDesktop && styles.headerCitasDesktop]}><Header header_text={"Solicitudes"} /></View><View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} /><Text style={styles.loadingText}>Cargando solicitudes...</Text></View></>)
  }

  if (error) {
    return (<><View style={[styles.headerCitas, responsive.isDesktop && styles.headerCitasDesktop]}><Header header_text={"Solicitudes"} /></View><View style={styles.errorContainer}><MaterialIcons name="error-outline" size={60} color="#FF3B30" /><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={() => { setIsLoading(true); setError(null); setCompanyId(prev => prev) }}><Text style={styles.retryButtonText}>Reintentar</Text></TouchableOpacity></View></>)
  }

  return (
    <>
      <View style={[styles.headerCitas, responsive.isDesktop && styles.headerCitasDesktop]}><Header header_text={"Solicitudes"} /></View>
      {responsive.isDesktop ? (
        <View style={styles.desktopContainer}>
          <View style={styles.desktopLeftPanel}>
            <View style={[styles.searchContainer, styles.searchContainerDesktop]}><Ionicons name="search" size={20} color={Colors.SECONDARYCOLOR} style={styles.searchIcon} /><TextInput style={[styles.searchInput, { outline: "none", WebkitTapHighlightColor: "transparent" }]} placeholder="Buscar por nombre..." value={searchText} onChangeText={setSearchText} placeholderTextColor={Colors.SECONDARYCOLOR} className="no-highlight" />{searchText ? <TouchableOpacity onPress={() => setSearchText("")}><Ionicons name="close-circle" size={20} color={Colors.SECONDARYCOLOR} /></TouchableOpacity> : null}</View>
            {isUpdating && <View style={styles.updatingContainer}><ActivityIndicator size="small" color={Colors.PRIMARYCOLOR} /><Text style={styles.updatingText}>Actualizando...</Text></View>}
            <View style={[styles.filterContainer, styles.filterContainerDesktop]}>
              <TouchableOpacity style={[styles.filterButton, styles.filterButtonDesktop, activeFilter === "Todos" && styles.activeFilterButton]} onPress={() => handleFilterChange("Todos")}><Text style={[styles.filterButtonText, activeFilter === "Todos" && styles.activeFilterText]}>Todos</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.filterButton, styles.filterButtonDesktop, activeFilter === "Psicología" && styles.activeFilterButton]} onPress={() => handleFilterChange("Psicología")}><FontAwesome5 name="brain" size={16} color={activeFilter === "Psicología" ? "white" : Colors.PRIMARYCOLOR} style={styles.filterIcon} /><Text style={[styles.filterButtonText, activeFilter === "Psicología" && styles.activeFilterText]}>Psicología</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.filterButton, styles.filterButtonDesktop, activeFilter === "Nutrición" && styles.activeFilterButton]} onPress={() => handleFilterChange("Nutrición")}><Ionicons name="nutrition" size={18} color={activeFilter === "Nutrición" ? "white" : Colors.PRIMARYCOLOR} style={styles.filterIcon} /><Text style={[styles.filterButtonText, activeFilter === "Nutrición" && styles.activeFilterText]}>Nutrición</Text></TouchableOpacity>
            </View>
            {filteredRequests.length > 0 ? <FlatList data={filteredRequests} renderItem={renderRequestItem} keyExtractor={(item) => item.id} contentContainerStyle={[styles.listContainer, styles.listContainerDesktop]} /> : <View style={styles.emptyContainer}><Text style={styles.emptyText}>{searchText ? `No se encontraron solicitudes para "${searchText}"` : activeFilter !== "Todos" ? `No hay solicitudes de ${activeFilter}` : "No hay solicitudes pendientes"}</Text></View>}
          </View>
          <View style={styles.desktopRightPanel}>{renderDetailsPanel()}</View>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.searchContainer}><Ionicons name="search" size={20} color={Colors.SECONDARYCOLOR} style={styles.searchIcon} /><TextInput style={[styles.searchInput, { outline: "none", WebkitTapHighlightColor: "transparent" }]} placeholder="Buscar por nombre..." value={searchText} onChangeText={setSearchText} placeholderTextColor={Colors.SECONDARYCOLOR} className="no-highlight" />{searchText ? <TouchableOpacity onPress={() => setSearchText("")}><Ionicons name="close-circle" size={20} color={Colors.SECONDARYCOLOR} /></TouchableOpacity> : null}</View>
          {isUpdating && <View style={styles.updatingContainerMobile}><ActivityIndicator size="small" color={Colors.PRIMARYCOLOR} /><Text style={styles.updatingText}>Actualizando...</Text></View>}
          <View style={styles.filterContainer}>
            <TouchableOpacity style={[styles.filterButton, activeFilter === "Todos" && styles.activeFilterButton]} onPress={() => handleFilterChange("Todos")}><Text style={[styles.filterButtonText, activeFilter === "Todos" && styles.activeFilterText]}>Todos</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.filterButton, activeFilter === "Psicología" && styles.activeFilterButton]} onPress={() => handleFilterChange("Psicología")}><FontAwesome5 name="brain" size={16} color={activeFilter === "Psicología" ? "white" : Colors.PRIMARYCOLOR} style={styles.filterIcon} /><Text style={[styles.filterButtonText, activeFilter === "Psicología" && styles.activeFilterText]}>Psicología</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.filterButton, activeFilter === "Nutrición" && styles.activeFilterButton]} onPress={() => handleFilterChange("Nutrición")}><Ionicons name="nutrition" size={18} color={activeFilter === "Nutrición" ? "white" : Colors.PRIMARYCOLOR} style={styles.filterIcon} /><Text style={[styles.filterButtonText, activeFilter === "Nutrición" && styles.activeFilterText]}>Nutrición</Text></TouchableOpacity>
          </View>
          {filteredRequests.length > 0 ? <FlatList data={filteredRequests} renderItem={renderRequestItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer} /> : <View style={styles.emptyContainer}><Text style={styles.emptyText}>{searchText ? `No se encontraron solicitudes para "${searchText}"` : activeFilter !== "Todos" ? `No hay solicitudes de ${activeFilter}` : "No hay solicitudes pendientes"}</Text></View>}
        </View>
      )}
      {!responsive.isDesktop && (
        <Modal visible={showActionModal} transparent={true} animationType="fade" onRequestClose={() => setShowActionModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{userRole === 'manager' ? 'Solicitud de' : 'Cita de'} {selectedRequest?.name}</Text>
              <Text style={styles.modalSubtitle}>Servicio: {selectedRequest?.service}</Text>
              {userRole === 'teacher' && selectedRequest?.formattedDate && <View style={styles.modalDateContainer}><Text style={styles.modalDateLabel}>Fecha y hora:</Text><Text style={styles.modalDateText}>{selectedRequest.formattedDate} a las {selectedRequest.formattedTime}</Text></View>}
              <Text style={styles.modalText}>¿Qué deseas hacer con esta {userRole === 'manager' ? 'solicitud' : 'cita'}?</Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={[styles.modalButton, styles.denyButton]} onPress={handleDeny}><Text style={styles.denyButtonText}>{userRole === 'manager' ? 'Denegar' : 'Cancelar'}</Text></TouchableOpacity>
                {userRole === 'manager' && !selectedRequest?.date ? <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleConfirm} disabled={isConfirming}>{isConfirming ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>Programar</Text>}</TouchableOpacity> : <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleDirectConfirm} disabled={isConfirming}>{isConfirming ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>Confirmar</Text>}</TouchableOpacity>}
              </View>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowActionModal(false)}><Text style={styles.cancelButtonText}>Cerrar</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <ConfirmationModal visible={showConfirmationModal} request={confirmedRequest} onClose={() => { setShowConfirmationModal(false); setConfirmedRequest(null) }} />
    </>
  )
}

export default RequestScreen
