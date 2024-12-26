import React, { useRef, useState, useEffect } from 'react';
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
  Keyboard,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '@components/Inputs.js';
import Colors from '@styles/colors.js';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const password = useRef();
  const [hide, setHide] = useState(true);

  // Estado para controlar el desplazamiento del teclado
  
  const handleLogin = () => {
    // Navegar a la pantalla HomeUser
    navigation.navigate('HomeUser');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#6e4d7a" />

      <View style={styles.decorativeHeader} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20} // Offset ajustado para iOS
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image
              source={require('@assets/favicon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appTitle}>Gestión de Citas Jera</Text>

            <Input title={'Usuario'} onSubmitEditing={() => password.current.focus()} />

            <Input
              secureTextEntry={hide}
              handleAction={() => setHide(!hide)}
              ref={password}
              title={'Contraseña'}
              icon={hide ? 'eye' : 'eye-slash'}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  decorativeHeader: {
    height: 40,
    backgroundColor: Colors.PRIMARYCOLOR,
    width: '100%',
  },

  container: {
    flex: 1,
    backgroundColor: Colors.WHITEBACKGROUND
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    marginTop: -20,
    width: 100,
    height: 100,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.PRIMARYCOLOR,
  },
  formContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
  },
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
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
