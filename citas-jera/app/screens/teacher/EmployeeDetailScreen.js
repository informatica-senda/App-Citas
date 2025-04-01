import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert
} from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '@styles/colors';

const EmployeeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { employee } = route.params || { 
    // Valores por defecto en caso de que no se pasen parámetros
    employee: {
      name: 'Empleado',
      code: 'EMP000',
      phone: 'No disponible',
      role: 'No asignado',
      email: 'No disponible',
      department: 'No asignado',
      startDate: 'No disponible',
      address: 'No disponible'
    }
  };
  
  // Estado para controlar si se está cargando la documentación
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Función para manejar el botón de volver atrás
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Función para manejar el botón de documentación
  const handleDocumentation = () => {
    setLoadingDocs(true);
    
    // Simulamos una carga
    setTimeout(() => {
      setLoadingDocs(false);
      // Aquí podrías navegar a una pantalla de documentación
      navigation.navigate('UserDoc', { employeeId: employee.id });
    }, 800);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.PRIMARYCOLOR} barStyle="light-content" />
      
      {/* Encabezado con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: 'Inter_600SemiBold' }]}>
          Detalle del Empleado
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sección de perfil */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={[styles.avatarLargeText, { fontFamily: 'Inter_700Bold' }]}>
              {employee.name.split(' ').map(name => name[0]).join('')}
            </Text>
          </View>
          <Text style={[styles.employeeName, { fontFamily: 'Inter_700Bold' }]}>
            {employee.name}
          </Text>
          <Text style={[styles.employeeRole, { fontFamily: 'Inter_500Medium' }]}>
            {employee.role}
          </Text>
          <View style={styles.codeContainer}>
            <Text style={[styles.codeText, { fontFamily: 'Inter_500Medium' }]}>
              {employee.code}
            </Text>
          </View>
        </View>
        
        {/* Sección de información */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            Información de Contacto
          </Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="phone" size={20} color={Colors.PRIMARYCOLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { fontFamily: 'Inter_400Regular' }]}>
                Teléfono
              </Text>
              <Text style={[styles.infoValue, { fontFamily: 'Inter_500Medium' }]}>
                {employee.phone}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="email" size={20} color={Colors.PRIMARYCOLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { fontFamily: 'Inter_400Regular' }]}>
                Email
              </Text>
              <Text style={[styles.infoValue, { fontFamily: 'Inter_500Medium' }]}>
                {employee.email || 'No disponible'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="location-on" size={20} color={Colors.PRIMARYCOLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { fontFamily: 'Inter_400Regular' }]}>
                Dirección
              </Text>
              <Text style={[styles.infoValue, { fontFamily: 'Inter_500Medium' }]}>
                {employee.address || 'No disponible'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Sección de detalles laborales */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            Detalles Laborales
          </Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="business" size={20} color={Colors.PRIMARYCOLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { fontFamily: 'Inter_400Regular' }]}>
                Departamento
              </Text>
              <Text style={[styles.infoValue, { fontFamily: 'Inter_500Medium' }]}>
                {employee.department || 'No asignado'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="date-range" size={20} color={Colors.PRIMARYCOLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { fontFamily: 'Inter_400Regular' }]}>
                Fecha de Inicio
              </Text>
              <Text style={[styles.infoValue, { fontFamily: 'Inter_500Medium' }]}>
                {employee.startDate || 'No disponible'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Botón de documentación */}
        <TouchableOpacity 
          style={styles.documentationButton}
          onPress={handleDocumentation}
          disabled={loadingDocs}
        >
          <MaterialIcons name="description" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={[styles.documentationButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
            {loadingDocs ? 'Cargando...' : 'Documentación'}
          </Text>
        </TouchableOpacity>
        
        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={[styles.editButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
              Editar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton}>
            <MaterialIcons name="delete" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={[styles.deleteButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.PRIMARYCOLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  employeeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  codeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  documentationButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  documentationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmployeeDetailScreen;