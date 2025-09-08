"use client"

import { useState } from "react"
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import SharedAppointmentsScreen from "../shared/AppointmentsScreen"
import UserDoc from "../shared/UserDoc"
import LogoutModal from "@components/LogOutModal"
import Colors from "@styles/colors"
import { useResponsive } from "../../hooks/use-responsive"

const Tab = createBottomTabNavigator()

// Empty component for the logout tab
const EmptyScreen = () => null

const HomeEmployee = () => {
  const navigation = useNavigation()
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const responsive = useResponsive()
  const [activeTab, setActiveTab] = useState("Citas")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      setIsLoggingOut(false)
      setLogoutModalVisible(false)
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      })
    }, 800)
  }

  const handleCancelLogout = () => {
    setLogoutModalVisible(false)
  }

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
            style={[styles.sidebarItem, activeTab === "Citas" && styles.sidebarItemActive, !sidebarExpanded && styles.sidebarItemCollapsed]}
            onPress={() => setActiveTab("Citas")}
          >
            <MaterialCommunityIcons
              name={activeTab === "Citas" ? "calendar-clock" : "calendar-clock-outline"}
              size={24}
              color={activeTab === "Citas" ? Colors.PRIMARYCOLOR : "#555"}
            />
            {sidebarExpanded && <Text style={[styles.sidebarItemText, activeTab === "Citas" && styles.sidebarItemTextActive]}>Mis Citas</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeTab === "Documentos" && styles.sidebarItemActive, !sidebarExpanded && styles.sidebarItemCollapsed]}
            onPress={() => setActiveTab("Documentos")}
          >
            <MaterialCommunityIcons
              name={activeTab === "Documentos" ? "file-document-multiple" : "file-document-multiple-outline"}
              size={24}
              color={activeTab === "Documentos" ? Colors.PRIMARYCOLOR : "#555"}
            />
            {sidebarExpanded && <Text style={[styles.sidebarItemText, activeTab === "Documentos" && styles.sidebarItemTextActive]}>Documentos</Text>}
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

  const renderContent = () => {
    if (responsive.isDesktop) {
      return (
        <View style={styles.desktopContentContainer}>
          {/* Use the shared component */}
          {activeTab === "Citas" ? <SharedAppointmentsScreen userRole="employee" /> : <UserDoc />}
        </View>
      )
    }

    // Mobile view using Tab.Navigator
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName
            if (route.name === "Citas") {
              iconName = focused ? "calendar-clock" : "calendar-clock-outline"
            } else if (route.name === "Documentos") {
              iconName = focused ? "file-document-multiple" : "file-document-multiple-outline"
            } else if (route.name === "Cerrar Sesión") {
              iconName = "logout"
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: "#777",
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
          tabBarLabelStyle: styles.tabBarLabelStyle,
        })}
      >
        {/* Use the shared component */}
        <Tab.Screen name="Citas" children={() => <SharedAppointmentsScreen userRole="employee" />} />
        <Tab.Screen name="Documentos" component={UserDoc} />
        <Tab.Screen
          name="Cerrar Sesión"
          component={EmptyScreen}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              setLogoutModalVisible(true)
            },
          }}
        />
      </Tab.Navigator>
    )
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={handleCancelLogout}
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
  tabBarStyle: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 5,
    height: Platform.OS === "ios" ? 85 : 65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: "600",
    paddingBottom: Platform.OS === "ios" ? 0 : 5,
  },
  desktopLayout: {
    flexDirection: "row",
    height: "100vh",
    width: "100%",
  },
  sidebarContainer: {
    width: 260,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
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
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
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
  sidebarItemCollapsed: {
    justifyContent: 'center',
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
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
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
  logoutButtonCollapsed: {
    justifyContent: 'center',
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
    backgroundColor: '#f8f9fa',
  },
  sidebarToggleButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -12 }],
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
});

export default HomeEmployee;
