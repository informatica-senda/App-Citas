"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  Text,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "@components/HeaderUser";
import AppointmentModal from "@components/AppointmentModal";
import AppointmentModalAdmin from "@components/AppointmentModalAdmin";
import Colors from "@styles/colors";
import LogoutModal from "@components/LogOutModal";
import ServiceSelectionModal from "@components/RequestServiceModal";
import AppointmentCalendarScreen from "@components/AppoimentCalendarScreen";
import { db, auth } from "../../../firebaseConfig.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  limit,
} from "firebase/firestore";
import {
  formatDate,
  extractTime,
  formatFirestoreDate,
} from "../../utils/date.js";
import styles from "./styles.js";

// --- Static Data for Employee Role ---
/* const EMPLOYEE_APPOINTMENTS = [
  {
    id: 1,
    title: "Consulta de Psicología",
    date: "2025-04-08",
    category: "psychology",
    time: "10:00",
    doctor: "Dr. García",
    state: true,
  },
  {
    id: 2,
    title: "Consulta de Nutrición",
    date: "2025-04-08",
    category: "nutrition",
    time: "14:30",
    doctor: "Dra. Martínez",
    state: false,
  },
  // Add more static appointments if needed
]; */

const SharedAppointmentsScreen = ({ userRole }) => {
  const navigation = useNavigation();

  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState({ name: "Usuario" });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and View
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'psychology', 'nutrition'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'confirmed', 'pending'
  const [listOnlyView, setListOnlyView] = useState(false);

  // Calendar and Dates
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // User/Request Flow
  const [selectedService, setSelectedService] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Responsive Design
  const screenWidth = Dimensions.get("window").width;
  const isDesktop = screenWidth >= 768;

  // --- DATA FETCHING ---
  const setupAppointmentsListener = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return () => {};
      }

      const userDocRef = doc(db, "users", currentUser.uid);

      const fetchUserData = async () => {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(
            "[Appointments] Auth UID:",
            currentUser.uid,
            "| role (Firestore):",
            userData.role,
            "| role (prop userRole):",
            userRole
          );
          setUser({
            name: userData.name || userData.firstName || "Usuario",
            id: currentUser.uid,
            role: userData.role || "user",
          });
          setCompanyId(userData.companyId);
        }
      };

      fetchUserData();

      // --- Role-based Data Logic ---
      if (userRole === "user") {
        const appointmentsQuery = query(
          collection(db, "dates"),
          where("userId", "==", currentUser.uid)
        );
        return onSnapshot(
          appointmentsQuery,
          async (snapshot) => {
            setIsUpdating(true);

            const appointmentsData = await Promise.all(
              snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();

                // Obtener nombre del teacher (si hay)
                let teacherName = null;
                if (data.teacherId) {
                  try {
                    const teacherDoc = await getDoc(
                      doc(db, "users", data.teacherId)
                    );
                    if (teacherDoc.exists()) {
                      const t = teacherDoc.data();
                      const fullName = `${t.name || ""} ${
                        t.lastName || ""
                      }`.trim();
                      teacherName = fullName || null;
                    }
                  } catch (e) {
                    console.warn(
                      "No se pudo obtener el nombre del teacher:",
                      e
                    );
                  }
                }

                return {
                  id: docSnap.id,
                  title: `Consulta de ${
                    data.service === "psychology" ? "Psicología" : "Nutrición"
                  }`,
                  date: data.date
                    ? formatFirestoreDate(data.date)
                    : "Sin fecha",
                  category: data.service || "other",
                  time: data.date ? extractTime(data.date) : "Sin hora",
                  // 👇 Mostrar nombre del teacher (o 'Sin asignar')
                  doctor: teacherName || "Sin asignar",
                  state: data.state,
                  teacherId: data.teacherId || "sin asignar",
                  rawData: data,
                };
              })
            );

            setAppointments(appointmentsData);
            setLoading(false);
            setIsUpdating(false);
          },
          (err) => {
            console.error("Error listening to user appointments:", err);
            setError("Error al cargar las citas.");
            setLoading(false);
            setIsUpdating(false);
          }
        );
      } else if (userRole === "manager" || userRole === "teacher") {
        if (!companyId) {
          setLoading(false);
          return () => {};
        }

        let usersQuery;
        if (userRole === "manager") {
          usersQuery = query(
            collection(db, "users"),
            where("role", "==", "user"),
            where("companyId", "==", companyId)
          );
        } else {
          // teacher
          usersQuery = query(
            collection(db, "users"),
            where("role", "in", ["user", "externalUser"])
          );
        }

        return onSnapshot(
          usersQuery,
          (userSnapshot) => {
            const userIds = userSnapshot.docs.map((doc) => doc.id);
            if (userIds.length === 0) {
              setAppointments([]);
              setLoading(false);
              return;
            }

            // Helper function to query in chunks
            const queryInChunks = (collectionRef, field, values) => {
              const chunks = [];
              for (let i = 0; i < values.length; i += 10) {
                chunks.push(values.slice(i, i + 10));
              }
              return chunks.map((chunk) =>
                query(collectionRef, where(field, "in", chunk))
              );
            };

            const datesQueries = queryInChunks(
              collection(db, "dates"),
              "userId",
              userIds
            );

            // Removing the where("date", "!=", null) from the query

            const unsubscribes = datesQueries.map((q) =>
              onSnapshot(
                q,
                async (dateSnapshot) => {
                  setIsUpdating(true);
                  const appointmentsData = await Promise.all(
                    dateSnapshot.docs.map(async (dateDoc) => {
                      const data = dateDoc.data();
                      const userDoc = await getDoc(
                        doc(db, "users", data.userId)
                      );
                      const userData = userDoc.exists() ? userDoc.data() : {};
                      let teacherData = {};
                      if (data.teacherId) {
                        const teacherDoc = await getDoc(
                          doc(db, "users", data.teacherId)
                        );
                        teacherData = teacherDoc.exists()
                          ? teacherDoc.data()
                          : {};
                      }
                      return {
                        id: dateDoc.id,
                        date: data.date
                          ? formatFirestoreDate(data.date)
                          : "Sin fecha",
                        time: data.date ? extractTime(data.date) : "Sin hora",
                        category: data.service || "",
                        state: data.state,
                        title: `Cita de ${
                          data.service === "psychology"
                            ? "Psicología"
                            : "Nutrición"
                        }`,
                        client: `${userData.name || ""} ${
                          userData.lastName || ""
                        }`.trim(),
                        employee: teacherData.name
                          ? `${teacherData.name} ${
                              teacherData.lastName || ""
                            }`.trim()
                          : "Sin asignar",
                        phone: userData.phone || "Sin teléfono",
                        clientPhone: userData.phone || null,
                        employeePhone: teacherData.phone || null,
                        companyId: data.companyId || null,
                        status: data.state ? "confirmed" : "pending",
                        userId: data.userId,
                        teacherId: data.teacherId,
                        rawData: data,
                      };
                    })
                  );

                  const normalizedAppointmentsData =
                    userRole === "teacher"
                      ? appointmentsData.filter((a) => a?.rawData?.date) // solo con fecha real
                      : appointmentsData;

                  // Merge new data with existing appointments
                  setAppointments((prev) => {
                    const newAppointments = normalizedAppointmentsData.filter(
                      (newApp) =>
                        !prev.some((existing) => existing.id === newApp.id)
                    );
                    const updatedAppointments = prev.map((existing) => {
                      const updated = normalizedAppointmentsData.find(
                        (a) => a.id === existing.id
                      );
                      return updated ? updated : existing;
                    });
                    return [...updatedAppointments, ...newAppointments];
                  });

                  setLoading(false);
                  setIsUpdating(false);
                },
                (err) => {
                  console.error("Error listening to admin appointments:", err);
                  setError("Error al cargar las citas.");
                  setLoading(false);
                  setIsUpdating(false);
                }
              )
            );

            return () => unsubscribes.forEach((unsub) => unsub());
          },
          (err) => {
            console.error("Error listening to users:", err);
            setError("Error al cargar los usuarios.");
            setLoading(false);
          }
        );
      }
    } catch (err) {
      console.error("Error setting up listener:", err);
      setError("Ocurrió un error inesperado.");
      setLoading(false);
      return () => {};
    }
  }, [userRole, companyId]);

  // --- HELPERS ---
  const findTeacherIdByService = async (serviceType) => {
    try {
      const normalized = (serviceType || "").toLowerCase();
      const q = query(
        collection(db, "users"),
        where("role", "==", "teacher"),
        where("subject", "==", normalized),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].id;
      }
      return null;
    } catch (e) {
      console.error("Error fetching teacher for service:", e);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = setupAppointmentsListener();
    return () => unsubscribe && unsubscribe();
  }, [setupAppointmentsListener]);

  // --- MARKED DATES ---
  useEffect(() => {
    const marked = {};
    const filteredAppointments = appointments.filter(
      (appointment) =>
        activeFilter === "all" || appointment.category === activeFilter
    );

    filteredAppointments.forEach((appointment) => {
      if (!appointment.date) return;

      const dots = marked[appointment.date]?.dots || [];
      if (
        appointment.category === "psychology" &&
        !dots.some((d) => d.key === "psychology")
      ) {
        dots.push({ key: "psychology", color: Colors.PSICOLOGIA });
      }
      if (
        appointment.category === "nutrition" &&
        !dots.some((d) => d.key === "nutrition")
      ) {
        dots.push({ key: "nutrition", color: Colors.NUTRICIÓN });
      }

      marked[appointment.date] = { dots, marked: true };
    });

    if (selectedDate && marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor =
        activeFilter === "psychology"
          ? Colors.PSICOLOGIA
          : activeFilter === "nutrition"
          ? Colors.NUTRICIÓN
          : Colors.PRIMARYCOLOR;
    } else if (selectedDate) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: Colors.PRIMARYCOLOR,
      };
    }
    setMarkedDates(marked);
  }, [appointments, selectedDate, activeFilter]);

  // --- HANDLERS ---
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString === selectedDate ? "" : day.dateString);
  };

  const clearDateSelection = () => {
    setSelectedDate("");
  };

  const toggleViewMode = () => {
    setListOnlyView(!listOnlyView);
  };

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const handleDeleteAppointment = (id) => {
    setAppointments((prev) =>
      prev.filter((appointment) => appointment.id !== id)
    );
  };

  // User-specific handlers
  const openServiceModal = () => {
    setServiceModalVisible(true);
  };

  const handleServiceConfirm = async (serviceType) => {
    setServiceModalVisible(false);
    setSelectedService(serviceType);

    if (userRole === "externalUser") {
      setCalendarVisible(true);
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const teacherId = await findTeacherIdByService(serviceType);
      await addDoc(collection(db, "dates"), {
        userId: currentUser.uid,
        service: serviceType.toLowerCase(),
        state: false,
        date: null,
        companyId: companyId,
        teacherId: teacherId || null,
      });
      alert("Solicitud enviada correctamente.");
    } catch (error) {
      console.error("Error al guardar la solicitud:", error);
      alert("Error al guardar la solicitud.");
    }
  };

  const handleCalendarClose = () => {
    setCalendarVisible(false);
  };

  const handleAppointmentConfirm = async (appointmentDate) => {
    setCalendarVisible(false);
    const currentUser = auth.currentUser;
    if (!currentUser || !user || !selectedService) return;

    try {
      const teacherId = await findTeacherIdByService(selectedService);
      await addDoc(collection(db, "dates"), {
        userId: currentUser.uid,
        service: selectedService.toLowerCase(),
        state: false,
        date: appointmentDate,
        companyId: companyId,
        teacherId: teacherId || null,
      });
      alert("Cita creada correctamente.");
    } catch (error) {
      console.error("Error al guardar la cita:", error);
      alert("Error al guardar la cita.");
    }
  };

  // --- FILTERING ---
  const getFilteredAppointments = () => {
    return appointments.filter((appointment) => {
      const matchesCategory =
        activeFilter === "all" || appointment.category === activeFilter;
      const matchesDate = !selectedDate || appointment.date === selectedDate;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "confirmed" && appointment.state === true) ||
        (statusFilter === "pending" &&
          (appointment.state === false || appointment.state === undefined));
      return matchesCategory && matchesDate && matchesStatus;
    });
  };

  // --- RENDER METHODS ---
  const renderLoading = () => (
    <View style={styles.iosLoadingContainer}>
      <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
      <Text style={styles.iosLoadingText}>Cargando citas...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.iosErrorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
      <Text style={styles.iosErrorText}>{error}</Text>
      <TouchableOpacity
        style={styles.iosRetryButton}
        onPress={() => setupAppointmentsListener()}
      >
        <Text style={styles.iosRetryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppointmentsList = () => {
    const filteredAppointments = getFilteredAppointments();

    if (loading) return renderLoading();
    if (error) return renderError();

    return (
      <View style={styles.iosAppointmentsList}>
        <View style={styles.iosSelectedDateHeader}>
          <View style={styles.iosStatusFilterContainer}>
            <TouchableOpacity
              style={[
                styles.iosStatusFilterButton,
                statusFilter === "all" && styles.iosStatusFilterButtonActive,
              ]}
              onPress={() => setStatusFilter("all")}
            >
              <Ionicons
                name="apps"
                size={18}
                color={statusFilter === "all" ? "#FFFFFF" : "#8E8E93"}
              />
              <Text
                style={[
                  styles.iosStatusFilterText,
                  statusFilter === "all" && styles.iosStatusFilterTextActive,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iosStatusFilterButton,
                statusFilter === "confirmed" &&
                  styles.iosStatusFilterButtonConfirmed,
              ]}
              onPress={() => setStatusFilter("confirmed")}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={statusFilter === "confirmed" ? "#FFFFFF" : "#8E8E93"}
              />
              <Text
                style={[
                  styles.iosStatusFilterText,
                  statusFilter === "confirmed" &&
                    styles.iosStatusFilterTextActive,
                ]}
              >
                Confirmadas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iosStatusFilterButton,
                statusFilter === "pending" &&
                  styles.iosStatusFilterButtonPending,
              ]}
              onPress={() => setStatusFilter("pending")}
            >
              <Ionicons
                name="time"
                size={18}
                color={statusFilter === "pending" ? "#FFFFFF" : "#8E8E93"}
              />
              <Text
                style={[
                  styles.iosStatusFilterText,
                  statusFilter === "pending" &&
                    styles.iosStatusFilterTextActive,
                ]}
              >
                Pendientes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isUpdating && (
          <View style={styles.iosUpdatingContainer}>
            <ActivityIndicator size="small" color={Colors.PRIMARYCOLOR} />
            <Text style={styles.iosUpdatingText}>Actualizando...</Text>
          </View>
        )}

        {filteredAppointments.length === 0 ? (
          <View style={styles.iosEmptyStateContainer}>
            <Text style={styles.iosNoAppointmentsText}>
              No se encontraron citas con los filtros seleccionados.
            </Text>
            <TouchableOpacity
              style={styles.iosClearFilterButton}
              onPress={() => {
                clearDateSelection();
                setStatusFilter("all");
                setActiveFilter("all");
              }}
            >
              <Text style={styles.iosClearFilterButtonText}>
                Limpiar todos los filtros
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={
              isDesktop && !listOnlyView
                ? styles.iosAppointmentsGridDesktop
                : undefined
            }
          >
            {filteredAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={[
                  styles.iosAppointmentItemCompact,
                  appointment.category === "psychology"
                    ? styles.iosPsychologyItem
                    : styles.iosNutritionItem,
                  isDesktop &&
                    !listOnlyView &&
                    styles.iosAppointmentItemDesktop,
                ]}
                onPress={() => handleSelectAppointment(appointment)}
                activeOpacity={0.7}
              >
                <View style={styles.iosAppointmentRow}>
                  <View style={styles.iosAppointmentMainInfo}>
                    <Text style={styles.iosAppointmentTitleCompact}>
                      {appointment.title}
                    </Text>
                    <View style={styles.iosAppointmentTimeRow}>
                      <Ionicons name="time-outline" size={14} color="#8E8E93" />
                      <Text style={styles.iosDetailTextCompact}>
                        {appointment.time || "Sin hora"}
                      </Text>
                      <Text style={styles.iosDateSeparator}>•</Text>
                      <Text style={styles.iosDetailTextCompact}>
                        {appointment.date
                          ? formatDate(appointment.date)
                          : "Sin fecha"}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.iosCategoryBadgeCompact,
                      appointment.category === "psychology"
                        ? styles.iosPsychologyBadge
                        : styles.iosNutritionBadge,
                    ]}
                  >
                    <Text style={styles.iosCategoryTextCompact}>
                      {appointment.category === "psychology"
                        ? "Psic."
                        : "Nutr."}
                    </Text>
                  </View>
                </View>

                {userRole !== "user" && (
                  <View style={styles.iosDoctorRow}>
                    <Ionicons name="person-outline" size={14} color="#8E8E93" />
                    <Text style={styles.iosDetailTextCompact}>
                      {appointment.client || "No especificado"}
                    </Text>
                  </View>
                )}

                <View style={styles.iosDoctorRow}>
                  <Ionicons
                    name={
                      userRole === "user" ? "person-outline" : "medical-outline"
                    }
                    size={14}
                    color="#8E8E93"
                  />
                  <Text style={styles.iosDetailTextCompact}>
                    {userRole === "user"
                      ? appointment.doctor
                      : appointment.employee}
                  </Text>
                </View>

                <View style={styles.iosStatusRow}>
                  <View
                    style={[
                      styles.iosStatusIndicator,
                      appointment.state
                        ? styles.iosStatusConfirmed
                        : styles.iosStatusPending,
                    ]}
                  />
                  <Text style={styles.iosStatusText}>
                    {appointment.state ? "Confirmada" : "Pendiente"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.iosSafeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.iosHeaderContainer}>
        <Header
          userName={user.name}
          screenName={userRole === "user" ? "Mis Citas" : "Citas"}
          headerStyle={styles.iosHeader}
          titleStyle={styles.iosHeaderTitle}
        />
        <TouchableOpacity
          style={styles.iosViewToggleButton}
          onPress={toggleViewMode}
        >
          <Ionicons
            name={listOnlyView ? "calendar-outline" : "list-outline"}
            size={24}
            color={Colors.PRIMARYCOLOR}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.iosContainer}>
        <View style={styles.iosFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.iosFilterScrollContent}
          >
            {/* Category Filters */}
            <TouchableOpacity
              style={[
                styles.iosFilterButton,
                activeFilter === "all" && styles.iosFilterButtonActive,
              ]}
              onPress={() => setActiveFilter("all")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.iosFilterText,
                  activeFilter === "all" && styles.iosFilterTextActive,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iosFilterButton,
                activeFilter === "psychology" &&
                  styles.iosPsychologyFilterActive,
              ]}
              onPress={() => setActiveFilter("psychology")}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="brain"
                size={14}
                color={activeFilter === "psychology" ? "#FFFFFF" : "#8E8E93"}
                style={styles.iosFilterIcon}
              />
              <Text
                style={[
                  styles.iosFilterText,
                  activeFilter === "psychology" && styles.iosFilterTextActive,
                ]}
              >
                Psicología
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iosFilterButton,
                activeFilter === "nutrition" && styles.iosNutritionFilterActive,
              ]}
              onPress={() => setActiveFilter("nutrition")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="food-apple"
                size={16}
                color={activeFilter === "nutrition" ? "#FFFFFF" : "#8E8E93"}
                style={styles.iosFilterIcon}
              />
              <Text
                style={[
                  styles.iosFilterText,
                  activeFilter === "nutrition" && styles.iosFilterTextActive,
                ]}
              >
                Nutrición
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {isDesktop && !listOnlyView ? (
          // --- Desktop Layout ---
          <View style={styles.iosContentContainerDesktop}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.iosScrollViewDesktop}
              contentContainerStyle={styles.iosScrollContentDesktop}
            >
              {(userRole === "user" || userRole === "externalUser") && (
                <TouchableOpacity
                  style={styles.iosRequestServiceButton}
                  onPress={openServiceModal}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="#FFFFFF"
                    style={styles.iosButtonIcon}
                  />
                  <Text style={styles.iosRequestServiceButtonText}>
                    Solicitar nueva cita
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.iosCalendarContainer}>
                <Calendar
                  current={selectedDate || undefined}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  markingType={"multi-dot"}
                  theme={{
                    calendarBackground: "#FFFFFF",
                    todayTextColor: Colors.PRIMARYCOLOR,
                    arrowColor: Colors.PRIMARYCOLOR,
                    monthTextColor: Colors.PRIMARYCOLOR,
                    textMonthFontWeight: "600",
                  }}
                />
              </View>
              {selectedDate && (
                <TouchableOpacity
                  style={styles.iosClearDateButtonLarge}
                  onPress={clearDateSelection}
                  activeOpacity={0.8}
                >
                  <Text style={styles.iosClearDateButtonText}>
                    Limpiar selección
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <ScrollView
              style={styles.iosAppointmentsScrollDesktop}
              showsVerticalScrollIndicator={false}
            >
              {renderAppointmentsList()}
            </ScrollView>
          </View>
        ) : (
          // --- Mobile Layout ---
          <ScrollView
            style={styles.iosMobileScrollView}
            contentContainerStyle={styles.iosMobileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {(userRole === "user" || userRole === "externalUser") && (
              <TouchableOpacity
                style={styles.iosRequestServiceButton}
                onPress={openServiceModal}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#FFFFFF"
                  style={styles.iosButtonIcon}
                />
                <Text style={styles.iosRequestServiceButtonText}>
                  Solicitar nueva cita
                </Text>
              </TouchableOpacity>
            )}
            {!listOnlyView && (
              <>
                <View style={styles.iosCalendarContainer}>
                  <Calendar
                    current={selectedDate || undefined}
                    onDayPress={handleDayPress}
                    markedDates={markedDates}
                    markingType={"multi-dot"}
                    theme={{
                      calendarBackground: "#FFFFFF",
                      todayTextColor: Colors.PRIMARYCOLOR,
                      arrowColor: Colors.PRIMARYCOLOR,
                      monthTextColor: Colors.PRIMARYCOLOR,
                      textMonthFontWeight: "600",
                    }}
                  />
                </View>
                {selectedDate && (
                  <TouchableOpacity
                    style={styles.iosClearDateButtonLarge}
                    onPress={clearDateSelection}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.iosClearDateButtonText}>
                      Limpiar selección
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {renderAppointmentsList()}
          </ScrollView>
        )}
      </View>

      {/* --- MODALS --- */}
      {userRole === "user" ||
      userRole === "externalUser" ? (
        <AppointmentModal
          appointment={selectedAppointment}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      ) : (
        <AppointmentModalAdmin
          appointment={selectedAppointment}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onDelete={handleDeleteAppointment}
          viewerRole={userRole}
        />
      )}

      {(userRole === "user" || userRole === "externalUser") && (
        <>
          <ServiceSelectionModal
            visible={serviceModalVisible}
            onClose={() => setServiceModalVisible(false)}
            onConfirm={handleServiceConfirm}
          />
          {calendarVisible && (
            <View style={styles.iosCalendarScreenOverlay}>
              <AppointmentCalendarScreen
                onClose={handleCalendarClose}
                onConfirm={handleAppointmentConfirm}
                patientName={user.name}
                service={selectedService}
                companyId={companyId}
              />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default SharedAppointmentsScreen;
