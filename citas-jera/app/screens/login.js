import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '@components/Inputs.js';
import Colors from '@styles/colors.js';

// Obtenemos las dimensiones de la pantalla del dispositivo
const { width, height } = Dimensions.get('window');

// Componente principal de la pantalla de inicio de sesión
const LoginScreen = () => {
  const navigation = useNavigation(); // Hook para manejar la navegación entre pantallas
  
  // Referencias para los campos de entrada (usuario y contraseña)
  const password = useRef();
  const usernameRef = useRef();
  
  // Estado que controla la visibilidad de la contraseña en el campo de entrada
  const [hide, setHide] = useState(true);

  /**
   * Función que maneja el proceso de inicio de sesión.
   * - Obtiene el valor ingresado en el campo de usuario.
   * - Si el usuario ingresa '1', se redirige a la pantalla de administrador.
   * - En caso contrario, se redirige a la pantalla de usuario.
   */
  const handleLogin = () => {
    const username = usernameRef.current?.getValue(); // Obtiene el valor del Input
    if (username === '1') {
      navigation.replace('HomeAdmin');
    } else {
      navigation.replace('HomeUser');
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
              source={require('@assets/favicon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Título de la aplicación */}
          <Text style={styles.appTitle}>Gestión de Citas Jera</Text>

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
});

export default LoginScreen;
