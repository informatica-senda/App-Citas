"use client"

import { useState } from "react"
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import Colors from "@styles/colors"
import { useResponsive } from "../hooks/use-responsive"

const RequestServiceModal = ({ visible, onClose, onConfirm }) => {
  const [selectedService, setSelectedService] = useState(null)
  const responsive = useResponsive()

  const handleConfirm = () => {
    if (selectedService) {
      onConfirm(selectedService)
      setSelectedService(null)
    }
  }

  const handleCancel = () => {
    setSelectedService(null)
    onClose()
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, responsive.isDesktop && styles.modalViewDesktop]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, responsive.isDesktop && styles.modalTitleDesktop]}>
              Solicitar nueva cita
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, responsive.isDesktop && styles.modalSubtitleDesktop]}>
            Selecciona el tipo de servicio que deseas solicitar
          </Text>

          <View style={[styles.serviceOptions, responsive.isDesktop && styles.serviceOptionsDesktop]}>
            <TouchableOpacity
              style={[
                styles.serviceOption,
                selectedService === "psychology" && styles.selectedServicePsychology,
                responsive.isDesktop && styles.serviceOptionDesktop,
                selectedService === "psychology" && responsive.isDesktop && styles.selectedServicePsychologyDesktop,
              ]}
              onPress={() => setSelectedService("psychology")}
            >
              <View
                style={[
                  styles.serviceIconContainer,
                  selectedService === "psychology" && styles.selectedServiceIconContainer,
                  responsive.isDesktop && styles.serviceIconContainerDesktop,
                ]}
              >
                <FontAwesome5
                  name="brain"
                  size={responsive.isDesktop ? 24 : 20}
                  color={selectedService === "psychology" ? Colors.PSICOLOGIA : Colors.PSICOLOGIA}
                />
              </View>

              <Text
                style={[
                  styles.serviceOptionText,
                  selectedService === "psychology" && styles.selectedServiceText,
                  responsive.isDesktop && styles.serviceOptionTextDesktop,
                ]}
              >
                Psicología
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.serviceOption,
                selectedService === "nutrition" && styles.selectedServiceNutrition,
                responsive.isDesktop && styles.serviceOptionDesktop,
                selectedService === "nutrition" && responsive.isDesktop && styles.selectedServiceNutritionDesktop,
              ]}
              onPress={() => setSelectedService("nutrition")}
            >
              <View
                style={[
                  styles.serviceIconContainer,
                  selectedService === "nutrition" && styles.selectedServiceIconContainer,
                  responsive.isDesktop && styles.serviceIconContainerDesktop,
                ]}
              >
                <MaterialCommunityIcons
                  name="food-apple"
                  size={responsive.isDesktop ? 24 : 20}
                  color={selectedService === "nutrition" ? Colors.NUTRICIÓN : Colors.NUTRICIÓN}
                />
              </View>

              <Text
                style={[
                  styles.serviceOptionText,
                  selectedService === "nutrition" && styles.selectedServiceText,
                  responsive.isDesktop && styles.serviceOptionTextDesktop,
                ]}
              >
                Nutrición
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.buttonContainer, responsive.isDesktop && styles.buttonContainerDesktop]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, responsive.isDesktop && styles.cancelButtonDesktop]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, responsive.isDesktop && styles.cancelButtonTextDesktop]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                !selectedService && styles.disabledButton,
                responsive.isDesktop && styles.confirmButtonDesktop,
                !selectedService && responsive.isDesktop && styles.disabledButtonDesktop,
              ]}
              onPress={handleConfirm}
              disabled={!selectedService}
            >
              <Text style={[styles.confirmButtonText, responsive.isDesktop && styles.confirmButtonTextDesktop]}>
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    ...Platform.select({
      web: {
        backdropFilter: "blur(5px)",
      },
    }),
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    maxWidth: 450,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewDesktop: {
    padding: 0,
    borderRadius: 16,
    maxWidth: 500,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-20px)",
    transition: "transform 0.3s ease-out",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "#f3f4f6",
        },
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalTitleDesktop: {
    fontSize: 22,
    color: "#1a1a1a",
    letterSpacing: "-0.5px",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  modalSubtitleDesktop: {
    fontSize: 17,
    color: "#4b5563",
    marginTop: 20,
    marginBottom: 24,
  },
  serviceOptions: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  serviceOptionsDesktop: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  serviceOption: {
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8f8f8",
    flexDirection: "row",
    alignItems: "center",
  },
  serviceOptionDesktop: {
    width: "48%",
    padding: 20,
    borderRadius: 10,
    marginVertical: 0,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      borderColor: "#d1d5db",
      backgroundColor: "#f3f4f6",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    },
  },
  selectedServicePsychology: {
    backgroundColor: "rgba(0, 123, 255, 0.15)",
    borderColor: Colors.PSICOLOGIA,
    borderWidth: 2,
  },
  selectedServicePsychologyDesktop: {
    boxShadow: "0 4px 12px rgba(0, 123, 255, 0.2)",
    transform: "translateY(-2px)",
  },
  selectedServiceNutrition: {
    backgroundColor: "rgba(40, 167, 69, 0.15)",
    borderColor: Colors.NUTRICIÓN,
    borderWidth: 2,
  },
  selectedServiceNutritionDesktop: {
    boxShadow: "0 4px 12px rgba(40, 167, 69, 0.2)",
    transform: "translateY(-2px)",
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  serviceIconContainerDesktop: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  selectedServiceIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  serviceOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  serviceOptionTextDesktop: {
    fontSize: 18,
    fontWeight: "600",
  },
  selectedServiceText: {
    color: "#333",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  buttonContainerDesktop: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginTop: 0,
  },
  actionButton: {
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonDesktop: {
    padding: 14,
    borderRadius: 8,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#f3f4f6",
      borderColor: "#c1c5cb",
    },
  },
  confirmButton: {
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  confirmButtonDesktop: {
    padding: 14,
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(22, 107, 255, 0.3)",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#0055e6",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(22, 107, 255, 0.4)",
    },
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  disabledButtonDesktop: {
    boxShadow: "none",
    cursor: "not-allowed",
    ":hover": {
      transform: "none",
      boxShadow: "none",
      backgroundColor: "#cccccc",
    },
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButtonTextDesktop: {
    fontSize: 16,
    letterSpacing: "0.3px",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonTextDesktop: {
    fontSize: 16,
    letterSpacing: "0.3px",
    fontWeight: "600",
  },
})

export default RequestServiceModal

