import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Header from '@components/HeaderAdmin.js';
import Colors from '@styles/colors';

const EmployeesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([
    { id: '1', name: 'Juan Pérez', code: 'JP001', phone: '123-456-7890' },
    { id: '2', name: 'Ana López', code: 'AL002', phone: '098-765-4321' },
    // Añade más empleados aquí
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', code: '', phone: '' });

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEmployee = ({ item }) => (
    <View style={styles.employeeItem}>
      <Text style={styles.employeeText}>{item.name} - {item.code}</Text>
      <Text style={styles.employeeText}>Teléfono: {item.phone}</Text>
    </View>
  );

  const addEmployee = () => {
    if (newEmployee.name && newEmployee.code && newEmployee.phone) {
      setEmployees([...employees, { ...newEmployee, id: Date.now().toString() }]);
      setNewEmployee({ name: '', code: '', phone: '' });
      setModalVisible(false);
    }
  };

  return (
    <>
      <View style={styles.headerCitas}>
        <Header header_text={'Lista de empleados'} />
      </View>
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o código"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Añadir Empleado</Text>
        </TouchableOpacity>
        <FlatList
          data={filteredEmployees}
          renderItem={renderEmployee}
          keyExtractor={item => item.id}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
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
              <TouchableOpacity style={styles.modalButton} onPress={addEmployee}>
                <Text style={styles.modalButtonText}>Añadir</Text>
              </TouchableOpacity>
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
