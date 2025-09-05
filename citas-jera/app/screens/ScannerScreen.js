import { CameraView } from 'expo-camera';
import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

const ScannerScreen = ({ navigation }) => {

    const [permission, requestPermission] = useCameraPermissions();
    const isCameraPermissionGranted = permission?.granted;
    
    useEffect(() => {
    requestPermission();
    }, []);

    const handleBarcodeScanned = (barcode) => {
        console.log("Barcode scanned:", barcode);

 try {
        // Parseamos el string contenido en barcode.data
        const parsedData = JSON.parse(barcode.data);

        // Extraemos el token
        const token = parsedData.token;

        console.log("Token extraído:", token);
        
        // Aquí puedes hacer algo con el token, como guardarlo en el estado o enviarlo a un servidor

    } catch (error) {
        console.error("Error al leer el token del QR:", error);
    }
        // Aquí puedes manejar el código de barras escaneado, por ejemplo, navegar a otra pantalla o mostrar un mensaje
    };

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing='back'
                onBarcodeScanned={handleBarcodeScanned} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});

export default ScannerScreen;