import { StyleSheet } from "react-native"
import Colors from "@styles/colors"

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  container: {
    flex: 1,
    padding: 16,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainerDesktop: {
    height: 46,
    borderRadius: 8,
    marginBottom: 20,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  listContainerDesktop: {
    paddingBottom: 40,
  },
  employeeItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  employeeItemDesktop: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
  },
  selectedEmployeeItem: {
    backgroundColor: "#f0f7ff",
    borderLeft: `4px solid ${Colors.PRIMARYCOLOR}`,
  },
  employeeContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.PRIMARYCOLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarContainerDesktop: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarTextDesktop: {
    fontSize: 16,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 2,
  },
  employeeNameDesktop: {
    fontSize: 15,
  },
  employeeCode: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  employeeCodeDesktop: {
    fontSize: 13,
  },
  employeePhone: {
    fontSize: 14,
    color: "#666",
  },
  employeePhoneDesktop: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
  },
  retryButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos para el panel de detalles en desktop
  noSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noSelectionText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    maxWidth: "80%",
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  },
  detailsHeader: {
    backgroundColor: Colors.PRIMARYCOLOR,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  detailsAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  detailsAvatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  detailsHeaderInfo: {
    flex: 1,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  detailsRole: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  detailsContent: {
    padding: 24,
    flex: 1,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    borderBottom: "1px solid #eee",
    paddingBottom: 8,
  },
  detailsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailsItemText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 12,
  },
})
