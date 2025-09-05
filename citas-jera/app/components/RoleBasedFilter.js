import { View, Text, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import Colors from "@styles/colors"

const RoleBasedFilter = ({ userSubject }) => {
  if (!userSubject) return null

  const subjectText = userSubject === "psychology" ? "Psicología" : "Nutrición"
  const subjectColor = userSubject === "psychology" ? Colors.PSICOLOGIA : Colors.NUTRICIÓN

  return (
    <View style={[styles.container, { backgroundColor: `${subjectColor}20` }]}>
      <MaterialIcons name="filter-list" size={14} color={subjectColor} style={styles.icon} />
      <Text style={[styles.text, { color: subjectColor }]}>Filtrado por: {subjectText}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
  icon: {
    marginRight: 4,
  },
})

export default RoleBasedFilter
