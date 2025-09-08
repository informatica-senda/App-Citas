"use client"

import { useState, useEffect } from "react"
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import SharedAppointmentsScreen from "../shared/AppointmentsScreen"
import UserDoc from "../shared/UserDoc"
import LogoutModal from "@components/LogOutModal"
import Colors from "@styles/colors"
import { db, auth } from "../../../firebaseConfig.js"
import { getDoc, doc } from "firebase/firestore"

const Tab = createBottomTabNavigator()

// Empty component for the logout tab listener
const EmptyScreen = () => {
  return null
}

const HomeUser = () => {
  const navigation = useNavigation()
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState("Citas")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [userData, setUserData] = useState(null)

  // Get screen dimensions for responsive design
  const screenWidth = Dimensions.get("window").width
  const isDesktop = screenWidth >= 768

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) return

        const userDoc = await getDoc(doc(db, "users", currentUser.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data())
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  // Function to toggle the sidebar visibility
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      setIsLoggingOut(false)
      setLogoutModalVisible(false)
      auth.signOut().then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "LoginScreen" }],
        })
      })
    }, 800)
  }

  const handleCancelLogout = () => {
    setLogoutModalVisible(false)
  }

  // Render the sidebar for desktop view
  const renderSidebar = () => {
    if (!isDesktop) return null

    return (
      <View style={[styles.iosSidebarContainer, !sidebarExpanded && styles.iosSidebarCollapsed]}>
        <View style={styles.iosSidebarHeader}>
          {sidebarExpanded ? (
            <>
              <Text style={styles.iosSidebarLogo}>Senda</Text>
              <TouchableOpacity style={styles.iosSidebarToggleButton} onPress={toggleSidebar}>
                <MaterialCommunityIcons name="chevron-left" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.iosSidebarToggleButtonCollapsed} onPress={toggleSidebar}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.iosSidebarContent}>
          <TouchableOpacity
            style={[styles.iosSidebarItem, activeTab === "Citas" && styles.iosSidebarItemActive, !sidebarExpanded && styles.iosSidebarItemCollapsed]}
            onPress={() => setActiveTab("Citas")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="calendar-clock" size={24} color={activeTab === "Citas" ? Colors.PRIMARYCOLOR : "#8E8E93"} />
            {sidebarExpanded && <Text style={[styles.iosSidebarItemText, activeTab === "Citas" && styles.iosSidebarItemTextActive]}>Mis Citas</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iosSidebarItem, activeTab === "Documentos" && styles.iosSidebarItemActive, !sidebarExpanded && styles.iosSidebarItemCollapsed]}
            onPress={() => setActiveTab("Documentos")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="file-document-multiple" size={24} color={activeTab === "Documentos" ? Colors.PRIMARYCOLOR : "#8E8E93"} />
            {sidebarExpanded && <Text style={[styles.iosSidebarItemText, activeTab === "Documentos" && styles.iosSidebarItemTextActive]}>Documentos</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.iosSidebarFooter}>
          <TouchableOpacity
            style={[styles.iosLogoutButton, !sidebarExpanded && styles.iosLogoutButtonCollapsed]}
            onPress={() => setLogoutModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#8E8E93" />
            {sidebarExpanded && <Text style={styles.iosLogoutButtonText}>Cerrar Sesión</Text>}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Render the main content
  const renderContent = () => {
    if (isDesktop) {
      return (
        <View style={styles.iosDesktopContentContainer}>
          {activeTab === "Citas" ? <SharedAppointmentsScreen userRole="user" /> : <UserDoc />}
        </View>
      )
    }

    // On mobile, use Tab.Navigator
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName
            if (route.name === "Citas") {
              iconName = "calendar-clock"
            } else if (route.name === "Documentos") {
              iconName = "file-document-multiple"
            } else if (route.name === "Cerrar Sesión") {
              iconName = "logout"
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: "#8E8E93",
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        })}
      >
        <Tab.Screen name="Citas" children={() => <SharedAppointmentsScreen userRole="user" />} />
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
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
        modalStyle={styles.iosModal}
        contentStyle={styles.iosModalContent}
        titleStyle={styles.iosModalTitle}
        textStyle={styles.iosModalText}
        buttonStyle={styles.iosModalButton}
        buttonTextStyle={styles.iosModalButtonText}
      />
      {isDesktop ? (
        <View style={styles.iosDesktopLayout}>
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
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 5,
    height: Platform.OS === "ios" ? 85 : 65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
    paddingBottom: Platform.OS === "ios" ? 0 : 5,
  },
  iosDesktopLayout: {
    flexDirection: "row",
    height: "100vh",
    width: "100%",
    backgroundColor: "#F2F2F7",
  },
  iosSidebarContainer: {
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E5E5EA",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.2s ease-in-out",
  },
  iosSidebarCollapsed: {
    width: 80,
  },
  iosSidebarHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iosSidebarLogo: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.PRIMARYCOLOR,
    opacity: 1,
    transition: "opacity 0.2s ease-in-out",
  },
  iosSidebarToggleButton: {
    padding: 5,
  },
   iosSidebarToggleButtonCollapsed: {
    margin: 'auto'
  },
  iosSidebarContent: {
    flex: 1,
    padding: 16,
  },
  iosSidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  iosSidebarItemActive: {
    backgroundColor: "#F2F2F7",
  },
  iosSidebarItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3A3A3C",
    marginLeft: 16,
  },
  iosSidebarItemTextActive: {
    color: Colors.PRIMARYCOLOR,
    fontWeight: "600",
  },
  iosSidebarItemCollapsed: {
    justifyContent: "center",
  },
  iosSidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  iosLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
  },
  iosLogoutButtonCollapsed: {
    justifyContent: "center",
  },
  iosLogoutButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
    marginLeft: 16,
  },
  iosDesktopContentContainer: {
    flex: 1,
    height: "100%",
    overflow: "auto",
  },
  iosModal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  iosModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iosModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  iosModalText: {
    fontSize: 17,
    color: "#000000",
    marginBottom: 20,
    textAlign: "center",
  },
  iosModalButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  iosModalButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default HomeUser;
