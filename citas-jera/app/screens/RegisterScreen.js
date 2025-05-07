"use client"

import { useRef, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import Input from "@components/Inputs.js"
import Colors from "@styles/colors.js"
import { createUserWithEmailAndPassword } from "firebase/auth"
//import { db, auth } from "../../firebaseConfig.js"
//import { doc, setDoc } from "firebase/firestore"
import { useResponsive } from "../hooks/use-responsive"

// Componente principal de la pantalla de registro
const RegisterScreen = () => {
  const responsive = useResponsive()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()

  // Referencias para los campos de entrada
  const fullNameRef = useRef()
  const emailRef = useRef()
  const dniRef = useRef()
  const companyCodeRef = useRef()
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()

  // Estado que controla la visibilidad de las contraseñas
  const [hidePassword, setHidePassword] = useState(true)
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true)

  /**
   * Función que maneja el proceso de registro.
   */
  const handleRegister = async () => {
    const fullName = fullNameRef.current?.getValue()
    const email = emailRef.current?.getValue()
    const dni = dniRef.current?.getValue()
    const companyCode = companyCodeRef.current?.getValue()
    const password = passwordRef.current?.getValue()
    const confirmPassword = confirmPasswordRef.current?.getValue()

    // Validar que todos los campos estén completos
    if (!fullName || !email || !dni || !companyCode || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor, completa todos los campos")
      return
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor, introduce un email válido")
      return
    }

    // Validar formato de DNI (8 números y una letra)
    const dniRegex = /^[0-9]{8}[A-Za-z]$/
    if (!dniRegex.test(dni)) {
      Alert.alert("Error", "Por favor, introduce un DNI válido (8 números y una letra)")
      return
    }

    try {
      setIsLoading(true)
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Guardar información adicional en Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        email,
        dni,
        companyCode,
        role: "user", // Por defecto, todos los usuarios registrados son usuarios normales
        createdAt: new Date().toISOString(),
      })

      setIsLoading(false)
      Alert.alert("Registro exitoso", "Tu cuenta ha sido creada correctamente", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ])
    } catch (error) {
      setIsLoading(false)
      let errorMessage = "Ha ocurrido un error durante el registro"

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres"
      }

      Alert.alert("Error", errorMessage)
    }
  }

  // Función para volver a la pantalla de login
  const navigateToLogin = () => {
    navigation.replace("LoginScreen")
  }

  return (
    <SafeAreaView style={[styles.iosSafeArea, responsive.isDesktop && styles.containerDesktop]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {responsive.isDesktop ? (
        // Layout para escritorio - diseño de dos columnas con estilo iOS
        <View style={styles.desktopLayout}>
          {/* Panel lateral con imagen/branding */}
          <View style={styles.desktopSidebar}>
            <View style={styles.sidebarContent}>
              <View style={styles.logoContainerDesktop}>
                <Image source={require("@assets/icon.png")} style={styles.desktopLogo} resizeMode="contain" />
              </View>
              <Text style={styles.desktopWelcomeTitle}>Senda Servicios</Text>
              <Text style={styles.desktopWelcomeText}>
                Crea tu cuenta para acceder a nuestros servicios y gestionar tus citas
              </Text>
            </View>
            <View style={styles.sidebarFooter}>
              <Text style={styles.copyrightText}>© 2025 Servicio de Atención al Empleado</Text>
            </View>
          </View>

          {/* Panel de formulario con estilo iOS */}
          <View style={styles.desktopFormPanel}>
            <View style={styles.formContainer}>
              <Text style={styles.desktopFormTitle}>Crear Cuenta</Text>
              <Text style={styles.desktopFormSubtitle}>Completa el formulario para registrarte en el sistema</Text>

              <View style={styles.formFields}>
                <View style={styles.iosFormRow}>
                  <View style={styles.iosFormColumn}>
                    <Input
                      title={"Nombre y Apellidos"}
                      ref={fullNameRef}
                      containerStyle={styles.iosInputContainer}
                      inputStyle={styles.iosInput}
                      titleStyle={styles.iosInputLabel}
                    />
                  </View>
                  <View style={styles.iosFormColumn}>
                    <Input
                      title={"Correo Electrónico"}
                      ref={emailRef}
                      containerStyle={styles.iosInputContainer}
                      inputStyle={styles.iosInput}
                      titleStyle={styles.iosInputLabel}
                    />
                  </View>
                </View>

                

                <View style={styles.iosFormRow}>
                  <View style={styles.iosFormColumn}>
                    <Input
                      secureTextEntry={hidePassword}
                      handleAction={() => setHidePassword(!hidePassword)}
                      ref={passwordRef}
                      title={"Contraseña"}
                      icon={hidePassword ? "eye" : "eye-slash"}
                      containerStyle={styles.iosInputContainer}
                      inputStyle={styles.iosInput}
                      titleStyle={styles.iosInputLabel}
                    />
                  </View>
                  <View style={styles.iosFormColumn}>
                    <Input
                      secureTextEntry={hideConfirmPassword}
                      handleAction={() => setHideConfirmPassword(!hideConfirmPassword)}
                      ref={confirmPasswordRef}
                      title={"Confirmar Contraseña"}
                      icon={hideConfirmPassword ? "eye" : "eye-slash"}
                      containerStyle={styles.iosInputContainer}
                      inputStyle={styles.iosInput}
                      titleStyle={styles.iosInputLabel}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.iosRegisterButton} onPress={handleRegister} activeOpacity={0.8}>
                  <Text style={styles.iosRegisterButtonText}>Crear Cuenta</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.iosLoginSection}>
                <Text style={styles.iosLoginText}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.iosLoginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.iosHelpSection}>
                <Text style={styles.iosHelpText}>¿Necesitas ayuda? Contacta con el administrador</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        // Layout para móvil - diseño iOS
        <KeyboardAvoidingView
          style={styles.iosContent}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.iosScrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Encabezado con el logo */}
            <View style={styles.iosHeader}>
              <Image source={require("@assets/icon.png")} style={styles.iosLogo} resizeMode="contain" />
            </View>

            {/* Título de la aplicación */}
            <Text style={styles.iosAppTitle}>Senda Servicios</Text>
            <Text style={styles.iosAppSubtitle}>Crear una nueva cuenta</Text>

            {/* Campos de entrada con estilo iOS */}
            <View style={styles.iosMobileFormContainer}>
              <Input
                title={"Nombre y Apellidos"}
                ref={fullNameRef}
                containerStyle={styles.iosInputContainer}
                inputStyle={styles.iosInput}
                titleStyle={styles.iosInputLabel}
              />

              <Input
                title={"Correo Electrónico"}
                ref={emailRef}
                containerStyle={styles.iosInputContainer}
                inputStyle={styles.iosInput}
                titleStyle={styles.iosInputLabel}
              />

              

              <Input
                secureTextEntry={hidePassword}
                handleAction={() => setHidePassword(!hidePassword)}
                ref={passwordRef}
                title={"Contraseña"}
                icon={hidePassword ? "eye" : "eye-slash"}
                containerStyle={styles.iosInputContainer}
                inputStyle={styles.iosInput}
                titleStyle={styles.iosInputLabel}
              />

              <Input
                secureTextEntry={hideConfirmPassword}
                handleAction={() => setHideConfirmPassword(!hideConfirmPassword)}
                ref={confirmPasswordRef}
                title={"Confirmar Contraseña"}
                icon={hideConfirmPassword ? "eye" : "eye-slash"}
                containerStyle={styles.iosInputContainer}
                inputStyle={styles.iosInput}
                titleStyle={styles.iosInputLabel}
              />

              {/* Botón de registro con estilo iOS */}
              <TouchableOpacity style={styles.iosRegisterButton} onPress={handleRegister} activeOpacity={0.8}>
                <Text style={styles.iosRegisterButtonText}>Crear Cuenta</Text>
              </TouchableOpacity>

              {/* Sección de login para móvil con estilo iOS */}
              <View style={styles.iosLoginSection}>
                <Text style={styles.iosLoginText}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.iosLoginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Modal de carga con estilo iOS */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.iosModalContainer}>
          <View style={styles.iosModalContent}>
            <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
            <Text style={styles.iosLoadingText}>Procesando registro...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Definición de estilos para la pantalla de registro con estilo iOS
const styles = StyleSheet.create({
  // Estilos generales con estilo iOS
  iosSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerDesktop: {
    backgroundColor: "#FFFFFF",
  },
  iosContent: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  iosScrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 60,
  },
  iosHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  iosLogo: {
    width: 80,
    height: 80,
  },
  iosAppTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  iosAppSubtitle: {
    fontSize: 17,
    color: "#3A3A3C",
    textAlign: "center",
    marginBottom: 40,
  },
  iosMobileFormContainer: {
    width: "100%",
    marginTop: 20,
  },
  iosMobileFormRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iosInputContainer: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  iosNestedInputContainer: {
    marginBottom: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  iosInput: {
    fontSize: 17,
    color: "#000000",
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontWeight: "400",
  },
  iosInputLabel: {
    fontSize: 14,
    color: "#3A3A3C",
    marginBottom: 8,
    fontWeight: "500",
  },
  iosRegisterButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  iosRegisterButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  iosLoginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  iosLoginText: {
    fontSize: 15,
    color: "#8E8E93",
    marginRight: 6,
  },
  iosLoginButtonText: {
    fontSize: 15,
    color: Colors.PRIMARYCOLOR,
    fontWeight: "600",
  },
  iosHelpSection: {
    marginTop: 40,
    alignItems: "center",
  },
  iosHelpText: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
  },

  // Modal con estilo iOS
  iosModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(10px)",
  },
  iosModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    width: "80%",
    maxWidth: 280,
  },
  iosLoadingText: {
    marginTop: 16,
    fontSize: 17,
    color: "#000000",
    fontWeight: "500",
  },

  // Estilos para desktop
  desktopLayout: {
    flexDirection: "row",
    height: "100%",
  },
  desktopSidebar: {
    width: "40%",
    backgroundColor: "#F2F2F7",
    padding: 40,
    justifyContent: "space-between",
  },
  sidebarContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarFooter: {
    marginTop: 20,
    alignItems: "center",
  },
  logoContainerDesktop: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  desktopLogo: {
    width: 100,
    height: 100,
  },
  desktopWelcomeTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  desktopWelcomeText: {
    fontSize: 17,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 400,
  },
  copyrightText: {
    color: "#8E8E93",
    fontSize: 13,
  },
  desktopFormPanel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 800,
  },
  desktopFormTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },
  desktopFormSubtitle: {
    fontSize: 17,
    color: "#3A3A3C",
    marginBottom: 40,
  },
  formFields: {
    width: "100%",
  },

  // Estilos para el formulario en columnas (desktop)
  iosFormRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20,
  },
  iosFormColumn: {
    flex: 1,
  },
})

export default RegisterScreen
