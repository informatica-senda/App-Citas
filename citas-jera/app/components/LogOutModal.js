import React from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@styles/colors';

// Componente para el modal de cierre de sesión
const LogoutModal = ({ visible, onCancel, onConfirm, isLoggingOut }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <MaterialCommunityIcons name="logout" size={50} color={Colors.PRIMARYCOLOR} style={styles.modalIcon} />
          
          <Text style={styles.modalTitle}>Cerrar Sesión</Text>
          <Text style={styles.modalText}>
            ¿Estás seguro que deseas cerrar sesión?
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onCancel}
              disabled={isLoggingOut}
            >
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonConfirm]}
              onPress={onConfirm}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonConfirmText}>Confirmar</Text>
              )}
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
    padding: 25,
    width: '80%',
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
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    fontFamily: 'Inter_700Bold',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonConfirm: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  buttonCancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
  },
  buttonConfirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default LogoutModal;