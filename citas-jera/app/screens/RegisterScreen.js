"use client "

import { useRef, useState, useEffect } from "react"
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
  Animated,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import Input from "@components/Inputs.js"
import Colors from "@styles/colors.js"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "../../firebaseConfig.js"
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc
} from "firebase/firestore"
import { useResponsive } from "../hooks/use-responsive"
import { Picker } from "@react-native-picker/picker"
import { useCameraPermissions } from "expo-camera"

// Main registration screen component with two-step process
const RegisterScreen = () => {
  const responsive = useResponsive()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedRole, setSelectedRole] = useState("user")

  // State for registration steps
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyId: "",
    companyCode: "",
    role: "user"
  })

  // State for error messages
  const [errors, setErrors] = useState({})
  const [showError, setShowError] = useState(false)
  const errorOpacity = useState(new Animated.Value(0))[0]

  // References for input fields
  const firstNameRef = useRef()
  const lastNameRef = useRef()
  const emailRef = useRef()
  const phoneRef = useRef()
  const companyCodeRef = useRef()
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()

  // State for password visibility
  const [hidePassword, setHidePassword] = useState(true)
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true)

  // State for mobile pickers visibility
  const [isCompanyPickerOpen, setIsCompanyPickerOpen] = useState(false)
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false)

  // Progress indicator animation
  const progressAnimation = useState(new Animated.Value(0.5))[0]

  const [permission, requestPermission] = useCameraPermissions();
  const isCameraPermissionGranted = Boolean(permission?.granted);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const companiesCollection = collection(db, "companies");
        const companiesSnapshot = await getDocs(companiesCollection);
        const companiesList = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(companiesList);

      } catch (error) {
        // Diferenciamos entre entornos
        if (process.env.NODE_ENV === 'development') {
          // En desarrollo mostramos el stack completo
          console.error("Error fetching companies (full error):", error);
        } else {
          // En producción solo el mensaje y código
          console.error(`Error fetching companies: [${error.code || 'UNKNOWN'}] ${error.message}`);
        }

        // Mostramos al usuario un mensaje enriquecido con el código de error
        showErrorMessage(
          `Ha ocurrido un error cargando las compañías. ` +
          `Código: ${error.code || 'sin código'}. ` +
          `Detalle: ${error.message || 'no disponible'}.`
        );

      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Update progress animation when step changes
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: currentStep === 1 ? 0.5 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [currentStep])

  // Function to show error messages with animation
  const showErrorMessage = (message, field = null) => {
    if (field) {
      setErrors(prev => ({ ...prev, [field]: message }))
    } else {
      setErrors(prev => ({ ...prev, global: message }))
      setShowError(true)
      Animated.sequence([
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(errorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowError(false)
      })
    }
  }

  // Function to validate a field
  const validateField = (field, value, rules) => {
    if (rules.required && !value) {
      showErrorMessage(`${rules.label} es requerido`, field)
      return false
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      showErrorMessage(rules.message, field)
      return false
    }

    // Clear error if valid
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })

    return true
  }

  // Function to update form data
  const updateFormData = () => {
    const updatedData = {
      ...formData,
      firstName: firstNameRef.current?.getValue() || "",
      lastName: lastNameRef.current?.getValue() || "",
      email: emailRef.current?.getValue() || "",
      password: passwordRef.current?.getValue() || "",
      confirmPassword: confirmPasswordRef.current?.getValue() || "",
      phone: phoneRef.current?.getValue() || "",
      companyId: selectedCompany,
      companyCode: companyCodeRef.current?.getValue() || "",
      role: selectedRole
    }

    setFormData(updatedData)
    return updatedData
  }

  // Function to validate step 1
  const validateStep1 = () => {
    const data = updateFormData()

    // Validate first step fields
    const isFirstNameValid = validateField('firstName', data.firstName, { required: true, label: 'Nombre' })
    const isLastNameValid = validateField('lastName', data.lastName, { required: true, label: 'Apellidos' })
    const isEmailValid = validateField('email', data.email, {
      required: true,
      label: 'Email',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Por favor, introduce un email válido'
    })
    const isPasswordValid = validateField('password', data.password, {
      required: true,
      label: 'Contraseña',
      pattern: /.{6,}/,
      message: 'La contraseña debe tener al menos 6 caracteres'
    })

    // Validate that passwords match
    if (data.password !== data.confirmPassword) {
      showErrorMessage("Las contraseñas no coinciden", "confirmPassword")
      return false
    }

    return isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid &&
      data.password === data.confirmPassword
  }

  // Function to validate step 2
  const validateStep2 = () => {
    const data = updateFormData()

    // Validate second step fields
    const isPhoneValid = validateField('phone', data.phone, { required: true, label: 'Teléfono' })
    const isCompanyValid = validateField('company', data.companyId, { required: true, label: 'Compañía' })
    const isCompanyCodeValid = validateField('companyCode', data.companyCode, { required: true, label: 'Código de compañía' })

    // Verify company code
    const selectedCompanyData = companies.find((company) => company.id === data.companyId)
    if (selectedCompanyData && selectedCompanyData.code !== data.companyCode) {
      showErrorMessage("El código de compañía no es válido", "companyCode")
      return false
    }

    return isPhoneValid && isCompanyValid && isCompanyCodeValid &&
      (!selectedCompanyData || selectedCompanyData.code === data.companyCode)
  }

  // Function to handle next step
  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const navigateToScanner = () => {
    navigation.navigate("ScannerScreen");
  }

  // Function to handle previous step
  const handlePrevStep = () => {
    setCurrentStep(1)
  }

  // Function to handle registration
  const handleRegister = async () => {
    // 1. Actualizamos formData
    const data = updateFormData(); // debe traer phone y companyCode

    // 2. Validaciones básicas
    if (!validateStep1()) return;
    if (!data.phone) {
      showErrorMessage("El teléfono es requerido", "phone");
      return;
    }
    if (!data.companyCode) {
      showErrorMessage("El código de compañía es requerido", "companyCode");
      return;
    }

    setIsLoading(true);

    navigateToScanner();

    try {
      // 3. Comprobar existencia de la empresa por código o código de admin
      const companiesRef = collection(db, "companies");

      // Primero buscamos por campo `code`
      let q = query(companiesRef, where("code", "==", data.companyCode));
      let snapshot = await getDocs(q);
      let isAdminCode = false;

      // Si no encontramos con `code`, probamos con `codeAdmin`
      if (snapshot.empty) {
        q = query(companiesRef, where("codeAdmin", "==", data.companyCode));
        snapshot = await getDocs(q);
        if (snapshot.empty) {
          throw {
            code: "COMPANY_NOT_FOUND",
            message: "No existe ninguna empresa con ese código"
          };
        }
        isAdminCode = true;
      }

      const companyDoc = snapshot.docs[0];
      const companyData = companyDoc.data();

      // 4. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const uid = userCredential.user.uid;

      // 5. Escribir usuario en Firestore, asignando rol según tipo de código
      await setDoc(doc(db, "users", uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyId: companyDoc.id,
        companyName: companyData.name,
        companyCode: data.companyCode,
        role: isAdminCode
          ? "manager"
          : companyData.defaultRole,
        createdAt: new Date().toISOString(),
      });

      setIsLoading(false);
      Alert.alert(
        "Registro exitoso",
        "Tu cuenta ha sido creada correctamente",
        [{ text: "OK", onPress: () => navigation.replace("LoginScreen") }]
      );

    } catch (error) {
      setIsLoading(false);

      // 6. Si el usuario se había creado en Auth, lo borramos
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.delete();
          console.log("User deleted after failed registration");
        } catch (e) {  ignoramos }
      }

      // 7. Mostrar mensaje de error
      let errorMessage = error.message || "Ha ocurrido un error durante el registro";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres";
      } else if (error.code === "COMPANY_NOT_FOUND") {
        errorMessage = error.message;
      }
      showErrorMessage(errorMessage);
    }
  };


  // Function to navigate to login screen
  const navigateToLogin = () => {
    navigation.replace("LoginScreen")
  }

  // Component for role selector
  const RoleSelector = ({ style }) => {
    if (responsive.isDesktop) {
      return (
        <View style={[styles.iosInputContainer, style]}>
          <Text style={styles.iosInputLabel}>Rol</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedRole}
              onValueChange={(itemValue) => setSelectedRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Usuario (citas gestionadas)" value="user" />
              <Picker.Item label="Usuario Externo (autogestión)" value="externalUser" />
            </Picker>
          </View>
        </View>
      )
    } else {
      // Mobile version with custom dropdown
      return (
        <View style={[styles.iosInputContainer, style]}>
          <Text style={styles.iosInputLabel}>Rol</Text>
          <TouchableOpacity
            style={styles.mobilePickerButton}
            onPress={() => setIsRolePickerOpen(!isRolePickerOpen)}
          >
            <Text style={styles.mobilePickerButtonText}>
              {selectedRole === 'user' ? 'Usuario (citas gestionadas)' : 'Usuario Externo (autogestión)'}
            </Text>
          </TouchableOpacity>

          {isRolePickerOpen && (
            <View style={styles.mobilePickerDropdown}>
              <TouchableOpacity
                style={styles.mobilePickerItem}
                onPress={() => {
                  setSelectedRole('user')
                  setIsRolePickerOpen(false)
                }}
              >
                <Text style={[
                  styles.mobilePickerItemText,
                  selectedRole === 'user' && styles.mobilePickerItemTextSelected
                ]}>
                  Usuario (citas gestionadas)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mobilePickerItem}
                onPress={() => {
                  setSelectedRole('externalUser')
                  setIsRolePickerOpen(false)
                }}
              >
                <Text style={[
                  styles.mobilePickerItemText,
                  selectedRole === 'externalUser' && styles.mobilePickerItemTextSelected
                ]}>
                  Usuario Externo (autogestión)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )
    }
  }

  // Component for company selector
  /**const CompanySelector = ({ style }) => {
    if (responsive.isDesktop) {
      return (
        <View style={[styles.iosInputContainer, style]}>
          <Text style={styles.iosInputLabel}>Compañía</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCompany}
              onValueChange={(itemValue) => setSelectedCompany(itemValue)}
              style={styles.picker}
              enabled={!isLoading}
            >
              <Picker.Item label="Selecciona una compañía" value="" />
              {companies.map((company) => (
                <Picker.Item key={company.id} label={company.name} value={company.id} />
              ))}
            </Picker>
          </View>
          {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
        </View>
      )
    } else {
      // Mobile version with custom dropdown
      const selectedCompanyName = selectedCompany 
        ? companies.find(c => c.id === selectedCompany)?.name 
        : "Selecciona una compañía";
        
      return (
        <View style={[styles.iosInputContainer, style]}>
          <Text style={styles.iosInputLabel}>Compañía</Text>
          <TouchableOpacity 
            style={styles.mobilePickerButton}
            onPress={() => setIsCompanyPickerOpen(!isCompanyPickerOpen)}
            disabled={isLoading}
          >
            <Text style={[
              styles.mobilePickerButtonText,
              !selectedCompany && styles.mobilePickerPlaceholder
            ]}>
              {selectedCompanyName}
            </Text>
          </TouchableOpacity>
          
          {isCompanyPickerOpen && (
            <View style={styles.mobilePickerDropdown}>
              {companies.map((company) => (
                <TouchableOpacity 
                  key={company.id}
                  style={styles.mobilePickerItem}
                  onPress={() => {
                    setSelectedCompany(company.id)
                    setIsCompanyPickerOpen(false)
                  }}
                >
                  <Text style={[
                    styles.mobilePickerItemText,
                    selectedCompany === company.id && styles.mobilePickerItemTextSelected
                  ]}>
                    {company.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
        </View>
      )
    }
  }*/

  // Component for progress indicator
  const ProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressSteps}>
          <View style={[styles.progressStep, styles.progressStepActive]}>
            <Text style={styles.progressStepText}>1</Text>
          </View>
          <View style={styles.progressLine}>
            <Animated.View
              style={[
                styles.progressLineFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
          <View style={[
            styles.progressStep,
            currentStep === 2 && styles.progressStepActive
          ]}>
            <Text style={styles.progressStepText}>2</Text>
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Información básica</Text>
          <Text style={styles.progressLabel}>Detalles adicionales</Text>
        </View>
      </View>
    )
  }

  // Component for error message
  const ErrorMessage = () => {
    if (!showError) return null;

    return (
      <Animated.View style={[styles.errorToast, { opacity: errorOpacity }]}>
        <Text style={styles.errorToastText}>{errors.global}</Text>
      </Animated.View>
    );
  };

  // Render step 1 form
  const renderStep1 = () => {
    return (
      <>
        <View style={styles.iosFormRow}>
          <View style={styles.iosFormColumn}>
            <Input
              title={"Nombre"}
              ref={firstNameRef}
              containerStyle={styles.iosInputContainer}
              inputStyle={styles.iosInput}
              titleStyle={styles.iosInputLabel}
              defaultValue={formData.firstName}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>
          <View style={styles.iosFormColumn}>
            <Input
              title={"Apellidos"}
              ref={lastNameRef}
              containerStyle={styles.iosInputContainer}
              inputStyle={styles.iosInput}
              titleStyle={styles.iosInputLabel}
              defaultValue={formData.lastName}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>
        </View>

        <View style={styles.iosFormRow}>
          <View style={styles.iosFormColumn}>
            <Input
              title={"Correo Electrónico"}
              ref={emailRef}
              containerStyle={styles.iosInputContainer}
              inputStyle={styles.iosInput}
              titleStyle={styles.iosInputLabel}
              keyboardType="email-address"
              defaultValue={formData.email}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
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
              defaultValue={formData.password}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
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
              defaultValue={formData.confirmPassword}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>
        </View>

        <TouchableOpacity style={styles.iosNextButton} onPress={handleNextStep} activeOpacity={0.8}>
          <Text style={styles.iosButtonText}>Continuar</Text>
        </TouchableOpacity>
      </>
    )
  }

  // Render step 2 form
  const renderStep2 = () => {
    return (
      <>
        <View style={styles.iosFormRow}>
          <View style={styles.iosFormColumn}>
            <Input
              title={"Teléfono"}
              ref={phoneRef}
              containerStyle={styles.iosInputContainer}
              inputStyle={styles.iosInput}
              titleStyle={styles.iosInputLabel}
              keyboardType="phone-pad"
              defaultValue={formData.phone}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
        </View>

        {/*<View style={styles.iosFormRow}>
          <View style={styles.iosFormColumn}>
            <CompanySelector />
          </View>
          <View style={styles.iosFormColumn}>
            <RoleSelector />
          </View>
        </View>*/}

        <View style={styles.iosFormRow}>
          <View style={styles.iosFormColumn}>
            <Input
              title={"Código de Compañía"}
              ref={companyCodeRef}
              containerStyle={styles.iosInputContainer}
              inputStyle={styles.iosInput}
              titleStyle={styles.iosInputLabel}
              defaultValue={formData.companyCode}
            />
            {errors.companyCode && <Text style={styles.errorText}>{errors.companyCode}</Text>}
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.iosBackButton} onPress={handlePrevStep} activeOpacity={0.8}>
            <Text style={styles.iosBackButtonText}>Volver</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iosRegisterButton} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.iosButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  return (
    <SafeAreaView style={[styles.iosSafeArea, responsive.isDesktop && styles.containerDesktop]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Global error message */}
      <ErrorMessage />

      {responsive.isDesktop ? (
        // Desktop layout - two-column design with iOS style
        <View style={styles.desktopLayout}>
          {/* Sidebar with branding */}
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

          {/* Form panel with iOS style */}
          <View style={styles.desktopFormPanel}>
            <View style={styles.formContainer}>
              <Text style={styles.desktopFormTitle}>Crear Cuenta</Text>
              <Text style={styles.desktopFormSubtitle}>Completa el formulario para registrarte en el sistema</Text>

              {/* Progress indicator */}
              <ProgressIndicator />

              <View style={styles.formFields}>
                {currentStep === 1 ? renderStep1() : renderStep2()}
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
        // Mobile layout - iOS style
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
            {/* Header with logo */}
            <View style={styles.iosHeader}>
              <Image source={require("@assets/icon.png")} style={styles.iosLogo} resizeMode="contain" />
            </View>

            {/* App title */}
            <Text style={styles.iosAppTitle}>Senda Servicios</Text>
            <Text style={styles.iosAppSubtitle}>Crear una nueva cuenta</Text>

            {/* Progress indicator */}
            <ProgressIndicator />

            {/* Form fields with iOS style */}
            <View style={styles.iosMobileFormContainer}>
              {currentStep === 1 ? (
                // Step 1 - Mobile
                <>
                  <Input
                    key={"firstName"}
                    title={"Nombre"}
                    ref={firstNameRef}
                    containerStyle={styles.iosInputContainer}
                    inputStyle={styles.iosInput}
                    titleStyle={styles.iosInputLabel}
                    defaultValue={formData.firstName}
                  />
                  {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

                  <Input
                    key={"lastName"}
                    title={"Apellidos"}
                    ref={lastNameRef}
                    containerStyle={styles.iosInputContainer}
                    inputStyle={styles.iosInput}
                    titleStyle={styles.iosInputLabel}
                    defaultValue={formData.lastName}
                  />
                  {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

                  <Input
                    key={"email"}
                    title={"Correo Electrónico"}
                    ref={emailRef}
                    containerStyle={styles.iosInputContainer}
                    inputStyle={styles.iosInput}
                    titleStyle={styles.iosInputLabel}
                    keyboardType="email-address"
                    defaultValue={formData.email}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                  <Input
                    key={"password"}
                    secureTextEntry={hidePassword}
                    handleAction={() => setHidePassword(!hidePassword)}
                    ref={passwordRef}
                    title={"Contraseña"}
                    icon={hidePassword ? "eye" : "eye-slash"}
                    containerStyle={styles.iosInputContainer}
                    inputStyle={styles.iosInput}
                    titleStyle={styles.iosInputLabel}
                    defaultValue={formData.password}
                  />
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                  <Input
                    key={"confirmPassword"}
                    secureTextEntry={hideConfirmPassword}
                    handleAction={() => setHideConfirmPassword(!hideConfirmPassword)}
                    ref={confirmPasswordRef}
                    title={"Confirmar Contraseña"}
                    icon={hideConfirmPassword ? "eye" : "eye-slash"}
                    containerStyle={styles.iosInputContainer}
                    inputStyle={styles.iosInput}
                    titleStyle={styles.iosInputLabel}
                    defaultValue={formData.confirmPassword}
                  />
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                  <TouchableOpacity style={styles.iosNextButton} onPress={handleNextStep} activeOpacity={0.8}>
                    <Text style={styles.iosButtonText}>Continuar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Step 2 - Mobile
                <>
                  <Input
                    key={"phone"}
                    title={"Teléfono"}
                    ref={phoneRef}
                    containerStyle={styles.iosInputContainer}
                    inputStyle={styles.iosInput}
                    titleStyle={styles.iosInputLabel}
                    keyboardType="phone-pad"
                    defaultValue={formData.phone}
                  />
                  {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                  {/*<CompanySelector style={styles.mobileSelector} />
                  

                  <RoleSelector style={styles.mobileSelector} />*/}

                  <Input
                    key={"companyCode"}
                    title={"Código de Compañía"}
                    ref={companyCodeRef}
                    containerStyle={styles.iosInputContainer}
                    inputStyle={styles.iosInput}
                    titleStyle={styles.iosInputLabel}
                    defaultValue={formData.companyCode}
                  />
                  {errors.companyCode && <Text style={styles.errorText}>{errors.companyCode}</Text>}

                  <View style={styles.mobileButtonGroup}>
                    <TouchableOpacity style={styles.iosMobileBackButton} onPress={handlePrevStep} activeOpacity={0.8}>
                      <Text style={styles.iosBackButtonText}>Volver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iosMobileRegisterButton} onPress={handleRegister} activeOpacity={0.8}>
                      <Text style={styles.iosButtonText}>Crear Cuenta</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Login section for mobile */}
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

      {/* Loading modal with iOS style */}
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

// Styles for the registration screen with iOS style
const styles = StyleSheet.create({
  // General styles with iOS style
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
    marginBottom: 20,
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  iosNextButton: {
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
  iosRegisterButton: {
    flex: 1,
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  iosBackButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  iosMobileRegisterButton: {
    flex: 2,
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  iosMobileBackButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  iosButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  iosBackButtonText: {
    color: "#3A3A3C",
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
  buttonGroup: {
    flexDirection: "row",
    marginTop: 24,
  },
  mobileButtonGroup: {
    flexDirection: "row",
    marginTop: 24,
  },

  // Modal with iOS style
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

  // Desktop styles
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

  // Form layout styles (desktop)
  iosFormRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20,
  },
  iosFormColumn: {
    flex: 1,
  },

  // Picker styles
  pickerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  picker: {
    height: 50,
  },
  mobileSelector: {
    marginBottom: 20,
  },

  // Mobile picker custom styles
  mobilePickerButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  mobilePickerButtonText: {
    fontSize: 17,
    color: "#000000",
  },
  mobilePickerPlaceholder: {
    color: "#8E8E93",
  },
  mobilePickerDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    maxHeight: 200,
  },
  mobilePickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  mobilePickerItemText: {
    fontSize: 16,
    color: "#000000",
  },
  mobilePickerItemTextSelected: {
    color: Colors.PRIMARYCOLOR,
    fontWeight: "600",
  },

  // Error message styles
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 16,
  },
  errorToast: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    borderRadius: 8,
    padding: 12,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  errorToastText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },

  // Progress indicator styles
  progressContainer: {
    marginBottom: 30,
    marginTop: 10,
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  progressStepActive: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  progressStepActive: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  progressStepActive: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  progressStepActive: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  progressLine: {
    height: 4,
    backgroundColor: "#F2F2F7",
    flex: 1,
    marginHorizontal: 10,
    position: "relative",
    overflow: "hidden",
  },
  progressLineFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    flex: 1,
  },
})

export default RegisterScreen