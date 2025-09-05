import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
} from "react-native"
import Header from "@components/HeaderUser"
import Colors from "@styles/colors"
import { useResponsive } from "../../hooks/use-responsive"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"

// Sample document data structure (for reference)
const sampleDocuments = [
  {
    id: "1",
    title: "Guía de Servicios de Psicología",
    description: "Información detallada sobre nuestros servicios de psicología y cómo pueden ayudarte.",
    url: "https://example.com/docs/psychology-guide.pdf",
    category: "psychology",
  },
  {
    id: "2",
    title: "Manual de Nutrición",
    description: "Guía completa sobre nuestros servicios de nutrición y planes alimenticios.",
    url: "https://example.com/docs/nutrition-manual.pdf",
    category: "nutrition",
  },
  {
    id: "3",
    title: "Políticas de Privacidad",
    description: "Documentos legales sobre el manejo de tu información personal y derechos de privacidad.",
    url: "https://example.com/docs/privacy-policy.pdf",
    category: "legal",
  },
  {
    id: "4",
    title: "Guía de Ejercicios Recomendados",
    description: "Rutinas de ejercicios recomendadas por nuestros especialistas para complementar tu tratamiento.",
    url: "https://example.com/docs/exercise-guide.pdf",
    category: "nutrition",
  },
  {
    id: "5",
    title: "Técnicas de Meditación",
    description: "Guía práctica con técnicas de meditación y mindfulness para reducir el estrés y la ansiedad.",
    url: "https://example.com/docs/meditation-guide.pdf",
    category: "psychology",
  },
  {
    id: "6",
    title: "Términos y Condiciones",
    description: "Términos y condiciones de uso de nuestros servicios y plataforma digital.",
    url: "https://example.com/docs/terms-conditions.pdf",
    category: "legal",
  },
]

const UserDoc = ({ documents = sampleDocuments }) => {
  const responsive = useResponsive()
  const isDesktop = responsive?.isDesktop || (Platform.OS === "web" && window.innerWidth >= 768)

  const handleDocumentPress = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error("Error al abrir el documento:", err)
        // Aquí podrías mostrar un mensaje de error al usuario
      })
    }
  }

  const getDocumentIcon = (url, category) => {
    // Primero determinamos el icono por categoría
    let iconName = "document-outline"

    switch (category) {
      case "psychology":
        iconName = "brain-outline"
        break
      case "nutrition":
        iconName = "nutrition-outline"
        break
      case "legal":
        iconName = "shield-checkmark-outline"
        break
      default:
        // Si no hay categoría, determinamos por extensión
        if (!url) return "document-outline"

        const extension = url.split(".").pop().toLowerCase()

        switch (extension) {
          case "pdf":
            iconName = "document-text-outline"
            break
          case "doc":
          case "docx":
            iconName = "document-text-outline"
            break
          case "xls":
          case "xlsx":
            iconName = "grid-outline"
            break
          case "ppt":
          case "pptx":
            iconName = "easel-outline"
            break
          default:
            iconName = "document-outline"
        }
    }

    return iconName
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "psychology":
        return Colors.PSICOLOGIA
      case "nutrition":
        return Colors.NUTRICIÓN
      case "legal":
        return "#6C63FF" // Un color púrpura para documentos legales
      default:
        return Colors.PRIMARYCOLOR
    }
  }

  return (
    <SafeAreaView style={styles.iosSafeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.iosHeaderContainer}>
        <Header
          userName="Usuario"
          screenName="Documentos"
          headerStyle={styles.iosHeader}
          titleStyle={styles.iosHeaderTitle}
        />
      </View>

      <View style={styles.iosContainer}>
        <View style={isDesktop ? styles.iosDesktopLayout : styles.iosMobileLayout}>
          <View style={styles.iosPageHeader}>
            <Text style={styles.iosPageTitle}>Biblioteca de Documentos</Text>
            <Text style={styles.iosPageDescription}>
              Accede a toda la documentación importante relacionada con nuestros servicios
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.iosScrollContent} showsVerticalScrollIndicator={false}>
            <View style={isDesktop ? styles.iosDocumentGrid : styles.iosDocumentList}>
              {documents.map((doc, index) => (
                <TouchableOpacity
                  key={doc.id || index}
                  style={[styles.iosDocumentCard, isDesktop && styles.iosDocumentCardDesktop]}
                  onPress={() => handleDocumentPress(doc.url)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iosDocumentIconContainer,
                      { backgroundColor: `${getCategoryColor(doc.category)}15` }, // 15% opacity
                    ]}
                  >
                    <Ionicons
                      name={getDocumentIcon(doc.url, doc.category)}
                      size={isDesktop ? 32 : 28}
                      color={getCategoryColor(doc.category)}
                    />
                  </View>
                  <View style={styles.iosDocumentContent}>
                    <Text style={styles.iosDocumentTitle}>{doc.title}</Text>
                    <Text style={styles.iosDocumentDescription} numberOfLines={2}>
                      {doc.description}
                    </Text>
                    <View style={styles.iosDocumentMeta}>
                      <View
                        style={[styles.iosCategoryBadge, { backgroundColor: `${getCategoryColor(doc.category)}15` }]}
                      >
                        <Text style={[styles.iosCategoryText, { color: getCategoryColor(doc.category) }]}>
                          {doc.category === "psychology"
                            ? "Psicología"
                            : doc.category === "nutrition"
                              ? "Nutrición"
                              : doc.category === "legal"
                                ? "Legal"
                                : "General"}
                        </Text>
                      </View>
                      <Text style={styles.iosDocumentType}>
                        {doc.url ? doc.url.split(".").pop().toUpperCase() : "DOC"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.iosDocumentAction}>
                    <View style={styles.iosActionButton}>
                      <MaterialIcons name="file-download" size={20} color="#FFFFFF" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {documents.length === 0 && (
              <View style={styles.iosEmptyContainer}>
                <Ionicons name="document" size={64} color="#E5E5EA" />
                <Text style={styles.iosEmptyTitle}>No hay documentos disponibles</Text>
                <Text style={styles.iosEmptyText}>
                  Los documentos importantes aparecerán aquí cuando estén disponibles.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // Estilos generales con estilo iOS
  iosSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  iosContainer: {
    flex: 1,
    backgroundColor: "#F9F9FB", // Fondo claro estilo iOS
  },
  iosHeaderContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? 40 : Platform.OS === "web" ? 0 : 0,
    borderBottomWidth: 0.5, // Borde fino estilo iOS
    borderBottomColor: "rgba(0,0,0,0.1)", // Color sutil
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  iosHeader: {
    backgroundColor: "#FFFFFF",
  },
  iosHeaderTitle: {
    fontSize: 17,
    fontWeight: "600", // Peso de fuente SF Pro
    color: "#000000",
    letterSpacing: -0.5, // Espaciado de letras SF Pro
  },

  // Layouts
  iosDesktopLayout: {
    padding: 24,
    maxWidth: 1200,
    width: "100%",
    marginHorizontal: "auto",
  },
  iosMobileLayout: {
    padding: 16,
  },

  // Encabezado de página
  iosPageHeader: {
    marginBottom: 24,
  },
  iosPageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
    letterSpacing: -0.5, // Estilo SF Pro
  },
  iosPageDescription: {
    fontSize: 17,
    color: "#8E8E93", // Color gris sistema iOS
    lineHeight: 24,
  },

  // Contenido scrollable
  iosScrollContent: {
    paddingBottom: 40,
  },

  // Grid de documentos para escritorio
  iosDocumentGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },

  // Lista de documentos para móvil
  iosDocumentList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  // Tarjeta de documento
  iosDocumentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16, // Bordes más redondeados estilo iOS 16+
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0, // Sin borde para un look más limpio
    width: "100%",
  },
  iosDocumentCardDesktop: {
    width: "calc(50% - 10px)", // 2 columnas con gap de 20px
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    // Efecto hover para web
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
    },
  },

  // Contenedor de icono
  iosDocumentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16, // Más redondeado
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  // Contenido del documento
  iosDocumentContent: {
    flex: 1,
  },
  iosDocumentTitle: {
    fontSize: 17,
    fontWeight: "600", // Peso SF Pro
    color: "#000000",
    marginBottom: 6,
    letterSpacing: -0.5, // Estilo SF Pro
  },
  iosDocumentDescription: {
    fontSize: 15,
    color: "#3A3A3C", // Color texto secundario iOS
    lineHeight: 20,
    marginBottom: 12,
  },

  // Metadatos del documento
  iosDocumentMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iosCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Más redondeado
  },
  iosCategoryText: {
    fontSize: 13,
    fontWeight: "500", // Peso SF Pro
  },
  iosDocumentType: {
    fontSize: 12,
    fontWeight: "500", // Peso SF Pro
    color: "#8E8E93", // Color gris sistema iOS
  },

  // Botón de acción
  iosDocumentAction: {
    marginLeft: 16,
  },
  iosActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circular
    backgroundColor: Colors.PRIMARYCOLOR,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Estado vacío
  iosEmptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iosEmptyTitle: {
    fontSize: 20,
    fontWeight: "600", // Peso SF Pro
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.5, // Estilo SF Pro
  },
  iosEmptyText: {
    fontSize: 17,
    color: "#8E8E93", // Color gris sistema iOS
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 24,
  },
})

export default UserDoc
