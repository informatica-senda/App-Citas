import React from "react";
import { View, Text, StyleSheet,TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colors from "@styles/colors";

const FichajeScreen = () => {
    const navigation = useNavigation();
    
    return (
        <View style={styles.container}>
        <Text style={styles.title}>Fichaje</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Fichaje")}>

        <Text style={styles.buttonText}>Fichar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Fichaje")}>
            <Text style={styles.buttonText}>Fichar</Text>
        </TouchableOpacity>
            </View>
    );
    };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.BACKGROUND,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.TEXT,
    },
    button: {
        backgroundColor: Colors.PRIMARYCOLOR,
        width: "80%",
        marginVertical: 10,
    },
    buttonText: {
        color: Colors.TEXTWHITE,
    },
});

export default FichajeScreen;