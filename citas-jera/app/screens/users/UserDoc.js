import { View, Text, StyleSheet, ScrollView, Platform } from "react-native"
import Header from "@components/HeaderAdmin.js"
import Colors from "@styles/colors"
import { useResponsive } from "../../hooks/use-responsive"

const UserDoc = () => {
  const responsive = useResponsive()

  return (
    <>
      {/* Encabezado de la pantalla */}
      <View style={[styles.headerCitas, responsive.isWeb && styles.headerCitasWeb]}>
        <Header header_text={"Documentos"} />
      </View>
      <View style={[styles.container, responsive.isDesktop && styles.containerDesktop]}>
        <ScrollView
          contentContainerStyle={responsive.isDesktop ? styles.contentContainerDesktop : undefined}
          showsVerticalScrollIndicator={false}
        >
          <View style={responsive.isDesktop ? styles.documentCardContainer : undefined}>
            <View style={styles.documentCard}>
              <Text style={styles.documentTitle}>Documentación del Usuario</Text>
              <Text style={styles.documentText}>
                Aquí encontrarás toda la documentación relacionada con tu cuenta y servicios.
              </Text>
            </View>

            <View style={styles.documentCard}>
              <Text style={styles.documentTitle}>Guías de Servicios</Text>
              <Text style={styles.documentText}>
                Información detallada sobre nuestros servicios de psicología y nutrición.
              </Text>
            </View>

            <View style={styles.documentCard}>
              <Text style={styles.documentTitle}>Políticas de Privacidad</Text>
              <Text style={styles.documentText}>Documentos legales sobre el manejo de tu información personal.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  containerDesktop: {
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
  },
  contentContainerDesktop: {
    padding: 24,
  },
  headerCitas: {
    paddingTop: Platform.OS === "android" ? "10%" : Platform.OS === "ios" ? "10%" : 0,
    backgroundColor: Colors.PRIMARYCOLOR,
  },
  headerCitasWeb: {
    paddingTop: 0,
  },
  documentCardContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: Platform.OS === "web" ? "calc(33.33% - 16px)" : "100%",
    minWidth: Platform.OS === "web" ? 300 : "auto",
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  documentText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  text: {
    fontSize: 18,
    color: "#333",
  },
})

export default UserDoc

