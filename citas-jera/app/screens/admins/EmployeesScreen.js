import React, { useState } from 'react'; // Importa React y el hook useState para manejar el estado del componente
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native'; // Importa componentes esenciales de React Native
import Header from '@components/HeaderAdmin.js'; // Importa el componente de encabezado personalizado para la pantalla
import Colors from '@styles/colors'; // Importa la paleta de colores predefinida

const EmployeesScreen = () => {
  // Estado para manejar la búsqueda de empleados
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado que almacena la lista de empleados existentes
  const [employees, setEmployees] = useState([
    { id: '1', name: 'Juan Pérez', code: 'JP001', phone: '123-456-7890' },
    { id: '2', name: 'Ana López', code: 'AL002', phone: '098-765-4321' },
    // Se pueden agregar más empleados aquí
  ]);

  // Estado para manejar la visibilidad del modal de agregar empleados
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estado para almacenar los datos del nuevo empleado que se va a agregar
  const [newEmployee, setNewEmployee] = useState({ name: '', code: '', phone: '' });

  // Filtra la lista de empleados según el texto ingresado en la búsqueda
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Función que renderiza cada empleado en la lista
  const renderEmployee = ({ item }) => (
    <View style={styles.employeeItem}>
      <Text style={styles.employeeText}>{item.name} - {item.code}</Text>
      <Text style={styles.employeeText}>Teléfono: {item.phone}</Text>
    </View>
  );

  // Función para agregar un nuevo empleado a la lista
  const addEmployee = () => {
    if (newEmployee.name && newEmployee.code && newEmployee.phone) {
      setEmployees([...employees, { ...newEmployee, id: Date.now().toString() }]); // Agrega el nuevo empleado con un ID único
      //Los puntos ... forman parte del operador de propagación y se usan para copiar y expandir arrays y objetos de forma segura y eficiente.
      //Copian en un nuevo array todos los valores del anterior, en
      setNewEmployee({ name: '', code: '', phone: '' }); // Reinicia el formulario del modal
      setModalVisible(false); // Cierra el modal
    }
  };

  return (
    <>
      {/* Encabezado de la pantalla */}
      <View style={styles.headerCitas}>
        <Header header_text={'Lista de empleados'} />
      </View>
      
      {/* Contenedor principal de la pantalla */}
      <View style={styles.container}>
        {/* Campo de búsqueda de empleados */}
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o código"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        {/* Botón para abrir el modal de agregar empleados */}
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Añadir Empleado</Text>
        </TouchableOpacity>
        
        {/* Lista de empleados filtrada según la búsqueda */}
        <FlatList
          data={filteredEmployees}
          renderItem={renderEmployee}
          keyExtractor={item => item.id}
        />
        
        {/* Modal para añadir un nuevo empleado */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {/* Campos de entrada para registrar un nuevo empleado */}
              <TextInput
                style={styles.input}
                placeholder="Nombre del empleado"
                value={newEmployee.name}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Código del empleado"
                value={newEmployee.code}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, code: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Teléfono del empleado"
                value={newEmployee.phone}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, phone: text })}
                keyboardType="phone-pad"
              />
              
              {/* Botón para confirmar la adición del nuevo empleado */}
              <TouchableOpacity style={styles.modalButton} onPress={addEmployee}>
                <Text style={styles.modalButtonText}>Añadir</Text>
              </TouchableOpacity>
              
              {/* Botón para cerrar el modal sin agregar empleado */}
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

// Estilos de la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.BACKGROUND,
  },
  headerCitas: {
    paddingTop: '10%',
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  searchInput: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  addButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 15,
  },
  employeeText: {
    fontSize: 16,
    color: '#333',
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
    padding: 25,
    width: '80%',
    alignItems: 'center'
  },
  input: {
    height: 45,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  modalButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 15,
    borderRadius: 25,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmployeesScreen;
