"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, StatusBar, Platform, Text, TouchableOpacity, BackHandler, SafeAreaView } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import AppointmentsScreen from "@screens/shared/AppointmentsScreen"
import EmployeesScreen from "@screens/shared/EmployeesScreen"
import RequestsScreen from "@screens/shared/RequestScreen"
import Header from "@components/HeaderAdmin"
import LogoutModal from "@components/LogOutModal"
import Colors from "@styles/colors"
import { useResponsive } from "../../hooks/use-responsive"

const Tab = createBottomTabNavigator()

// Componente vacío para la pestaña de Salir
const EmptyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header userName="Admin" screenName="Perfil" />
    </SafeAreaView>
  )
}

const HomeManager = () => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigation = useNavigation()
  const responsive = useResponsive()
  const [activeTab, setActiveTab] = useState("Citas")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Función para alternar la visibilidad de la barra lateral
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setIsLoggingOut(true)

    // Simulamos un pequeño retraso para mostrar el indicador de carga
    setTimeout(() => {
      setIsLoggingOut(false)
      setLogoutModalVisible(false)
      // Navegamos a la pantalla de login
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      })
    }, 800)
  }

  // Función para cancelar el cierre de sesión
  const handleCancel = () => {
    setLogoutModalVisible(false)
  }

  // Manejamos el botón de retroceso en Android
  useEffect(() => {
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (logoutModalVisible) {
          handleCancel()
          return true
        }
        return false
      })

      return () => backHandler.remove()
    }
  }, [logoutModalVisible])

  // Renderizar la barra lateral para desktop
  const renderSidebar = () => {
    if (!responsive.isDesktop) return null

    return (
      <View style={[styles.sidebarContainer, !sidebarExpanded && styles.sidebarCollapsed]}>
        <View style={styles.sidebarHeader}>
          {sidebarExpanded ? (
            <>
              <Text style={styles.sidebarLogo}>Senda</Text>
              <TouchableOpacity style={styles.sidebarToggleButton} onPress={toggleSidebar}>
                <MaterialCommunityIcons name="chevron-left" size={24} color="#555" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.sidebarToggleButtonCollapsed} onPress={toggleSidebar}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#555" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={[
              styles.sidebarItem,
              activeTab === "Citas" && styles.sidebarItemActive,
              !sidebarExpanded && styles.sidebarItemCollapsed,
            ]}
            onPress={() => setActiveTab("Citas")}
          >
            <MaterialCommunityIcons
              name={activeTab === "Citas" ? "calendar-clock" : "calendar-clock-outline"}
              size={24}
              color={activeTab === "Citas" ? Colors.PRIMARYCOLOR : "#555"}
            />
            {sidebarExpanded && (
              <Text style={[styles.sidebarItemText, activeTab === "Citas" && styles.sidebarItemTextActive]}>Citas</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sidebarItem,
              activeTab === "Solicitudes" && styles.sidebarItemActive,
              !sidebarExpanded && styles.sidebarItemCollapsed,
            ]}
            onPress={() => setActiveTab("Solicitudes")}
          >
            <MaterialCommunityIcons
              name={activeTab === "Solicitudes" ? "clipboard-text" : "clipboard-text-outline"}
              size={24}
              color={activeTab === "Solicitudes" ? Colors.PRIMARYCOLOR : "#555"}
            />
            {sidebarExpanded && (
              <Text style={[styles.sidebarItemText, activeTab === "Solicitudes" && styles.sidebarItemTextActive]}>
                Solicitudes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sidebarItem,
              activeTab === "Empleados" && styles.sidebarItemActive,
              !sidebarExpanded && styles.sidebarItemCollapsed,
            ]}
            onPress={() => setActiveTab("Empleados")}
          >
            <MaterialCommunityIcons
              name={activeTab === "Empleados" ? "account-group" : "account-group-outline"}
              size={24}
              color={activeTab === "Empleados" ? Colors.PRIMARYCOLOR : "#555"}
            />
            {sidebarExpanded && (
              <Text style={[styles.sidebarItemText, activeTab === "Empleados" && styles.sidebarItemTextActive]}>
                Empleados
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarFooter}>
          <TouchableOpacity
            style={[styles.logoutButton, !sidebarExpanded && styles.logoutButtonCollapsed]}
            onPress={() => setLogoutModalVisible(true)}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#555" />
            {sidebarExpanded && <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Renderizar el contenido principal
  const renderContent = () => {
    if (responsive.isDesktop) {
      // En desktop, renderizamos el contenido según la pestaña activa
      return (
        <View style={styles.desktopContentContainer}>
          {activeTab === "Citas" && <AppointmentsScreen />}
          {activeTab === "Solicitudes" && <RequestsScreen />}
          {activeTab === "Empleados" && <EmployeesScreen />}
        </View>
      )
    }

    // En móvil, usamos el Tab.Navigator normal
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            // Iconos personalizados para cada pestaña
            switch (route.name) {
              case "Citas":
                return (
                  <MaterialCommunityIcons
                    name={focused ? "calendar-clock" : "calendar-clock-outline"}
                    size={size}
                    color={color}
                  />
                )
              case "Empleados":
                return (
                  <MaterialCommunityIcons
                    name={focused ? "account-group" : "account-group-outline"}
                    size={size}
                    color={color}
                  />
                )
              case "Solicitudes":
                return (
                  <MaterialCommunityIcons
                    name={focused ? "clipboard-text" : "clipboard-text-outline"}
                    size={size}
                    color={color}
                  />
                )
              case "Salir":
                return <MaterialCommunityIcons name="logout" size={size} color={color} />
              default:
                return null
            }
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: "#777",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#eee",
            paddingTop: 5,
            height: Platform.OS === "ios" ? 85 : 65,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            paddingBottom: Platform.OS === "ios" ? 0 : 5,
          },
          tabBarItemStyle: {
            paddingTop: 5,
          },
        })}
        initialRouteName="Citas"
        backBehavior="initialRoute"
      >
        <Tab.Screen
          name="Citas"
          component={AppointmentsScreen}
          options={{ headerShown: false, tabBarLabel: "Citas" }}
        />

        <Tab.Screen
          name="Solicitudes"
          component={RequestsScreen}
          options={{ headerShown: false, tabBarLabel: "Solicitudes" }}
        />

        <Tab.Screen
          name="Empleados"
          component={EmployeesScreen}
          options={{ headerShown: false, tabBarLabel: "Empleados" }}
        />

        {/* Pestaña para cerrar sesión */}
        <Tab.Screen
          name="Salir"
          component={EmptyScreen}
          options={{ headerShown: false, tabBarLabel: "Salir" }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevenimos la navegación por defecto
              e.preventDefault()

              // Mostramos el modal de confirmación
              setLogoutModalVisible(true)
            },
          })}
        />
      </Tab.Navigator>
    )
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Modal de confirmación de cierre de sesión */}
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={handleCancel}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {responsive.isDesktop ? (
        <View style={styles.desktopLayout}>
          {renderSidebar()}
          {renderContent()}
        </View>
      ) : (
        renderContent()
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  // Estilos para la barra lateral en desktop
  desktopLayout: {
    flexDirection: "row",
    height: "100vh",
    width: "100%",
  },
  sidebarContainer: {
    width: 260,
    backgroundColor: "#fff",
    borderRight: "1px solid #e5e7eb",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "1px 0 5px rgba(0, 0, 0, 0.05)",
    transition: "width 0.3s ease",
  },
  sidebarCollapsed: {
    width: 70,
  },
  sidebarHeader: {
    padding: 20,
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarLogo: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.PRIMARYCOLOR,
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  sidebarItemActive: {
    backgroundColor: "#f3f4f6",
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginLeft: 12,
  },
  sidebarItemTextActive: {
    color: Colors.PRIMARYCOLOR,
    fontWeight: "600",
  },
  sidebarFooter: {
    padding: 16,
    borderTop: "1px solid #f3f4f6",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginLeft: 12,
  },
  desktopContentContainer: {
    flex: 1,
    height: "100%",
    overflow: "auto",
  },
  sidebarToggleButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#f3f4f6",
  },
  sidebarToggleButtonCollapsed: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#f3f4f6",
    alignSelf: "center",
  },
  sidebarItemCollapsed: {
    justifyContent: "center",
    padding: 12,
  },
  logoutButtonCollapsed: {
    justifyContent: "center",
    padding: 12,
  },
})

export default HomeManager