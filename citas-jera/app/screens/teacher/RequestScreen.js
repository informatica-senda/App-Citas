import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Alert,
  TextInput
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '@styles/colors';
import Header from '@components/HeaderAdmin.js';
import AppointmentCalendarScreen from '@components/AppoimentCalendarScreen';

// Datos de ejemplo para las solicitudes
const initialRequestsData = [
  {
    id: '1',
    name: 'María García',
    service: 'Psicología',
  },
  {
    id: '2',
    name: 'Juan Rodríguez',
    service: 'Nutrición',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    service: 'Psicología',
  },
  {
    id: '4',
    name: 'Carlos López',
    service: 'Nutrición',
  },
  {
    id: '5',
    name: 'Laura Sánchez',
    service: 'Psicología',
  },
  {
    id: '6',
    name: 'Pedro Fernández',
    service: 'Nutrición',
  },
];

const RequestScreen = ({ navigation }) => {
  // Estados para manejar las solicitudes y los modales
  const [requestsData, setRequestsData] = useState(initialRequestsData);
  const [filteredRequests, setFilteredRequests] = useState(initialRequestsData);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchText, setSearchText] = useState('');

  // Efecto para filtrar las solicitudes cuando cambia el filtro o el texto de búsqueda
  useEffect(() => {
    let result = [...requestsData];
    
    // Aplicar filtro por servicio
    if (activeFilter !== 'Todos') {
      result = result.filter(request => request.service === activeFilter);
    }
    
    // Aplicar filtro por texto de búsqueda
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(request => 
        request.name.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredRequests(result);
  }, [requestsData, activeFilter, searchText]);

  // Función para manejar el tap en una solicitud
  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setShowActionModal(true);
  };

  // Función para denegar una solicitud
  const handleDeny = () => {
    if (selectedRequest) {
      // Filtrar la solicitud seleccionada para eliminarla
      const updatedRequests = requestsData.filter(
        request => request.id !== selectedRequest.id
      );
      setRequestsData(updatedRequests);
      
      // Cerrar el modal y mostrar confirmación
      setShowActionModal(false);
      Alert.alert(
        "Solicitud denegada",
        `La solicitud de ${selectedRequest.name} ha sido denegada.`
      );
      setSelectedRequest(null);
    }
  };

  // Función para confirmar una solicitud
  const handleConfirm = () => {
    setShowActionModal(false);
    setShowCalendar(true);
  };

  // Función para manejar la selección de fecha
  const handleDateConfirm = (date) => {
    if (selectedRequest) {
      // Aquí podrías guardar la cita con la fecha seleccionada
      console.log(`Cita confirmada para ${selectedRequest.name} el ${date.toLocaleString()}`);
      
      // Eliminar la solicitud de la lista
      const updatedRequests = requestsData.filter(
        request => request.id !== selectedRequest.id
      );
      setRequestsData(updatedRequests);
      
      // Mostrar confirmación
      Alert.alert(
        "Cita programada",
        `Se ha programado una cita para ${selectedRequest.name} el ${date.toLocaleString()}.`
      );
      
      setSelectedRequest(null);
      setShowCalendar(false);
    }
  };

  // Función para cambiar el filtro activo
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Función para renderizar cada elemento de la lista
  const renderRequestItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.requestItem}
      onPress={() => handleRequestPress(item)}
    >
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestName}>{item.name}</Text>
        </View>
        <View style={styles.serviceContainer}>
          {item.service === 'Psicología' ? (
            <FontAwesome5 name="brain" size={18} color={Colors.PRIMARYCOLOR} />
          ) : (
            <Ionicons name="nutrition" size={20} color={Colors.PRIMARYCOLOR} />
          )}
          <Text style={styles.requestService}>{item.service}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Si el calendario está visible, renderizamos solo el calendario a pantalla completa
  if (showCalendar && selectedRequest) {
    return (
      <AppointmentCalendarScreen
        onClose={() => setShowCalendar(false)}
        onConfirm={handleDateConfirm}
        patientName={selectedRequest.name}
        service={selectedRequest.service}
      />
    );
  }

  // De lo contrario, renderizamos la pantalla normal de solicitudes
  return (
    <>
      {/* Encabezado de la pantalla */}
      <View style={styles.headerCitas}>
        <Header header_text={'Solicitudes'} />
      </View>
      
      <View style={styles.container}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.SECONDARYCOLOR} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={Colors.SECONDARYCOLOR}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={Colors.SECONDARYCOLOR} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {/* Botones de filtro */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'Todos' && styles.activeFilterButton
            ]}
            onPress={() => handleFilterChange('Todos')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'Todos' && styles.activeFilterText
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'Psicología' && styles.activeFilterButton
            ]}
            onPress={() => handleFilterChange('Psicología')}
          >
            <FontAwesome5
              name="brain"
              size={16}
              color={activeFilter === 'Psicología' ? 'white' : Colors.PRIMARYCOLOR}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'Psicología' && styles.activeFilterText
              ]}
            >
              Psicología
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'Nutrición' && styles.activeFilterButton
            ]}
            onPress={() => handleFilterChange('Nutrición')}
          >
            <Ionicons
              name="nutrition"
              size={18}
              color={activeFilter === 'Nutrición' ? 'white' : Colors.PRIMARYCOLOR}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'Nutrición' && styles.activeFilterText
              ]}
            >
              Nutrición
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Lista de solicitudes */}
        {filteredRequests.length > 0 ? (
          <FlatList
            data={filteredRequests}
            renderItem={renderRequestItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchText 
                ? `No se encontraron solicitudes para "${searchText}"`
                : activeFilter !== 'Todos'
                  ? `No hay solicitudes de ${activeFilter}`
                  : 'No hay solicitudes pendientes'}
            </Text>
          </View>
        )}
      </View>

      {/* Modal de acciones (Denegar/Confirmar) */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Solicitud de {selectedRequest?.name}</Text>
            <Text style={styles.modalSubtitle}>
              Servicio: {selectedRequest?.service}
            </Text>
            
            <Text style={styles.modalText}>
              ¿Qué deseas hacer con esta solicitud?
            </Text>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.denyButton]}
                onPress={handleDeny}
              >
                <Text style={styles.denyButtonText}>Denegar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  headerCitas: {
    paddingTop: '10%',
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  // Estilos para la barra de búsqueda
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.PRIMARYCOLOR,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  filterButtonText: {
    color: Colors.PRIMARYCOLOR,
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterText: {
    color: 'white',
  },
  filterIcon: {
    marginRight: 5,
  },
  // Estilos para la lista
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  requestItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestContent: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TEXTCOLOR,
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestService: {
    fontSize: 15,
    color: Colors.PRIMARYCOLOR,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
    textAlign: 'center',
  },
  // Estilos para el modal de acciones
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.TEXTCOLOR,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.PRIMARYCOLOR,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.TEXTCOLOR,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  modalButton: {
    padding: 12,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  denyButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  confirmButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  denyButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: Colors.SECONDARYCOLOR,
    fontSize: 14,
  },
});

export default RequestScreen;