"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import Header from "@components/HeaderAdmin.js"
import Colors from "@styles/colors"
import { useNavigation } from "@react-navigation/native"
import { useResponsive } from "../../hooks/use-responsive"
import { db, auth } from "../../../firebaseConfig.js"
// Modificar las importaciones para incluir onSnapshot
import { collection, query, where, getDoc, doc, onSnapshot } from "firebase/firestore"

const EmployeesScreen = () => {
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
      // Consultar usuarios con el mismo companyId
      const employeesQuery = query(
        collection(db, "users"),
        where("companyId", "==", companyId),
        where("role", "in", ["user", "employee"]),
      )

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
  }, [companyId])

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

  // Eliminar o comentar el useFocusEffect ya que no es necesario con los listeners en tiempo real
  // useFocusEffect(
  //   useCallback(() => {
  //     if (companyId) {
  //       fetchEmployees();
  //     }
  //     return () => {}
  //   }, [companyId, fetchEmployees]),
  // );

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
            <MaterialIcons name="phone" size={responsive.isDesktop ? 16 : 14} color={Colors.PRIMARYCOLOR} />{" "}
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
          <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
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
              <MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.detailsItemText}>{selectedEmployee.phone}</Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="email" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.detailsItemText}>{selectedEmployee.email}</Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.detailsItemText}>DNI: {selectedEmployee.dni}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Información laboral</Text>
            <View style={styles.detailsItem}>
              <MaterialIcons name="badge" size={20} color={Colors.PRIMARYCOLOR} />
              <Text style={styles.detailsItemText}>Código: {selectedEmployee.code}</Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="work" size={20} color={Colors.PRIMARYCOLOR} />
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

// Estilos de la pantalla
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  container: {
    flex: 1,
    padding: 16,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainerDesktop: {
    height: 46,
    borderRadius: 8,
    marginBottom: 20,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  listContainerDesktop: {
    paddingBottom: 40,
  },
  employeeItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  employeeItemDesktop: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
  },
  selectedEmployeeItem: {
    backgroundColor: "#f0f7ff",
    borderLeft: `4px solid ${Colors.PRIMARYCOLOR}`,
  },
  employeeContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.PRIMARYCOLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarContainerDesktop: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarTextDesktop: {
    fontSize: 16,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 2,
  },
  employeeNameDesktop: {
    fontSize: 15,
  },
  employeeCode: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  employeeCodeDesktop: {
    fontSize: 13,
  },
  employeePhone: {
    fontSize: 14,
    color: "#666",
  },
  employeePhoneDesktop: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
  },
  retryButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos para el panel de detalles en desktop
  noSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noSelectionText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    maxWidth: "80%",
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  },
  detailsHeader: {
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  detailsAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  detailsAvatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  detailsHeaderInfo: {
    flex: 1,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  detailsRole: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  detailsContent: {
    padding: 24,
    flex: 1,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    borderBottom: "1px solid #eee",
    paddingBottom: 8,
  },
  detailsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailsItemText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 12,
  },
})

export default EmployeesScreen
