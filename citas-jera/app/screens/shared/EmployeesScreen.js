'use client'

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import Header from "@components/HeaderAdmin.js"
import { useNavigation } from "@react-navigation/native"
import { useResponsive } from "../../hooks/use-responsive"
import { db, auth } from "../../../firebaseConfig.js"
import { collection, query, where, getDoc, doc, onSnapshot } from "firebase/firestore"
import styles from "./EmployeesStyles.js"

const EmployeesScreen = ({ userRole }) => {
  const navigation = useNavigation()
  const responsive = useResponsive()

  // Estado para manejar la búsqueda de empleados
  const [searchQuery, setSearchQuery] = useState("")

  // Estado que almacena la lista de empleados existentes
  const [employees, setEmployees] = useState([])

  // Estado para el empleado seleccionado (para vista de detalles en desktop)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)

  // Estado para indicar si los datos están cargando
  const [isLoading, setIsLoading] = useState(true)

  // Estado para manejar errores
  const [error, setError] = useState(null)

  // Estado para almacenar el ID de la compañía del usuario actual
  const [companyId, setCompanyId] = useState(null)

  // Estado para almacenar la información del usuario actual
  const [currentUser, setCurrentUser] = useState(null)

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
            setCurrentUser(userData.firstName)
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

  // Reemplazar la función fetchEmployees con una versión que use onSnapshot
  const fetchEmployees = useCallback(() => {
    if (!companyId) return () => {} // Retornar una función de limpieza vacía si no hay companyId

    setIsLoading(true)
    setError(null)

    try {
      let employeesQuery;

      if (userRole === 'manager') {
        employeesQuery = query(
          collection(db, "users"),
          where("companyId", "==", companyId),
          where("role", "in", ["user", "employee"]),
        )
      } else if (userRole === 'teacher') {
        employeesQuery = query(
          collection(db, "users"),
          where("role", "in", ["user", "externalUser"]),
        )
      }
      // Establecer un listener en tiempo real con onSnapshot
      const unsubscribe = onSnapshot(
        employeesQuery,
        async (snapshot) => {
          const employeesData = []

          // Procesar los cambios
          for (const docSnapshot of snapshot.docs) {
            const employeeData = docSnapshot.data()
            employeesData.push({
              id: docSnapshot.id,
              name: `${employeeData.name || ""} ${employeeData.lastName || ""}`.trim(),
              code: employeeData.workerId || "Sin código",
              phone: employeeData.phone || "Sin teléfono",
              role: employeeData.role || "Sin rol",
              email: employeeData.email || "Sin email",
              dni: employeeData.dni || "Sin DNI",
              companyId: employeeData.companyId,
              // Incluir todos los campos originales para referencia
              rawData: employeeData,
            })
          }

          setEmployees(employeesData)
          setIsLoading(false)
        },
        (error) => {
          console.error("Error listening to employees:", error)
          setError("Error al escuchar cambios en los empleados")
          setIsLoading(false)
        },
      )

      // Retornar la función de limpieza para desuscribirse cuando el componente se desmonte
      return unsubscribe
    } catch (err) {
      console.error("Error setting up employee listener:", err)
      setError("Error al configurar el listener de empleados")
      setIsLoading(false)
      return () => {} // Retornar una función de limpieza vacía en caso de error
    }
  }, [companyId, userRole])

  // Reemplazar el useEffect que carga empleados para manejar la limpieza del listener
  useEffect(() => {
    let unsubscribe = () => {}

    if (companyId) {
      unsubscribe = fetchEmployees()
    }

    // Limpiar el listener cuando el componente se desmonte o cuando cambie companyId
    return () => {
      unsubscribe()
    }
  }, [companyId, fetchEmployees])

  // Filtra la lista de empleados según el texto ingresado en la búsqueda
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Obtener el empleado seleccionado
  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId)

  // Función para navegar a la pantalla de detalle del empleado
  const navigateToEmployeeDetail = (employee) => {
    if (responsive.isDesktop) {
      setSelectedEmployeeId(employee.id)
    } else {
      navigation.navigate("EmployeeDetailScreen", { employee })
    }
  }

  // Función que renderiza cada empleado en la lista
  const renderEmployee = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.employeeItem,
        responsive.isDesktop && styles.employeeItemDesktop,
        selectedEmployeeId === item.id && styles.selectedEmployeeItem,
      ]}
      onPress={() => navigateToEmployeeDetail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.employeeContent}>
        <View style={[styles.avatarContainer, responsive.isDesktop && styles.avatarContainerDesktop]}>
          <Text style={[styles.avatarText, responsive.isDesktop && styles.avatarTextDesktop]}>
            {item.name
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={[styles.employeeName, responsive.isDesktop && styles.employeeNameDesktop]}>{item.name}</Text>
          <Text style={[styles.employeeCode, responsive.isDesktop && styles.employeeCodeDesktop]}>
            {item.code} • {item.role}
          </Text>
          <Text style={[styles.employeePhone, responsive.isDesktop && styles.employeePhoneDesktop]}>
            <MaterialIcons name="phone" size={responsive.isDesktop ? 16 : 14} />{" "}
            {item.phone}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={responsive.isDesktop ? 28 : 24} color="#CCCCCC" />
    </TouchableOpacity>
  )

  // Función para renderizar el estado vacío
  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.emptyText}>Cargando empleados...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
          <Text style={styles.emptyText}>{error}</Text>
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
      )
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="people-outline" size={60} color="#CCCCCC" />
        <Text style={styles.emptyText}>No se encontraron empleados</Text>
        <Text style={styles.emptySubtext}>Intenta con otra búsqueda</Text>
      </View>
    )
  }

  // Renderizar los detalles del empleado seleccionado (solo para desktop)
  const renderEmployeeDetails = () => {
    if (!selectedEmployee) {
      return (
        <View style={styles.noSelectionContainer}>
          <MaterialIcons name="person-search" size={80} color="#CCCCCC" />
          <Text style={styles.noSelectionText}>Selecciona un empleado para ver sus detalles</Text>
        </View>
      )
    }

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <View style={styles.detailsAvatarContainer}>
            <Text style={styles.detailsAvatarText}>
              {selectedEmployee.name
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.detailsHeaderInfo}>
            <Text style={styles.detailsName}>{selectedEmployee.name}</Text>
            <Text style={styles.detailsRole}>{selectedEmployee.role}</Text>
          </View>
        </View>

        <View style={styles.detailsContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Información de contacto</Text>
            <View style={styles.detailsItem}>
              <MaterialIcons name="phone" size={20} />
              <Text style={styles.detailsItemText}>{selectedEmployee.phone}</Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="email" size={20} />
              <Text style={styles.detailsItemText}>{selectedEmployee.email}</Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="badge" size={20} />
              <Text style={styles.detailsItemText}>DNI: {selectedEmployee.dni}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Información laboral</Text>
            <View style={styles.detailsItem}>
              <MaterialIcons name="badge" size={20} />
              <Text style={styles.detailsItemText}>Código: {selectedEmployee.code}</Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="work" size={20} />
              <Text style={styles.detailsItemText}>Cargo: {selectedEmployee.role}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Encabezado de la pantalla */}
      <View style={[styles.headerCitas, responsive.isDesktop && styles.headerCitasDesktop]}>
        <Header header_text={"Lista de empleados"} />
      </View>

      {/* Contenedor principal de la pantalla */}
      {responsive.isDesktop ? (
        // Layout para desktop - dos columnas
        <View style={styles.desktopContainer}>
          <View style={styles.desktopLeftPanel}>
            {/* Campo de búsqueda de empleados */}
            <View style={[styles.searchContainer, styles.searchContainerDesktop]}>
              <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { outline: "none", WebkitTapHighlightColor: "transparent" }]}
                placeholder="Buscar por nombre o código"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="no-highlight"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Feather name="x" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Lista de empleados filtrada según la búsqueda */}
            <FlatList
              data={filteredEmployees}
              renderItem={renderEmployee}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.listContainer, styles.listContainerDesktop]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyList}
            />
          </View>

          {/* Panel de detalles (solo en desktop) */}
          <View style={styles.desktopRightPanel}>{renderEmployeeDetails()}</View>
        </View>
      ) : (
        // Layout para móvil - una columna
        <View style={styles.container}>
          {/* Campo de búsqueda de empleados */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { outline: "none", WebkitTapHighlightColor: "transparent" }]}
              placeholder="Buscar por nombre o código"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="no-highlight"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de empleados filtrada según la búsqueda */}
          <FlatList
            data={filteredEmployees}
            renderItem={renderEmployee}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
          />
        </View>
      )}
    </View>
  )
}

export default EmployeesScreen
