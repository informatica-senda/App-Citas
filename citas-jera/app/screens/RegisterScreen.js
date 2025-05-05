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
    <SafeAreaView style={[styles.container, responsive.isDesktop && styles.containerDesktop]}>
      {responsive.isDesktop ? (
        // Layout para escritorio - diseño de dos columnas
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

          {/* Panel de formulario */}
          <View style={styles.desktopFormPanel}>
            <View style={styles.formContainer}>
              <Text style={styles.desktopFormTitle}>Crear Cuenta</Text>
              <Text style={styles.desktopFormSubtitle}>Completa el formulario para registrarte en el sistema</Text>

              <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.formFields}>
                  <Input title={"Nombre y Apellidos"} ref={fullNameRef} />
                  <Input title={"Correo Electrónico"} ref={emailRef} />
                  <Input title={"DNI"} ref={dniRef} />
                  <Input title={"Código de Empresa"} ref={companyCodeRef} />

                  <Input
                    secureTextEntry={hidePassword}
                    handleAction={() => setHidePassword(!hidePassword)}
                    ref={passwordRef}
                    title={"Contraseña"}
                    icon={hidePassword ? "eye" : "eye-slash"}
                  />

                  <Input
                    secureTextEntry={hideConfirmPassword}
                    handleAction={() => setHideConfirmPassword(!hideConfirmPassword)}
                    ref={confirmPasswordRef}
                    title={"Confirmar Contraseña"}
                    icon={hideConfirmPassword ? "eye" : "eye-slash"}
                  />

                  <TouchableOpacity
                    style={[styles.registerButton, styles.registerButtonDesktop]}
                    onPress={handleRegister}
                  >
                    <Text style={styles.registerButtonText}>Registrarse</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.loginSection}>
                <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : (
        // Layout para móvil
        <>
          {/* Barra decorativa superior */}
          <View style={styles.decorativeHeader} />

          {/* Personalización de la barra de estado */}
          <StatusBar translucent={true} backgroundColor={"transparent"} />

          {/* Contenedor principal con manejo del teclado */}
          <KeyboardAvoidingView
            style={styles.content}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
          >
            <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
              {/* Encabezado con el logo de la aplicación */}
              <View style={styles.header}>
                <Image source={require("@assets/icon.png")} style={styles.logo} resizeMode="contain" />
              </View>

              {/* Título de la aplicación */}
              <Text style={styles.appTitle}>Crear Cuenta</Text>

              {/* Campos del formulario */}
              <Input title={"Nombre y Apellidos"} ref={fullNameRef} />
              <Input title={"Correo Electrónico"} ref={emailRef} />
              <Input title={"DNI"} ref={dniRef} />
              <Input title={"Código de Empresa"} ref={companyCodeRef} />

              <Input
                secureTextEntry={hidePassword}
                handleAction={() => setHidePassword(!hidePassword)}
                ref={passwordRef}
                title={"Contraseña"}
                icon={hidePassword ? "eye" : "eye-slash"}
              />

              <Input
                secureTextEntry={hideConfirmPassword}
                handleAction={() => setHideConfirmPassword(!hideConfirmPassword)}
                ref={confirmPasswordRef}
                title={"Confirmar Contraseña"}
                icon={hideConfirmPassword ? "eye" : "eye-slash"}
              />

              {/* Botón de registro */}
              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Registrarse</Text>
              </TouchableOpacity>

              {/* Sección para volver al login */}
              <View style={styles.mobileLoginSection}>
                <Text style={styles.mobileLoginText}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.mobileLoginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}

      {/* Modal de carga */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={[styles.modalContainer, responsive.isDesktop && styles.modalContainerDesktop]}>
          <View style={[styles.modalContent, responsive.isDesktop && styles.modalContentDesktop]}>
            <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
            <Text style={[styles.loadingText, responsive.isDesktop && styles.loadingTextDesktop]}>
              Procesando registro...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Definición de estilos para la pantalla de registro
const styles = StyleSheet.create({
  // Barra decorativa superior con color primario
  decorativeHeader: {
    height: "10%",
    backgroundColor: Colors.PRIMARYCOLOR,
    width: "100%",
  },

  // Contenedor principal con fondo personalizado
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  containerDesktop: {
    backgroundColor: "#f5f7fa",
  },
  // Contenedor del contenido principal
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // Estilos para el contenido desplazable dentro de ScrollView
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    width: "100%",
  },

  // Encabezado con el logo de la aplicación
  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  // Estilo del logo
  logo: {
    marginTop: -20,
    width: 100,
    height: 100,
  },

  // Contenedor para el logo con fondo blanco (solo para desktop)
  logoContainerDesktop: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      },
    }),
  },

  // Estilos del título de la aplicación
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.TEXT,
  },

  // Botón de registro con estilos personalizados
  registerButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    marginTop: 20,
  },
  registerButtonDesktop: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 30,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 4px 10px rgba(22, 107, 255, 0.25)",
          backgroundColor: "#0055e6",
        },
      },
    }),
  },

  // Texto del botón de registro
  registerButtonText: {
    color: Colors.TEXTWHITE,
    fontSize: 18,
    fontWeight: "bold",
  },

  // Estilos para el modal de carga
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainerDesktop: {
    ...Platform.select({
      web: {
        backdropFilter: "blur(5px)",
      },
    }),
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  modalContentDesktop: {
    padding: 30,
    borderRadius: 16,
    ...Platform.select({
      web: {
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
      },
    }),
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  loadingTextDesktop: {
    fontSize: 18,
    marginTop: 15,
    fontWeight: "500",
  },

  // Estilos específicos para desktop
  desktopLayout: {
    flexDirection: "row",
    height: "100%",
  },
  desktopSidebar: {
    width: "40%",
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 40,
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.08)",
      },
    }),
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
  desktopLogo: {
    width: 120,
    height: 120,
  },
  desktopWelcomeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  desktopWelcomeText: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 400,
  },
  copyrightText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  desktopFormPanel: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 450,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  formScrollView: {
    flex: 1,
  },
  desktopFormTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  desktopFormSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  formFields: {
    width: "100%",
  },

  // Estilos para la sección de login (desktop)
  loginSection: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 16,
    color: "#666",
    marginRight: 10,
  },
  loginButton: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.PRIMARYCOLOR,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "rgba(0, 102, 255, 0.05)",
        },
      },
    }),
  },
  loginButtonText: {
    color: Colors.PRIMARYCOLOR,
    fontSize: 16,
    fontWeight: "600",
  },

  // Estilos para la sección de login (móvil)
  mobileLoginSection: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileLoginText: {
    fontSize: 14,
    color: "#666",
    marginRight: 6,
  },
  mobileLoginButtonText: {
    color: Colors.PRIMARYCOLOR,
    fontSize: 14,
    fontWeight: "600",
  },
})

export default RegisterScreen

