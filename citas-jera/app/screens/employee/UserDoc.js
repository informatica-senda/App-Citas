import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Linking } from "react-native";
import Header from "@components/HeaderAdmin.js";
import Colors from "@styles/colors";
import { useResponsive } from "../../hooks/use-responsive";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Sample document data structure (for reference)
const sampleDocuments = [
  {
    id: "1",
    title: "Guía de Servicios de Psicología",
    description: "Información detallada sobre nuestros servicios de psicología y cómo pueden ayudarte.",
    url: "https://example.com/docs/psychology-guide.pdf"
  },
  {
    id: "2",
    title: "Manual de Nutrición",
    description: "Guía completa sobre nuestros servicios de nutrición y planes alimenticios.",
    url: "https://example.com/docs/nutrition-manual.pdf"
  },
  {
    id: "3",
    title: "Políticas de Privacidad",
    description: "Documentos legales sobre el manejo de tu información personal y derechos de privacidad.",
    url: "https://example.com/docs/privacy-policy.pdf"
  }
];

const UserDoc = ({ documents = sampleDocuments }) => {
  const responsive = useResponsive();

  const handleDocumentPress = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error("Error al abrir el documento:", err);
        // Aquí podrías mostrar un mensaje de error al usuario
      });
    }
  };

  const getDocumentIcon = (url) => {
    if (!url) return "document-outline";
    
    const extension = url.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return "document-text";
      case 'doc':
      case 'docx':
        return "document-text";
      case 'xls':
      case 'xlsx':
        return "document-text";
      case 'ppt':
      case 'pptx':
        return "document-text";
      default:
        return "document-outline";
    }
  };

  return (
    <>
      {/* Encabezado de la pantalla */}
      <View style={[styles.headerCitas, responsive.isWeb && styles.headerCitasWeb]}>
        <Header header_text={"Documentos"} />
      </View>
      
      <View style={[styles.container, responsive.isDesktop && styles.containerDesktop]}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Biblioteca de Documentos</Text>
          <Text style={styles.pageDescription}>
            Accede a toda la documentación importante relacionada con nuestros servicios
          </Text>
        </View>
        
        <ScrollView
          contentContainerStyle={responsive.isDesktop ? styles.contentContainerDesktop : styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={responsive.isDesktop ? styles.documentCardContainer : undefined}>
            {documents.map((doc, index) => (
              <TouchableOpacity 
                key={doc.id || index}
                style={styles.documentCard}
                onPress={() => handleDocumentPress(doc.url)}
                activeOpacity={0.7}
              >
                <View style={styles.documentIconContainer}>
                  <Ionicons name={getDocumentIcon(doc.url)} size={responsive.isDesktop ? 36 : 30} color={Colors.PRIMARYCOLOR} />
                </View>
                <View style={styles.documentContent}>
                  <Text style={styles.documentTitle}>{doc.title}</Text>
                  <Text style={styles.documentText} numberOfLines={2}>
                    {doc.description}
                  </Text>
                </View>
                <View style={styles.documentAction}>
                  <MaterialIcons name="open-in-new" size={24} color={Colors.PRIMARYCOLOR} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {documents.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay documentos disponibles</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  containerDesktop: {
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  contentContainerDesktop: {
    padding: 24,
    paddingBottom: 40,
  },
  headerCitas: {
    paddingTop: Platform.OS === "android" ? "10%" : Platform.OS === "ios" ? "10%" : 0,
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  headerCitasWeb: {
    paddingTop: 0,
  },
  pageHeader: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  pageDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  documentCardContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
  },
  documentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    width: Platform.OS === "web" ? "calc(33.33% - 16px)" : "100%",
    minWidth: Platform.OS === "web" ? 300 : "auto",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  documentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  documentContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  documentText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  documentAction: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
});

export default UserDoc;