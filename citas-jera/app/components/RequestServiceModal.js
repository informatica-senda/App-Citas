import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet
} from 'react-native';
import Colors from '@styles/colors';

const requestServiceModal = ({ visible, onClose, onConfirm }) => {
  const [selectedService, setSelectedService] = useState(null);

  const handleConfirm = () => {
    if (selectedService) {
      onConfirm(selectedService);
      setSelectedService(null);
    }
  };

  const handleCancel = () => {
    setSelectedService(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Seleccionar servicio</Text>
          
          <View style={styles.serviceOptions}>
            <TouchableOpacity 
              style={[
                styles.serviceOption, 
                selectedService === 'psychology' && styles.selectedServicePsychology
              ]}
              onPress={() => setSelectedService('psychology')}
            >
              <Text style={[
                styles.serviceOptionText,
                selectedService === 'psychology' && styles.selectedServiceText
              ]}>
                Psicología
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.serviceOption, 
                selectedService === 'nutrition' && styles.selectedServiceNutrition
              ]}
              onPress={() => setSelectedService('nutrition')}
            >
              <Text style={[
                styles.serviceOptionText,
                selectedService === 'nutrition' && styles.selectedServiceText
              ]}>
                Nutrición
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.confirmButton,
                !selectedService && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={!selectedService}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  serviceOptions: {
    width: '100%',
    marginBottom: 20,
  },
  serviceOption: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  selectedServicePsychology: {
    backgroundColor: Colors.PSICOLOGIA,
    borderColor: Colors.PSICOLOGIA,
  },
  selectedServiceNutrition: {
    backgroundColor: Colors.NUTRICIÓN,
    borderColor: Colors.NUTRICIÓN,
  },
  serviceOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  selectedServiceText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    padding: 12,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default requestServiceModal;
