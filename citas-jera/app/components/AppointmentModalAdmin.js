import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@styles/colors.js';

const AppointmentModalAdmin = ({ appointment, visible, onClose, onDelete, onModify }) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(appointment.id);
      onClose();
    }
  };

  const handleModify = () => {
    if (onModify) {
      onModify(appointment);
      onClose();
    }
  };
  
  if (!appointment) return null;

  // Asignar el nombre del encargado según la categoría de la cita
  const encargado = appointment.category === 'psychology' ? 'Fernando Rodríguez' : 'Julieta Murcia';
  const empleado = appointment.employee;
  
  // Formatear la fecha para mostrarla en formato más legible
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          {/* Header con título y botón de cerrar */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de la Cita</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          
          {/* Contenido principal */}
          <View style={styles.modalContent}>
            {/* Título de la cita */}
            <Text style={styles.appointmentTitle}>{appointment.title}</Text>
            
            {/* Indicador de categoría */}
            <View style={[
              styles.categoryBadge,
              { backgroundColor: appointment.category === 'psychology' ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR }
            ]}>
              <Text style={styles.categoryText}>
                {appointment.category === 'psychology' ? 'Psicología' : 'Nutrición'}
              </Text>
            </View>
            
            {/* Información de la cita */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="account" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Profesional</Text>
                    <Text style={styles.infoValue}>{empleado}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="account-tie" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Encargado</Text>
                    <Text style={styles.infoValue}>{encargado}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Fecha</Text>
                    <Text style={styles.infoValue}>{formatDate(appointment.date)}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Hora</Text>
                    <Text style={styles.infoValue}>{appointment.time}</Text>
                  </View>
                </View>
              </View>
              
              {appointment.phone && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="phone" size={20} color="#666" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Teléfono</Text>
                      <Text style={styles.infoValue}>{appointment.phone}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
          
          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="delete-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleModify}
            >
              <MaterialCommunityIcons name="pencil-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>Modificar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.PRIMARYCOLOR,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  appointmentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    marginLeft: 12,
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
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    borderBottomLeftRadius: 16,
  },
  editButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderBottomRightRadius: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default AppointmentModalAdmin;