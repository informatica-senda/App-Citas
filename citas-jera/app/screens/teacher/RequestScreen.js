import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Alert,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@styles/colors';
import Header from '@components/HeaderAdmin.js';

// Datos de ejemplo para las solicitudes con fecha y hora
const initialRequestsData = [
  {
    id: '1',
    name: 'María García',
    service: 'Psicología',
    date: '2024-12-15',
    time: '10:30',
    phone: '123-456-7890',
    status: 'pending'
  },
  {
    id: '2',
    name: 'Juan Rodríguez',
    service: 'Nutrición',
    date: '2024-12-16',
    time: '14:00',
    phone: '987-654-3210',
    status: 'pending'
  },
  {
    id: '3',
    name: 'Ana Martínez',
    service: 'Psicología',
    date: '2024-12-18',
    time: '09:15',
    phone: '555-123-4567',
    status: 'pending'
  },
  {
    id: '4',
    name: 'Carlos López',
    service: 'Nutrición',
    date: '2024-12-20',
    time: '16:45',
    phone: '777-888-9999',
    status: 'pending'
  },
  {
    id: '5',
    name: 'Laura Sánchez',
    service: 'Psicología',
    date: '2024-12-22',
    time: '11:00',
    phone: '333-222-1111',
    status: 'pending'
  },
  {
    id: '6',
    name: 'Pedro Fernández',
    service: 'Nutrición',
    date: '2024-12-23',
    time: '15:30',
    phone: '444-555-6666',
    status: 'pending'
  },
];

// Función para formatear la fecha en formato dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const RequestScreen = ({ navigation }) => {
  // Estados para manejar las solicitudes y los modales
  const [requestsData, setRequestsData] = useState(initialRequestsData);
  const [filteredRequests, setFilteredRequests] = useState(initialRequestsData);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchText, setSearchText] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

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
    
    // Ordenar por fecha y hora
    result.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
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

  // Función para confirmar una solicitud directamente
  const handleConfirm = () => {
    if (selectedRequest) {
      setConfirmLoading(true);
      
      // Simulamos una pequeña carga
      setTimeout(() => {
        // Actualizar el estado de la solicitud a confirmada
        const updatedRequests = requestsData.map(request => 
          request.id === selectedRequest.id 
            ? { ...request, status: 'confirmed' } 
            : request
        );
        
        setRequestsData(updatedRequests);
        setConfirmLoading(false);
        setShowActionModal(false);
        
        // Mostrar confirmación
        Alert.alert(
          "Cita confirmada",
          `Se ha confirmado la cita para ${selectedRequest.name} el ${formatDate(selectedRequest.date)} a las ${selectedRequest.time}.`,
          [
            { 
              text: "OK", 
              onPress: () => setSelectedRequest(null) 
            }
          ]
        );
      }, 800);
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
          <View style={[
            styles.statusBadge,
            item.status === 'confirmed' ? styles.confirmedBadge : styles.pendingBadge
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
            </Text>
          </View>
        </View>
        
        <View style={styles.serviceContainer}>
          {item.service === 'Psicología' ? (
            <FontAwesome5 name="brain" size={18} color={Colors.PRIMARYCOLOR} />
          ) : (
            <Ionicons name="nutrition" size={20} color={Colors.PRIMARYCOLOR} />
          )}
          <Text style={styles.requestService}>{item.service}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Encabezado de la pantalla */}
      <View style={styles.headerCitas}>
        <Header header_text={'Solicitudes'} />
      </View>
      
      <View style={styles.container}>
        {/* Título de la sección */}
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>Gestión de Solicitudes</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredRequests.length}</Text>
          </View>
        </View>
        
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
            <MaterialCommunityIcons
              name="filter-variant"
              size={16}
              color={activeFilter === 'Todos' ? 'white' : Colors.PRIMARYCOLOR}
              style={styles.filterIcon}
            />
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
            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#ccc" />
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitud de Cita</Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.patientName}>{selectedRequest?.name}</Text>
              
              <View style={styles.modalServiceContainer}>
                {selectedRequest?.service === 'Psicología' ? (
                  <FontAwesome5 name="brain" size={18} color={Colors.PRIMARYCOLOR} />
                ) : (
                  <Ionicons name="nutrition" size={20} color={Colors.PRIMARYCOLOR} />
                )}
                <Text style={styles.modalService}>{selectedRequest?.service}</Text>
              </View>
              
              <View style={styles.modalDetailsContainer}>
                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailItem}>
                    <Ionicons name="calendar" size={18} color="#666" />
                    <Text style={styles.modalDetailText}>
                      {selectedRequest ? formatDate(selectedRequest.date) : ''}
                    </Text>
                  </View>
                  
                  <View style={styles.modalDetailItem}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.modalDetailText}>{selectedRequest?.time}</Text>
                  </View>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailItem}>
                    <Ionicons name="call-outline" size={18} color="#666" />
                    <Text style={styles.modalDetailText}>{selectedRequest?.phone}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.modalQuestion}>
                ¿Qué deseas hacer con esta solicitud?
              </Text>
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.denyButton]}
                onPress={handleDeny}
              >
                <Ionicons name="close-circle" size={20} color="#ff6b6b" style={styles.buttonIcon} />
                <Text style={styles.denyButtonText}>Denegar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
                disabled={confirmLoading}
              >
                {confirmLoading ? (
                  <Text style={styles.confirmButtonText}>Procesando...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" style={styles.buttonIcon} />
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
    paddingTop: Platform.OS === 'android' ? '10%' : 0,
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  countBadge: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  countText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Estilos para la barra de búsqueda
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    marginTop: 8,
    marginBottom: 12,
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
    marginBottom: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
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
    paddingTop: 4,
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
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FFF3CD',
  },
  confirmedBadge: {
    backgroundColor: '#D4EDDA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestService: {
    fontSize: 15,
    color: Colors.PRIMARYCOLOR,
    marginLeft: 6,
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
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
    marginTop: 16,
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
    width: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.PRIMARYCOLOR,
  },
  modalContent: {
    padding: 20,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  modalServiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalService: {
    fontSize: 16,
    color: Colors.PRIMARYCOLOR,
    marginLeft: 8,
    fontWeight: '500',
  },
  modalDetailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    flex: 1,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  modalQuestion: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginTop: 8,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  denyButton: {
    borderRightWidth: 1,
    borderRightColor: '#eee',
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
  buttonIcon: {
    marginRight: 8,
  },
});

export default RequestScreen;