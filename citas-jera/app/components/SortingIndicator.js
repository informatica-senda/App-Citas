import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Colors from "@styles/colors"

const SortingIndicator = ({ sortOrder, visible = true }) => {
  if (!visible) return null

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{sortOrder === "desc" ? "Más recientes primero" : "Más antiguas primero"}</Text>
      <Ionicons
        name={sortOrder === "desc" ? "arrow-down" : "arrow-up"}
        size={14}
        color={Colors.PRIMARYCOLOR}
        style={styles.icon}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: Colors.PRIMARYCOLOR,
    fontWeight: "500",
  },
  icon: {
    marginLeft: 4,
  },
})

export default SortingIndicator
