import { StyleSheet } from 'react-native';
import Colors from '@styles/colors'; // Archivo de estilos con colores predefinidos

// Estilos para la pantalla de Ajustes
export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  cerrarSesion: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  headerCitas: {
    paddingTop: '10%',
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  button: {
    backgroundColor: Colors.BACKGROUND,
    paddingVertical: 15,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.PRIMARYCOLOR,
    marginTop: 40,
  },
  buttonText: {
    color: Colors.PRIMARYCOLOR,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonTextCerrarSesion: {
    color: Colors.TEXTWHITE,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 50,
    marginBottom: 20,
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
    padding: 35,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.PRIMARYCOLOR,
  },
  modalTextTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    color: Colors.TEXT,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    color: Colors.TEXT,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 18,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.PRIMARYCOLOR,
    marginHorizontal: 10
  },
  modalButtonText: {
    fontSize: 16,
    color: Colors.PRIMARYCOLOR
  }
});
