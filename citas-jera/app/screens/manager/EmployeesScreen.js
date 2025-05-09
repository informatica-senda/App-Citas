"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import Header from "@components/HeaderAdmin.js"
import Colors from "@styles/colors"
import { useNavigation } from "@react-navigation/native"
import { useResponsive } from "../../hooks/use-responsive"

const EmployeesScreen = () => {
  const navigation = useNavigation()
  const responsive = useResponsive()

  // Estado para manejar la búsqueda de empleados
  const [searchQuery, setSearchQuery] = useState("")

  // Estado que almacena la lista de empleados existentes
  const [employees, setEmployees] = useState([
    { id: "1", name: "Juan Pérez", code: "JP001", phone: "123-456-7890", role: "Gerente" },
    { id: "2", name: "Ana López", code: "AL002", phone: "098-765-4321", role: "Operador" },
    { id: "3", name: "Carlos Mendoza", code: "CM003", phone: "555-123-4567", role: "Asistente" },
    { id: "4", name: "María García", code: "MG004", phone: "777-888-9999", role: "Supervisor" },
    { id: "5", name: "Roberto Díaz", code: "RD005", phone: "555-444-3333", role: "Gerente" },
    { id: "6", name: "Laura Torres", code: "LT006", phone: "222-333-4444", role: "Asistente" },
    { id: "7", name: "Miguel Sánchez", code: "MS007", phone: "111-222-3333", role: "Operador" },
    { id: "8", name: "Patricia Gómez", code: "PG008", phone: "999-888-7777", role: "Supervisor" },
  ])

  // Estado para manejar la visibilidad del modal de agregar empleados
  const [modalVisible, setModalVisible] = useState(false)

  // Estado para almacenar los datos del nuevo empleado que se va a agregar
  const [newEmployee, setNewEmployee] = useState({ name: "", code: "", phone: "", role: "" })

  // Estado para indicar si los datos están cargando (para demostración)
  const [isLoading, setIsLoading] = useState(false)

  // Estado para el empleado seleccionado (para vista de detalles en desktop)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)

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

  // Función para agregar un nuevo empleado a la lista
  const addEmployee = () => {
    if (newEmployee.name && newEmployee.code && newEmployee.phone) {
      setIsLoading(true)

      // Simular retraso de llamada a API
      setTimeout(() => {
        const newEmployeeWithId = { ...newEmployee, id: Date.now().toString() }
        setEmployees([...employees, newEmployeeWithId])
        setNewEmployee({ name: "", code: "", phone: "", role: "" })
        setModalVisible(false)
        setIsLoading(false)

        // Si estamos en desktop, seleccionamos automáticamente el nuevo empleado
        if (responsive.isDesktop) {
          setSelectedEmployeeId(newEmployeeWithId.id)
        }
      }, 600)
    }
  }

  // Función para renderizar el estado vacío
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>No se encontraron empleados</Text>
      <Text style={styles.emptySubtext}>Intenta con otra búsqueda o agrega un nuevo empleado</Text>
    </View>
  )

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
              <Text style={styles.detailsItemText}>{selectedEmployee.code.toLowerCase()}@senda.com</Text>
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

          <View style={styles.detailsActions}>
            <TouchableOpacity style={styles.detailsActionButton}>
              <MaterialIcons name="edit" size={20} color="#fff" />
              <Text style={styles.detailsActionButtonText}>Editar</Text>
            </TouchableOpacity>
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

      {/* Modal para añadir un nuevo empleado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.centeredView}>
              <View style={[styles.modalView, responsive.isDesktop && styles.modalViewDesktop]}>
                <Text style={styles.modalTitle}>Nuevo Empleado</Text>

                <ScrollView style={styles.formScrollView}>
                  {/* Campos de entrada para registrar un nuevo empleado */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nombre</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre completo"
                      value={newEmployee.name}
                      onChangeText={(text) => setNewEmployee({ ...newEmployee, name: text })}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Código</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Código de empleado"
                      value={newEmployee.code}
                      onChangeText={(text) => setNewEmployee({ ...newEmployee, code: text })}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cargo</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Cargo o puesto"
                      value={newEmployee.role}
                      onChangeText={(text) => setNewEmployee({ ...newEmployee, role: text })}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Teléfono</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Número de teléfono"
                      value={newEmployee.phone}
                      onChangeText={(text) => setNewEmployee({ ...newEmployee, phone: text })}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    {/* Botón para confirmar la adición del nuevo empleado */}
                    <TouchableOpacity
                      style={[styles.modalButton, styles.addModalButton]}
                      onPress={addEmployee}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.modalButtonText}>Añadir</Text>
                      )}
                    </TouchableOpacity>

                    {/* Botón para cerrar el modal sin agregar empleado */}
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelModalButton]}
                      onPress={() => setModalVisible(false)}
                      disabled={isLoading}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
  addButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonDesktop: {
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  },
  buttonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxHeight: "80%", // Limitar la altura máxima
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewDesktop: {
    width: "40%",
    maxWidth: 500,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  formScrollView: {
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20, // Añadir espacio adicional al final
  },
  modalButton: {
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  addModalButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  cancelModalButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
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
  detailsActions: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  detailsActionButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  detailsActionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
})

export default EmployeesScreen

