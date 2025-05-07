"use client"

import { useRef, useState } from "react"
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
  Modal,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import Input from "@components/Inputs.js"
import Colors from "@styles/colors.js"
import { signInWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "../../firebaseConfig.js"
import { doc, getDoc } from "firebase/firestore"
import { useResponsive } from "../hooks/use-responsive"

// Obtenemos las dimensiones de la pantalla del dispositivo
const { width, height } = Dimensions.get("window")

// Componente principal de la pantalla de inicio de sesión
const LoginScreen = () => {
  const responsive = useResponsive()
  const [isLoading, setIsLoading] = useState(false)

  const navigation = useNavigation()

  // Referencias para los campos de entrada
  const password = useRef()
  const usernameRef = useRef()
  const phoneNumberRef = useRef()
  const workerIdRef = useRef()

  // Estado que controla la visibilidad de la contraseña
  const [hide, setHide] = useState(true)

  /**
   * Función que maneja el proceso de inicio de sesión.
   */
  const handleLogin = async () => {
    const username = usernameRef.current?.getValue()
    const passwordComp = password.current?.getValue()

    if (username && passwordComp) {
      try {
        setIsLoading(true)
        const response = await signInWithEmailAndPassword(auth, username, passwordComp)
        if (response) {
          // Obtener el documento del usuario desde Firestore
          const userDocRef = doc(db, "users", response.user.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            setIsLoading(false)
            // Redirigir según el rol del usuario
            navigation.replace(userData.role === "admin" ? "HomeManager" : "HomeUser")
            alert("Inicio de sesión correcto")
          } else {
            setIsLoading(false)
            alert("Usuario o contraseña incorrectos")
          }
        }
      } catch (e) {
        setIsLoading(false)
        e = "[FirebaseError: Firebase: Error (auth/invalid-email).]"
          ? alert("No hay autenticación")
          : alert("Ha ocurrido un error")
      }
    } else {
      alert("Introduce el usuario y la contraseña")
    }
  }

  // Función para navegar a la pantalla de registro
  const navigateToRegister = () => {
    navigation.replace("RegisterScreen")
  }

  return (
    <SafeAreaView style={[styles.container, responsive.isDesktop && styles.containerDesktop]}>
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
              <Text style={styles.desktopWelcomeText}>Accede a tu cuenta para gestionar tus citas y servicios</Text>
            </View>
            <View style={styles.sidebarFooter}>
              <Text style={styles.copyrightText}>© 2025 Servicio de Atención al Empleado</Text>
            </View>
          </View>

          {/* Panel de formulario con estilo iOS */}
          <View style={styles.desktopFormPanel}>
            <View style={styles.formContainer}>
              <Text style={styles.desktopFormTitle}>Iniciar Sesión</Text>
              <Text style={styles.desktopFormSubtitle}>Introduce tus credenciales para acceder</Text>

              <View style={styles.formFields}>
                <Input
                  title={"Usuario"}
                  ref={usernameRef}
                  containerStyle={styles.iosInputContainer}
                  inputStyle={styles.iosInput}
                  titleStyle={styles.iosInputLabel}
                />

                <Input
                  secureTextEntry={hide}
                  handleAction={() => setHide(!hide)}
                  ref={password}
                  title={"Contraseña"}
                  icon={hide ? "eye" : "eye-slash"}
                  containerStyle={styles.iosInputContainer}
                  inputStyle={styles.iosInput}
                  titleStyle={styles.iosInputLabel}
                />

                <TouchableOpacity style={styles.iosLoginButton} onPress={handleLogin} activeOpacity={0.8}>
                  <Text style={styles.iosLoginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.iosRegisterSection}>
                <Text style={styles.iosRegisterText}>¿No tienes una cuenta?</Text>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text style={styles.iosRegisterButtonText}>Registrarse</Text>
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
            <Text style={styles.iosAppSubtitle}>Servicio de Atención al Empleado</Text>

            {/* Campos de entrada con estilo iOS */}
            <View style={styles.iosFormContainer}>
              <Input
                title={"Usuario"}
                ref={usernameRef}
                containerStyle={styles.iosInputContainer}
                inputStyle={styles.iosInput}
                titleStyle={styles.iosInputLabel}
              />

              <Input
                secureTextEntry={hide}
                handleAction={() => setHide(!hide)}
                ref={password}
                title={"Contraseña"}
                icon={hide ? "eye" : "eye-slash"}
                containerStyle={styles.iosInputContainer}
                inputStyle={styles.iosInput}
                titleStyle={styles.iosInputLabel}
              />

              {/* Botón de inicio de sesión con estilo iOS */}
              <TouchableOpacity style={styles.iosLoginButton} onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.iosLoginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              {/* Sección de registro para móvil con estilo iOS */}
              <View style={styles.iosRegisterSection}>
                <Text style={styles.iosRegisterText}>¿No tienes una cuenta?</Text>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text style={styles.iosRegisterButtonText}>Registrarse</Text>
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
            <Text style={styles.iosLoadingText}>Iniciando Sesión...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Definición de estilos para la pantalla de inicio de sesión con estilo iOS
const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerDesktop: {
    backgroundColor: "#FFFFFF",
  },

  // Estilos iOS para móvil
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
  iosFormContainer: {
    width: "100%",
    marginTop: 20,
  },
  iosInputContainer: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5EA",
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
  iosLoginButton: {
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
  iosLoginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  iosRegisterSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  iosRegisterText: {
    fontSize: 15,
    color: "#8E8E93",
    marginRight: 6,
  },
  iosRegisterButtonText: {
    fontSize: 15,
    color: Colors.PRIMARYCOLOR,
    fontWeight: "600",
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
    maxWidth: 400,
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
  iosHelpSection: {
    marginTop: 40,
    alignItems: "center",
  },
  iosHelpText: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
  },
})

export default LoginScreen
