import React, { useState } from 'react';
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
  Keyboard
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Importamos el hook de navegación
import Header from '@components/HeaderAdmin.js';
import Colors from '@styles/colors';
import EmployeeDetailScreen from '@screens/teacher/EmployeeDetailScreen.js'
 

const EmployeesScreen = () => {
  const navigation = useNavigation(); // Hook para manejar la navegación
  
  // Estado para manejar la búsqueda de empleados
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado que almacena la lista de empleados existentes
  const [employees, setEmployees] = useState([
    { 
      id: '1', 
      name: 'Juan Pérez', 
      code: 'JP001', 
      phone: '123-456-7890', 
      role: 'Gerente',
      email: 'juan.perez@empresa.com',
      department: 'Administración',
      startDate: '15/03/2020',
      address: 'Calle Principal 123, Ciudad'
    },
    { 
      id: '2', 
      name: 'Ana López', 
      code: 'AL002', 
      phone: '098-765-4321', 
      role: 'Operador',
      email: 'ana.lopez@empresa.com',
      department: 'Operaciones',
      startDate: '05/06/2021',
      address: 'Avenida Central 456, Ciudad'
    },
    { 
      id: '3', 
      name: 'Carlos Mendoza', 
      code: 'CM003', 
      phone: '555-123-4567', 
      role: 'Asistente',
      email: 'carlos.mendoza@empresa.com',
      department: 'Recursos Humanos',
      startDate: '10/01/2022',
      address: 'Plaza Mayor 789, Ciudad'
    },
    { 
      id: '4', 
      name: 'María García', 
      code: 'MG004', 
      phone: '777-888-9999', 
      role: 'Supervisor',
      email: 'maria.garcia@empresa.com',
      department: 'Producción',
      startDate: '22/09/2019',
      address: 'Calle Secundaria 321, Ciudad'
    },
  ]);

  // Estado para manejar la visibilidad del modal de agregar empleados
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estado para indicar si los datos están cargando (para demostración)
  const [isLoading, setIsLoading] = useState(false);

  // Filtra la lista de empleados según el texto ingresado en la búsqueda
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Función para navegar a la pantalla de detalle del empleado
  const navigateToEmployeeDetail = (employee) => {
    navigation.navigate('EmployeeDetailScreen', { employee });
  };

  // Función que renderiza cada empleado en la lista
  const renderEmployee = ({ item }) => (
    <TouchableOpacity 
      style={styles.employeeItem}
      onPress={() => navigateToEmployeeDetail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.employeeContent}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(name => name[0]).join('')}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeCode}>{item.code} • {item.role}</Text>
          <Text style={styles.employeePhone}>
            <MaterialIcons name="phone" size={14} color={Colors.PRIMARYCOLOR} /> {item.phone}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
    </TouchableOpacity>
  );

  // Función para renderizar el estado vacío
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>No se encontraron empleados</Text>
      <Text style={styles.emptySubtext}>
        Intenta con otra búsqueda o agrega un nuevo empleado
      </Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={Colors.PRIMARYCOLOR} barStyle="light-content" />
      
      {/* Encabezado de la pantalla */}
      <View style={styles.headerCitas}>
        <Header header_text={'Pacientes'} />
      </View>
      
      {/* Contenedor principal de la pantalla */}
      <View style={styles.container}>
        {/* Campo de búsqueda de empleados */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o código"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Lista de empleados filtrada según la búsqueda */}
        <FlatList
          data={filteredEmployees}
          renderItem={renderEmployee}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      </View>
    </View>
  );
};

// Estilos de la pantalla (sin cambios)
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
    paddingTop: '10%',
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  employeeItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  employeeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.PRIMARYCOLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  employeeCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  employeePhone: {
    fontSize: 14,
    color: '#666',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxHeight: '80%', // Limitar la altura máxima
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  formScrollView: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20, // Añadir espacio adicional al final
  },
  modalButton: {
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  addModalButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  cancelModalButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  }
});

export default EmployeesScreen;