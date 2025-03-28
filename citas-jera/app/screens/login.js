import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Image, SafeAreaView, StatusBar, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '@components/Inputs.js';
import Colors from '@styles/colors.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db ,auth} from '../../firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';

// Obtenemos las dimensiones de la pantalla del dispositivo
const { width, height } = Dimensions.get('window');

// Componente principal de la pantalla de inicio de sesión
const LoginScreen = () => {

  const [isLoading, setIsLoading] = useState(false); // Estado para controlar la visibilidad del modal de carga

  const navigation = useNavigation(); // Hook para manejar la navegación entre pantallas

  // Referencias para los campos de entrada (usuario y contraseña)
  const password = useRef();
  const usernameRef = useRef();
  const phoneNumberRef = useRef();
  const workerIdRef = useRef();

  // Estado que controla la visibilidad de la contraseña en el campo de entrada
  const [hide, setHide] = useState(true);

  /**
   * Función que maneja el proceso de inicio de sesión.
   * - Obtiene el valor ingresado en el campo de usuario.
   * - Si el usuario ingresa '1', se redirige a la pantalla de administrador.
   * - En caso contrario, se redirige a la pantalla de usuario.
   */
  const handleLogin = async () => {
    const username = usernameRef.current?.getValue();
    const passwordComp = password.current?.getValue();

    if (username && passwordComp) {
      
      try {
        setIsLoading(true);
        console.log("hola");
        const response = await signInWithEmailAndPassword(auth, username, passwordComp);
        console.log(response);
        if (response) {
          // Obtener el documento del usuario desde Firestore
          const userDocRef = doc(db, "users", response.user.uid);
          const userDocSnap = await getDoc(userDocRef);

          console.log(userDocRef);
          console.log(userDocSnap);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setIsLoading(false);
            // Redirigir según el rol del usuario
            navigation.replace(userData.role === 'admin' ? 'HomeAdmin' : 'HomeUser');
            alert("Inicio de seisón correcto");
          } else {
            setIsLoading(false);
            alert("Usuario o contraseña incorectos");
          }
        }
      } catch (e) {
        setIsLoading(false);
        console.log(e)
        e = "[FirebaseError: Firebase: Error (auth/invalid-email).]" ? alert("Usuario o contraseña incorrectos") : alert("Ha ocurrido un error");
      }
    } else {
      alert("Introduce el usuario y la contraseña");
    }
  };

  return (
    // SafeAreaView asegura que el contenido no se solape con áreas no seguras de la pantalla (notch, barra de estado, etc.)
    <SafeAreaView style={styles.container}>
      {/* Barra decorativa superior */}
      <View style={styles.decorativeHeader} />

      {/* Personalización de la barra de estado */}
      <StatusBar translucent={true} backgroundColor={'transparent'} />

      {/* Contenedor principal con manejo del teclado para evitar solapamiento en dispositivos iOS */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
      >
        {/* ScrollView permite desplazarse cuando el teclado está activo */}
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Encabezado con el logo de la aplicación */}
          <View style={styles.header}>
            <Image
              source={require('@assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Título de la aplicación */}
          <Text style={styles.appTitle}>Servicio de Atención al Empleado</Text>

          {/* Campo de entrada para el usuario */}
          <Input
            title={'Usuario'}
            ref={usernameRef} // Asigna la referencia al campo de usuario
            onSubmitEditing={() => password.current.focus()} // Al presionar "Enter", cambia al campo de contraseña
          />


          {/* Campo de entrada para la contraseña con opción de ocultar/mostrar texto */}
          <Input
            secureTextEntry={hide} // Determina si el texto se oculta
            handleAction={() => setHide(!hide)} // Alterna la visibilidad de la contraseña
            ref={password}
            title={'Contraseña'}
            icon={hide ? 'eye' : 'eye-slash'} // Icono cambia según la visibilidad
          />

          {/* Botón de inicio de sesión */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <Modal visible={isLoading} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Iniciando Sesión...</Text>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


// Definición de estilos para la pantalla de inicio de sesión
const styles = StyleSheet.create({
  // Barra decorativa superior con color primario
  decorativeHeader: {
    height: '10%',
    backgroundColor: Colors.PRIMARYCOLOR,
    width: '100%',
  },

  // Contenedor principal con fondo personalizado
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  // Contenedor del contenido principal
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Estilos para el contenido desplazable dentro de ScrollView
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },

  // Encabezado con el logo de la aplicación
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  // Estilo del logo
  logo: {
    marginTop: -20,
    width: 100,
    height: 100,
  },

  // Estilos del título de la aplicación
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.TEXT,
  },

  // Botón de inicio de sesión con estilos personalizados
  loginButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginTop: 20,
  },

  // Texto del botón de inicio de sesión
  loginButtonText: {
    color: Colors.TEXTWHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default LoginScreen;

/**
 * ---------------------funcion de subida masiva de usuarios--------------------------------------
 * 
 * const registerUsersFromJson = async () => {
    try {

      setIsLoading(true);
      // Permitir al usuario seleccionar un archivo JSON
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',

      });

      if (result.canceled) {
        alert("Selección de archivo cancelada");
        setIsLoading(false);
        return;
      }

      // Leer el contenido del archivo
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const users = JSON.parse(fileContent);

      // Validar que el JSON contiene datos
      if (!Array.isArray(users) || users.length === 0) {
        alert("El archivo JSON está vacío o mal formateado");
        setIsLoading(false);
        return;
      }

      // Registrar cada usuario
      for (const userData of users) {
        try {
          let { email, password, phoneNumber, workerId, role } = userData;

          if (!email || !password) {
            console.warn(`Usuario omitido por datos incompletos: ${JSON.stringify(userData)}`);
            continue;
          }

          // Forzar el valor de role a "user"
          role = "user";

          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          try {
            await setDoc(doc(db, "users", user.uid), {
              email,
              phoneNumber,
              workerId,
              role,
              createdAt: new Date(),
            });

            console.log(`Usuario registrado: ${email}`);
          } catch (firestoreError) {
            console.error(`Error al guardar en Firestore para ${email}:`, firestoreError.message);
            await deleteUser(user);
          }
        } catch (authError) {
          console.error(`Error al registrar ${userData.email}:`, authError.message);
        }
      }
      setIsLoading(false);
      alert("Registro masivo completado");
      
    } catch (error) {
      console.error("Error al procesar el archivo JSON:", error.message);
      alert("Hubo un problema al procesar el archivo.");
    }
  };

  ----------------modal de carga--------------------------
  <Modal visible={isLoading} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando usuarios...</Text>
              </View>
            </View>
          </Modal>



 -------------------- estilos del modal-----------------------------
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
 */