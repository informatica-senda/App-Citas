import React, { useState } from 'react';
import { View, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

interface LoginScreenProps {
  // Puedes añadir props si es necesario
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = (): void => {
    // Aquí iría la lógica de inicio de sesión
    // En lugar de usar console.log, implementa tu lógica de autenticación aquí
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.logo}
        />
      </View>
      <View style={styles.formContainer}>
        <TextInput
          label="Email o Usuario"
          value={email}
          onChangeText={(text: string) => setEmail(text)}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="email" />}
        />
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={(text: string) => setPassword(text)}
          secureTextEntry={!showPassword}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Iniciar Sesión
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#4a90e2',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;