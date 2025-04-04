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
  const [isLoading, setIsLoading] = useState(false) // Estado para controlar la visibilidad del modal de carga

  const navigation = useNavigation() // Hook para manejar la navegación entre pantallas

  // Referencias para los campos de entrada (usuario y contraseña)
  const password = useRef()
  const usernameRef = useRef()
  const phoneNumberRef = useRef()
  const workerIdRef = useRef()

  // Estado que controla la visibilidad de la contraseña en el campo de entrada
  const [hide, setHide] = useState(true)

  /**
   * Función que maneja el proceso de inicio de sesión.
   * - Obtiene el valor ingresado en el campo de usuario.
   * - Si el usuario ingresa '1', se redirige a la pantalla de administrador.
   * - En caso contrario, se redirige a la pantalla de usuario.
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
            alert("Inicio de seisón correcto")
          } else {
            setIsLoading(false)
            alert("Usuario o contraseña incorectos")
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
              <Text style={styles.desktopWelcomeTitle}>Bienvenido</Text>
              <Text style={styles.desktopWelcomeText}>Accede a tu cuenta para gestionar tus citas y servicios</Text>
            </View>
            <View style={styles.sidebarFooter}>
              <Text style={styles.copyrightText}>© 2025 Servicio de Atención al Empleado</Text>
            </View>
          </View>

          {/* Panel de formulario */}
          <View style={styles.desktopFormPanel}>
            <View style={styles.formContainer}>
              <Text style={styles.desktopFormTitle}>Iniciar Sesión</Text>
              <Text style={styles.desktopFormSubtitle}>Introduce tus credenciales para acceder al sistema</Text>

              <View style={styles.formFields}>
                <Input title={"Usuario"} ref={usernameRef} />

                <Input
                  secureTextEntry={hide}
                  handleAction={() => setHide(!hide)}
                  ref={password}
                  title={"Contraseña"}
                  icon={hide ? "eye" : "eye-slash"}
                />

                <TouchableOpacity style={[styles.loginButton, styles.loginButtonDesktop]} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpText}>¿Necesitas ayuda? Contacta con el administrador del sistema</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        // Layout para móvil - diseño original
        <>
          {/* Barra decorativa superior */}
          <View style={styles.decorativeHeader} />

          {/* Personalización de la barra de estado */}
          <StatusBar translucent={true} backgroundColor={"transparent"} />

          {/* Contenedor principal con manejo del teclado para evitar solapamiento en dispositivos iOS */}
          <KeyboardAvoidingView
            style={styles.content}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
          >
            {/* ScrollView permite desplazarse cuando el teclado está activo */}
            <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
              {/* Encabezado con el logo de la aplicación */}
              <View style={styles.header}>
                <Image source={require("@assets/icon.png")} style={styles.logo} resizeMode="contain" />
              </View>

              {/* Título de la aplicación */}
              <Text style={styles.appTitle}>Servicio de Atención al Empleado</Text>

              {/* Campo de entrada para el usuario */}
              <Input title={"Usuario"} ref={usernameRef} />

              {/* Campo de entrada para la contraseña con opción de ocultar/mostrar texto */}
              <Input
                secureTextEntry={hide}
                handleAction={() => setHide(!hide)}
                ref={password}
                title={"Contraseña"}
                icon={hide ? "eye" : "eye-slash"}
              />

              {/* Botón de inicio de sesión */}
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}

      {/* Modal de carga - común para ambos layouts */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={[styles.modalContainer, responsive.isDesktop && styles.modalContainerDesktop]}>
          <View style={[styles.modalContent, responsive.isDesktop && styles.modalContentDesktop]}>
            <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
            <Text style={[styles.loadingText, responsive.isDesktop && styles.loadingTextDesktop]}>
              Iniciando Sesión...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Definición de estilos para la pantalla de inicio de sesión
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
    paddingBottom: 20,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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

  // Botón de inicio de sesión con estilos personalizados
  loginButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginTop: 20,
  },
  loginButtonDesktop: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 30,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 10px rgba(22, 107, 255, 0.3)",
        ":hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 15px rgba(22, 107, 255, 0.4)",
          backgroundColor: "#0055e6",
        },
      },
    }),
  },

  // Texto del botón de inicio de sesión
  loginButtonText: {
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalContentDesktop: {
    padding: 30,
    borderRadius: 16,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
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
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
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
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 450,
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
    marginBottom: 40,
  },
  formFields: {
    width: "100%",
  },
  helpSection: {
    marginTop: 40,
    alignItems: "center",
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
})

export default LoginScreen

