import { StyleSheet, Platform, Dimensions } from "react-native"
import Colors from "@styles/colors"

const screenWidth = Dimensions.get("window").width
const isDesktop = screenWidth >= 768

export default StyleSheet.create({
  // Estilos generales con estilo iOS
  iosSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  iosContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  iosHeaderContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? 40 : Platform.OS === "web" ? 0 : 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    position: "relative",
  },
  iosHeader: {
    backgroundColor: "#FFFFFF",
  },
  iosHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.5,
  },
  iosViewToggleButton: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "android" ? 50 : 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    zIndex: 10,
  },

  // Filtros con estilo iOS
  iosFilterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  iosFilterScrollContent: {
    paddingHorizontal: 16,
  },
  iosFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  iosFilterButtonActive: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  iosFilterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3A3A3C",
  },
  iosFilterTextActive: {
    color: "#FFFFFF",
  },
  iosFilterIcon: {
    marginRight: 6,
  },
  iosPsychologyFilterActive: {
    backgroundColor: Colors.PSICOLOGIA,
    borderColor: Colors.PSICOLOGIA,
  },
  iosNutritionFilterActive: {
    backgroundColor: Colors.NUTRICIÓN,
    borderColor: Colors.NUTRICIÓN,
  },

  // Botones con estilo iOS
  iosClearDateButtonLarge: {
    backgroundColor: "#F2F2F7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  iosClearDateButtonText: {
    color: Colors.PRIMARYCOLOR,
    fontSize: 16,
    fontWeight: "500",
  },
  // Calendario con estilo iOS
  iosCalendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },

  // Lista de citas con estilo iOS
  iosAppointmentsList: {
    marginTop: 8,
  },
  iosAppointmentsGridDesktop: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iosSelectedDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iosTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iosSelectedDateText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000000",
    letterSpacing: 0.5,
  },
  iosClearDateButton: {
    padding: 6,
    borderRadius: 16,
  },
  // Nuevo estilo compacto para las citas
  iosAppointmentItemCompact: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  iosAppointmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iosAppointmentMainInfo: {
    flex: 1,
  },
  iosAppointmentTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iosDoctorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  iosDateSeparator: {
    marginHorizontal: 4,
    color: "#8E8E93",
    fontSize: 12,
  },
  iosPsychologyItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.PSICOLOGIA,
  },
  iosNutritionItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.NUTRICIÓN,
  },
  iosAppointmentItemDesktop: {
    width: "calc(50% - 8px)",
    marginBottom: 12,
  },
  iosAppointmentTitleCompact: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  iosCategoryBadgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  iosCategoryTextCompact: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  iosDetailTextCompact: {
    marginLeft: 4,
    color: "#3A3A3C",
    fontSize: 13,
    fontWeight: "400",
  },
  iosPsychologyBadge: {
    backgroundColor: Colors.PSICOLOGIA,
  },
  iosNutritionBadge: {
    backgroundColor: Colors.NUTRICIÓN,
  },

  // Estado vacío con estilo iOS
  iosEmptyStateContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  iosNoAppointmentsText: {
    fontSize: 17,
    color: "#8E8E93",
    marginBottom: 16,
    textAlign: "center",
  },
  iosClearFilterButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  iosClearFilterButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Estilos específicos para móvil con estilo iOS
  iosMobileScrollView: {
    flex: 1,
  },
  iosMobileScrollContent: {
    padding: 16,
    paddingBottom: 80,
  },

  // Estilos para layout desktop
  iosContentContainerDesktop: {
    flexDirection: "row",
    flex: 1,
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
    padding: 16,
  },
  iosScrollViewDesktop: {
    flex: 1,
    maxWidth: "50%",
    paddingRight: 16,
  },
  iosScrollContentDesktop: {
    paddingBottom: 20,
  },
  iosAppointmentsScrollDesktop: {
    flex: 1,
    padding: 16,
    maxWidth: "50%",
    paddingLeft: 16,
  },
  iosAppointmentsScrollContent: {
    paddingBottom: 40,
  },

  // Estilos para modales con estilo iOS
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

  // Estilos para el estado de la cita
  iosStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  iosStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  iosStatusConfirmed: {
    backgroundColor: "#34C759", // Verde iOS
  },
  iosStatusPending: {
    backgroundColor: "#FF9500", // Naranja iOS
  },
  iosStatusText: {
    fontSize: 13,
    color: "#3A3A3C",
  },

  // Estilos para filtros de estado
  iosStatusFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
    width: "100%",
  },
  iosStatusFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  iosStatusFilterButtonActive: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  iosStatusFilterButtonConfirmed: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  iosStatusFilterButtonPending: {
    backgroundColor: "#FF9500",
    borderColor: "#FF9500",
  },
  iosStatusFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3A3A3C",
    marginLeft: 4,
  },
  iosStatusFilterTextActive: {
    color: "#FFFFFF",
  },

  // Estilos para estados de carga y error
  iosLoadingContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  iosLoadingText: {
    fontSize: 17,
    color: "#3A3A3C",
    marginTop: 12,
  },
  iosErrorContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  iosErrorText: {
    fontSize: 17,
    color: "#FF3B30",
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  iosRetryButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  iosRetryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos para el indicador de actualización en tiempo real
  iosUpdatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: "center",
  },
  iosUpdatingText: {
    fontSize: 14,
    color: Colors.PRIMARYCOLOR,
    marginLeft: 8,
    fontWeight: "500",
  },
  iosRequestServiceButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iosButtonIcon: {
    marginRight: 8,
  },
  iosRequestServiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})