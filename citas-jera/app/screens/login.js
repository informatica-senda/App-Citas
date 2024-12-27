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


const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const password = useRef();
  const usernameRef = useRef();
  const [hide, setHide] = useState(true);

  const handleLogin = () => {
    const username = usernameRef.current?.getValue(); // Obtiene el valor del Input
    if (username === '1') {
      navigation.navigate('HomeAdmin');
    } else {
      navigation.navigate('HomeUser');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.decorativeHeader} />
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
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

          <Input
            title={'Usuario'}
            ref={usernameRef} // Conecta la referencia al Input
            onSubmitEditing={() => password.current.focus()}
          />

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
    height: '10%',
    backgroundColor: Colors.PRIMARYCOLOR,
    width: '100%',
  },

  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
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
    color: Colors.TEXT,
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
    color: Colors.TEXTWHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
