"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@styles/colors";
import Header from "@components/HeaderAdmin.js";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useResponsive } from "../../hooks/use-responsive";
import { db, auth } from "../../../firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import styles from "./EmployeesStyles.js";

const EmployeesScreen = ({ userRole }) => {
  const navigation = useNavigation();
  const responsive = useResponsive();

  const route = useRoute();

  const { employee } = route.params || {
    // Valores por defecto en caso de que no se pasen parámetros
    employee: {
      name: "Empleado",
      code: "EMP000",
      phone: "No disponible",
      role: "No asignado",
      email: "No disponible",
      department: "No asignado",
      startDate: "No disponible",
    },
  };

  const { company } = route.params || {
    // Valores por defecto en caso de que no se pasen parámetros
    employee: {
      name: "Empresa Demo",
      code: "DEMO25",
      phone: "No disponible",
      role: "No asignado",
      email: "No disponible",
      department: "No asignado",
      startDate: "No disponible",
      address: "No disponible",
    },
  };

  const [employeeData, setEmployeeData] = useState(employee);

  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const [showAppointments, setShowAppointments] = useState(false);

  const [employeeAppointments, setEmployeeAppointments] = useState([]);

  // Estado para manejar la búsqueda de empleados
  const [searchQuery, setSearchQuery] = useState("");

  // Estado que almacena la lista de empleados existentes
  const [employees, setEmployees] = useState([]);

  // Estado para el empleado seleccionado (para vista de detalles en desktop)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Estado para indicar si los datos están cargando
  const [isLoading, setIsLoading] = useState(true);

  // Estado para manejar errores
  const [error, setError] = useState(null);

  // Estado para almacenar el ID de la compañía del usuario actual
  const [companyId, setCompanyId] = useState(null);

  const [authUser, setAuthUser] = useState(null);

  // Estado para almacenar la información del usuario actual
  const [currentUser, setCurrentUser] = useState(null);

  const [appointmentsError, setAppointmentsError] = useState(null);

  // Obtener el usuario actual y su companyId
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCurrentUser(userData.firstName);
            setCompanyId(userData.companyId);
          } else {
            setError("No se encontró información del usuario");
          }
        } else {
          setError("No hay usuario autenticado");
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError("Error al obtener información del usuario");
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch authenticated user data
  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAuthUser(userData);
          }
        }
      } catch (err) {
        console.error("Error fetching authenticated user:", err);
      }
    };

    fetchAuthUser();
  }, []);

  // Fetch confirmed appointments for this employee
  const fetchEmployeeAppointments = useCallback(() => {
    if (!employeeData.id) return () => {};

    setLoadingAppointments(true);
    setAppointmentsError(null);

    try {
      // Get the current user's role and subject from employeeData, with null checks
      const currentUserRole = authUser?.role || "";
      const currentUserSubject = authUser?.subject || "";
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid;

      // Base query - filter by teacherId and state
      let appointmentsQuery = query(
        collection(db, "dates"),
        where("state", "==", true)
      );

      // Add additional filtering for teachers based on subject
      if (currentUserRole === "teacher") {
        if (currentUserSubject === "psychology") {
          appointmentsQuery = query(
            collection(db, "dates"),
            where("teacherId", "==", userId),
            where("state", "==", true),
            where("service", "==", "psychology"),
            where("userId", "==", employeeData.id)
          );
        } else if (currentUserSubject === "nutrition") {
          appointmentsQuery = query(
            collection(db, "dates"),
            where("teacherId", "==", userId),
            where("state", "==", true),
            where("service", "==", "nutrition"),
            where("userId", "==", employeeData.id)
          );
        }
      } else {
        appointmentsQuery = query(
          collection(db, "dates"),
          where("state", "==", true),
          where("userId", "==", employeeData.id)
        );
      }

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        appointmentsQuery,
        async (snapshot) => {
          const appointmentsData = [];

          for (const docSnapshot of snapshot.docs) {
            const appointmentData = docSnapshot.data();

            // Get user details if available
            let userData = {};
            if (appointmentData.userId) {
              const userDocRef = doc(db, "users", appointmentData.userId);
              const userDocSnap = await getDoc(userDocRef);
              userData = userDocSnap.exists() ? userDocSnap.data() : {};
            }

            // Format date and time
            let formattedDate = "Sin fecha";
            let formattedTime = "Sin hora";

            if (
              appointmentData.date &&
              typeof appointmentData.date.toDate === "function"
            ) {
              const dateObj = appointmentData.date.toDate();

              // Format date as dd/mm/yyyy
              const day = String(dateObj.getDate()).padStart(2, "0");
              const month = String(dateObj.getMonth() + 1).padStart(2, "0");
              const year = dateObj.getFullYear();
              formattedDate = `${day}/${month}/${year}`;

              // Format time as HH:MM
              const hours = String(dateObj.getHours()).padStart(2, "0");
              const minutes = String(dateObj.getMinutes()).padStart(2, "0");
              formattedTime = `${hours}:${minutes}`;
            }

            appointmentsData.push({
              id: docSnapshot.id,
              date: formattedDate,
              time: formattedTime,
              category: appointmentData.service || "",
              title: `Cita de ${
                appointmentData.service
                  ? appointmentData.service.charAt(0).toUpperCase() +
                    appointmentData.service.slice(1)
                  : "Servicio"
              }`,
              client:
                `${userData.name || ""} ${userData.lastName || ""}`.trim() ||
                "Cliente sin nombre",
              phone: userData.phone || "Sin teléfono",
              rawData: appointmentData,
            });
          }

          setEmployeeAppointments(appointmentsData);
          setLoadingAppointments(false);
        },
        (error) => {
          console.error("Error fetching employee appointments:", error);
          setAppointmentsError("Error al cargar las citas del empleado");
          setLoadingAppointments(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error("Error setting up appointments listener:", err);
      setAppointmentsError("Error al configurar el listener de citas");
      setLoadingAppointments(false);
      return () => {};
    }
  }, [employeeData.id, authUser]);

  // Set up and clean up appointments listener when showing appointments
  useEffect(() => {
    let unsubscribe = () => {};

    if (showAppointments && employeeData.id) {
      unsubscribe = fetchEmployeeAppointments();
    }

    return () => {
      unsubscribe();
    };
  }, [showAppointments, employeeData.id, fetchEmployeeAppointments]);

  // Reemplazar la función fetchEmployees con una versión que use onSnapshot
  const fetchEmployees = useCallback(() => {
    if (!companyId) return () => {}; // Retornar una función de limpieza vacía si no hay companyId

    setIsLoading(true);
    setError(null);

    try {
      let employeesQuery;

      if (userRole === "manager") {
        employeesQuery = query(
          collection(db, "users"),
          where("companyId", "==", companyId),
          where("role", "in", ["user", "employee"])
        );
      } else if (userRole === "teacher") {
        employeesQuery = query(
          collection(db, "users"),
          where("role", "in", ["user", "externalUser"])
        );
      }
      // Establecer un listener en tiempo real con onSnapshot
      const unsubscribe = onSnapshot(
        employeesQuery,
        async (snapshot) => {
          const employeesData = [];

          // Procesar los cambios
          for (const docSnapshot of snapshot.docs) {
            const employeeData = docSnapshot.data();
            employeesData.push({
              id: docSnapshot.id,
              name: `${employeeData.name || ""} ${
                employeeData.lastName || ""
              }`.trim(),
              code: employeeData.workerId || "Sin código",
              phone: employeeData.phone || "Sin teléfono",
              role: employeeData.role || "Sin rol",
              email: employeeData.email || "Sin email",
              dni: employeeData.dni || "Sin DNI",
              companyId: employeeData.companyId,
              // Incluir todos los campos originales para referencia
              rawData: employeeData,
            });
          }

          setEmployees(employeesData);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error listening to employees:", error);
          setError("Error al escuchar cambios en los empleados");
          setIsLoading(false);
        }
      );

      // Retornar la función de limpieza para desuscribirse cuando el componente se desmonte
      return unsubscribe;
    } catch (err) {
      console.error("Error setting up employee listener:", err);
      setError("Error al configurar el listener de empleados");
      setIsLoading(false);
      return () => {}; // Retornar una función de limpieza vacía en caso de error
    }
  }, [companyId, userRole]);

  // Abre el modal y establece el empleado seleccionado
  const handleOpenAppointments = (employee) => {
    setEmployeeData(employee);
    setShowAppointments(true);
  };

  // Reemplazar el useEffect que carga empleados para manejar la limpieza del listener
  useEffect(() => {
    let unsubscribe = () => {};

    if (companyId) {
      unsubscribe = fetchEmployees();
    }

    // Limpiar el listener cuando el componente se desmonte o cuando cambie companyId
    return () => {
      unsubscribe();
    };
  }, [companyId, fetchEmployees]);

  <Modal
    visible={showAppointments}
    animationType="fade"
    transparent={true}
    onRequestClose={() => setShowAppointments(false)}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Citas Confirmadas</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowAppointments(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {loadingAppointments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
            <Text style={styles.loadingText}>Cargando citas...</Text>
          </View>
        ) : appointmentsError ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
            <Text style={styles.errorText}>{appointmentsError}</Text>
          </View>
        ) : employeeAppointments.length === 0 ? (
          <View style={styles.emptyAppointmentsContainer}>
            <MaterialIcons name="event-busy" size={60} color="#CCCCCC" />
            <Text style={styles.emptyAppointmentsText}>
              No hay citas confirmadas
            </Text>
          </View>
        ) : (
          <FlatList
            data={employeeAppointments.sort((a, b) => {
              // Convert string dates to Date objects for comparison
              const dateA = a.date.split("/").reverse().join("-");
              const dateB = b.date.split("/").reverse().join("-");
              const timeA = a.time;
              const timeB = b.time;

              const dateTimeA = new Date(`${dateA}T${timeA}`);
              const dateTimeB = new Date(`${dateB}T${timeB}`);

              return sortOrder === "newest"
                ? dateTimeB - dateTimeA
                : dateTimeA - dateTimeB;
            })}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={() => (
              <TouchableOpacity
                style={styles.sortButton}
                onPress={toggleSortOrder}
              >
                <MaterialIcons
                  name={
                    sortOrder === "newest" ? "arrow-downward" : "arrow-upward"
                  }
                  size={16}
                  color="#fff"
                />
                <Text style={styles.sortButtonText}>
                  {sortOrder === "newest"
                    ? "Más recientes primero"
                    : "Más antiguas primero"}
                </Text>
              </TouchableOpacity>
            )}
            renderItem={({ item }) => (
              <View style={styles.appointmentItem}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentTitle}>{item.title}</Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      item.category === "psychology"
                        ? styles.psychologyBadge
                        : styles.nutritionBadge,
                    ]}
                  >
                    <Text style={styles.categoryText}>
                      {item.category === "psychology"
                        ? "Psicología"
                        : "Nutrición"}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetail}>
                  <MaterialIcons name="access-time" size={16} color="#666" />
                  <Text style={styles.appointmentDetailText}>
                    {item.date} - {item.time}
                  </Text>
                </View>

                <View style={styles.appointmentDetail}>
                  <MaterialIcons name="person" size={16} color="#666" />
                  <Text style={styles.appointmentDetailText}>
                    {item.client}
                  </Text>
                </View>

                <View style={styles.appointmentDetail}>
                  <MaterialIcons name="phone" size={16} color="#666" />
                  <Text style={styles.appointmentDetailText}>{item.phone}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.appointmentsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  </Modal>;

  // Filtra la lista de empleados según el texto ingresado en la búsqueda
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obtener el empleado seleccionado
  const selectedEmployee = employees.find(
    (emp) => emp.id === selectedEmployeeId
  );

  // Función para navegar a la pantalla de detalle del empleado
  const navigateToEmployeeDetail = (employee) => {
    if (responsive.isDesktop) {
      setSelectedEmployeeId(employee.id);
    } else {
      navigation.navigate("EmployeeDetailScreen", { employee });
    }
  };

  // Función que renderiza cada empleado en la lista
  const renderEmployee = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.employeeItem,
        responsive.isDesktop && styles.employeeItemDesktop,
        selectedEmployeeId === item.id && styles.selectedEmployeeItem,
      ]}
      onPress={() => navigateToEmployeeDetail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.employeeContent}>
        <View
          style={[
            styles.avatarContainer,
            responsive.isDesktop && styles.avatarContainerDesktop,
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              responsive.isDesktop && styles.avatarTextDesktop,
            ]}
          >
            {item.name
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text
            style={[
              styles.employeeName,
              responsive.isDesktop && styles.employeeNameDesktop,
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.employeeCode,
              responsive.isDesktop && styles.employeeCodeDesktop,
            ]}
          >
            {item.code} • {item.role}
          </Text>
          <Text
            style={[
              styles.employeePhone,
              responsive.isDesktop && styles.employeePhoneDesktop,
            ]}
          >
            <MaterialIcons name="phone" size={responsive.isDesktop ? 16 : 14} />{" "}
            {item.phone}
          </Text>
        </View>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={responsive.isDesktop ? 28 : 24}
        color="#CCCCCC"
      />
    </TouchableOpacity>
  );

  // Botón para web y desktop, ahora recibe el empleado
  const WebAppointmentsButton = ({ onPress, employee }) => {
    return (
      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          width: "100%",
        }}
      >
        <button
          onClick={() => onPress(employee)}
          style={{
            backgroundColor: Colors.PRIMARYCOLOR,
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <span style={{ marginRight: "8px" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 20 19 4Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 2V6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 2V6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 10H21"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 16L11 18L15 14"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Ver Citas Confirmadas
        </button>
      </div>
    );
  };
  {
    /* Modal para mostrar las citas confirmadas */
  }
  <Modal
    visible={showAppointments}
    animationType="fade"
    transparent={true}
    onRequestClose={() => setShowAppointments(false)}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Citas Confirmadas</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowAppointments(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {loadingAppointments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARYCOLOR} />
            <Text style={styles.loadingText}>Cargando citas...</Text>
          </View>
        ) : appointmentsError ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
            <Text style={styles.errorText}>{appointmentsError}</Text>
          </View>
        ) : employeeAppointments.length === 0 ? (
          <View style={styles.emptyAppointmentsContainer}>
            <MaterialIcons name="event-busy" size={60} color="#CCCCCC" />
            <Text style={styles.emptyAppointmentsText}>
              No hay citas confirmadas
            </Text>
          </View>
        ) : (
          <FlatList
            data={employeeAppointments.sort((a, b) => {
              // Convert string dates to Date objects for comparison
              const dateA = a.date.split("/").reverse().join("-");
              const dateB = b.date.split("/").reverse().join("-");
              const timeA = a.time;
              const timeB = b.time;

              const dateTimeA = new Date(`${dateA}T${timeA}`);
              const dateTimeB = new Date(`${dateB}T${timeB}`);

              return sortOrder === "newest"
                ? dateTimeB - dateTimeA
                : dateTimeA - dateTimeB;
            })}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={() => (
              <TouchableOpacity
                style={styles.sortButton}
                onPress={toggleSortOrder}
              >
                <MaterialIcons
                  name={
                    sortOrder === "newest" ? "arrow-downward" : "arrow-upward"
                  }
                  size={16}
                  color="#fff"
                />
                <Text style={styles.sortButtonText}>
                  {sortOrder === "newest"
                    ? "Más recientes primero"
                    : "Más antiguas primero"}
                </Text>
              </TouchableOpacity>
            )}
            renderItem={({ item }) => (
              <View style={styles.appointmentItem}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentTitle}>{item.title}</Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      item.category === "psychology"
                        ? styles.psychologyBadge
                        : styles.nutritionBadge,
                    ]}
                  >
                    <Text style={styles.categoryText}>
                      {item.category === "psychology"
                        ? "Psicología"
                        : "Nutrición"}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetail}>
                  <MaterialIcons name="access-time" size={16} color="#666" />
                  <Text style={styles.appointmentDetailText}>
                    {item.date} - {item.time}
                  </Text>
                </View>

                <View style={styles.appointmentDetail}>
                  <MaterialIcons name="person" size={16} color="#666" />
                  <Text style={styles.appointmentDetailText}>
                    {item.client}
                  </Text>
                </View>

                <View style={styles.appointmentDetail}>
                  <MaterialIcons name="phone" size={16} color="#666" />
                  <Text style={styles.appointmentDetailText}>{item.phone}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.appointmentsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  </Modal>;

  // Función para renderizar el estado vacío
  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.emptyText}>Cargando empleados...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={60} color="#FF3B30" />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setError(null);
              // Trigger a re-fetch by updating the companyId state
              setCompanyId((prev) => prev);
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="people-outline" size={60} color="#CCCCCC" />
        <Text style={styles.emptyText}>No se encontraron empleados</Text>
        <Text style={styles.emptySubtext}>Intenta con otra búsqueda</Text>
      </View>
    );
  };

  // Renderizar los detalles del empleado seleccionado (solo para desktop)
  const [companyName, setCompanyName] = useState("");
  useEffect(() => {
    const fetchCompanyName = async () => {
      if (selectedEmployee && selectedEmployee.companyId) {
        try {
          const companyDocRef = doc(
            db,
            "companies",
            selectedEmployee.companyId
          );
          const companyDocSnap = await getDoc(companyDocRef);
          if (companyDocSnap.exists()) {
            setCompanyName(companyDocSnap.data().name || "");
          } else {
            setCompanyName("");
          }
        } catch (e) {
          setCompanyName("");
        }
      } else {
        setCompanyName("");
      }
    };
    fetchCompanyName();
  }, [selectedEmployee]);

  const renderEmployeeDetails = () => {
    if (!selectedEmployee) {
      return (
        <View style={styles.noSelectionContainer}>
          <MaterialIcons name="person-search" size={80} color="#CCCCCC" />
          <Text style={styles.noSelectionText}>
            Selecciona un empleado para ver sus detalles
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <View style={styles.detailsAvatarContainer}>
            <Text style={styles.detailsAvatarText}>
              {selectedEmployee.name
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.detailsHeaderInfo}>
            <Text style={styles.detailsName}>{selectedEmployee.name}</Text>
          </View>
        </View>
        <View style={styles.detailsContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>Datos del empleado</Text>
            <View style={styles.detailsItem}>
              <MaterialIcons name="badge" size={20} />
              <Text style={styles.detailsItemText}>
                DNI: {selectedEmployee.dni}
              </Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="email" size={20} />
              <Text style={styles.detailsItemText}>
                {selectedEmployee.email}
              </Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="phone" size={20} />
              <Text style={styles.detailsItemText}>
                {selectedEmployee.phone}
              </Text>
            </View>
            <View style={styles.detailsItem}>
              <MaterialIcons name="business" size={20} />
              <Text style={styles.detailsItemText}>
                Empresa: {companyName || "-"}
              </Text>
            </View>
          </View>
        </View>
        {/* El botón ahora pasa el empleado seleccionado */}
        <WebAppointmentsButton
          onPress={handleOpenAppointments}
          employee={selectedEmployee}
        />
      </View>
    );
  };

  const renderAppointmentsSection = () => {
    // For web platform, use the web-specific button
    if (isWeb && responsive.isDesktop) {
      return (
        <View style={[styles.infoSection, styles.infoSectionDesktop]}>
          <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>
            Citas
          </Text>
          <WebAppointmentsButton onPress={handleOpenAppointments} />
        </View>
      );
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Encabezado de la pantalla */}
      <View
        style={[
          styles.headerCitas,
          responsive.isDesktop && styles.headerCitasDesktop,
        ]}
      >
        <Header header_text={"Lista de empleados"} />
      </View>

      {/* Contenedor principal de la pantalla */}
      {responsive.isDesktop ? (
        // Layout para desktop - dos columnas
        <View style={styles.desktopContainer}>
          <View style={styles.desktopLeftPanel}>
            {/* Campo de búsqueda de empleados */}
            <View
              style={[styles.searchContainer, styles.searchContainerDesktop]}
            >
              <Feather
                name="search"
                size={20}
                color="#999"
                style={styles.searchIcon}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  { outline: "none", WebkitTapHighlightColor: "transparent" },
                ]}
                placeholder="Buscar por nombre o código"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="no-highlight"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Feather name="x" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Lista de empleados filtrada según la búsqueda */}
            <FlatList
              data={filteredEmployees}
              renderItem={renderEmployee}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.listContainer,
                styles.listContainerDesktop,
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyList}
            />
          </View>

          {/* Panel de detalles (solo en desktop) */}
          <View style={styles.desktopRightPanel}>
            {renderEmployeeDetails()}
          </View>
        </View>
      ) : (
        // Layout para móvil - una columna
        <View style={styles.container}>
          {/* Campo de búsqueda de empleados */}
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                { outline: "none", WebkitTapHighlightColor: "transparent" },
              ]}
              placeholder="Buscar por nombre o código"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="no-highlight"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de empleados filtrada según la búsqueda */}
          <FlatList
            data={filteredEmployees}
            renderItem={renderEmployee}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
          />
        </View>
      )}
    </View>
  );
};

export default EmployeesScreen;
