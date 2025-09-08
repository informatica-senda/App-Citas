import { StyleSheet } from "react-native"
import Colors from "@styles/colors"

// Estilos de la pantalla
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  headerCitas: {
    paddingTop: "10%",
    backgroundColor: "#ffffff",
  },
  headerCitasDesktop: {
    paddingTop: 0,
    paddingVertical: 8,
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  // Estilos para desktop
  desktopContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.BACKGROUND,
  },
  desktopLeftPanel: {
    width: "40%",
    borderRight: "1px solid #e0e0e0",
    padding: 20,
    backgroundColor: "#fff",
  },
  desktopRightPanel: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  // Estilos para la barra de búsqueda
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainerDesktop: {
    margin: 0,
    marginBottom: 16,
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: Colors.TEXTCOLOR,
  },
  // Estilos para los botones de filtro
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterContainerDesktop: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.PRIMARYCOLOR,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  filterButtonDesktop: {
    borderRadius: 8,
    paddingVertical: 10,
  },
  activeFilterButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderColor: Colors.PRIMARYCOLOR,
  },
  filterButtonText: {
    color: Colors.PRIMARYCOLOR,
    fontWeight: "500",
    fontSize: 14,
  },
  activeFilterText: {
    color: "white",
  },
  filterIcon: {
    marginRight: 5,
  },
  // Estilos para la lista
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  listContainerDesktop: {
    paddingTop: 0,
  },
  requestItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestItemDesktop: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  requestContent: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignItems: "center",
  },
  requestName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.TEXTCOLOR,
  },
  requestNameDesktop: {
    fontSize: 20,
  },
  requestDate: {
    fontSize: 14,
    color: Colors.SECONDARYCOLOR,
  },
  requestDateDesktop: {
    fontSize: 16,
  },
  serviceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  requestService: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.PRIMARYCOLOR,
    fontWeight: "500",
  },
  requestServiceDesktop: {
    fontSize: 18,
  },
  requestMessage: {
    fontSize: 14,
    color: Colors.TEXTCOLOR,
    marginTop: 8,
  },
  requestActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestActionButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  requestActionButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  // Estilos para "No hay solicitudes"
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
    textAlign: "center",
  },
  // Estilos para modales
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: Colors.TEXTCOLOR,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 15,
    color: Colors.PRIMARYCOLOR,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: Colors.TEXTCOLOR,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  denyButton: {
    backgroundColor: "#FF6347", // Tomato color
  },
  denyButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  cancelButtonText: {
    color: Colors.SECONDARYCOLOR,
    fontSize: 16,
  },
  // Estilos para el contenedor de carga
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
  },
  // Estilos para el contenedor de error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginTop: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  // Estilos para el panel de detalles en desktop
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
    height: "100%",
  },
  detailsHeader: {
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 15,
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },
  detailsTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  detailsContent: {
    padding: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.TEXTCOLOR,
    marginBottom: 10,
  },
  detailsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailsItemText: {
    fontSize: 16,
    color: Colors.SECONDARYCOLOR,
    marginLeft: 10,
  },
  detailsMessageContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 15,
  },
  detailsMessage: {
    fontSize: 16,
    color: Colors.TEXTCOLOR,
  },
  detailsActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  detailsActionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    minWidth: 120,
    alignItems: "center",
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSelectionText: {
    fontSize: 18,
    color: "#CCCCCC",
    marginTop: 10,
    textAlign: "center",
  },
  // Estilos para el indicador de actualización en tiempo real
  updatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: "center",
  },
  updatingContainerMobile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  updatingText: {
    fontSize: 14,
    color: Colors.PRIMARYCOLOR,
    marginLeft: 8,
    fontWeight: "500",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: Colors.SECONDARYCOLOR,
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 12,
  },
  modalDateContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  modalDateLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.TEXTCOLOR,
    marginBottom: 5,
  },
  modalDateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.PRIMARYCOLOR,
  },
})
