// Importación de librerías y componentes necesarios.
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Selector desplegable de opciones
import { Calendar, LocaleConfig } from 'react-native-calendars'; // Componente de calendario
import Header from '@components/HeaderAdmin.js'; // Componente del encabezado
import Colors from '@styles/colors'; // Colores utilizados para la interfaz
import DateTimePicker from '@react-native-community/datetimepicker'; // Componente para seleccionar fechas y horas
import AppointmentModalAdmin from '@components/AppointmentModalAdmin'; // Modal que muestra detalles de la cita seleccionada

// Definición del componente AppointmentsScreen
const AppointmentsScreen = () => {
    // Estado para el filtro de citas (por tipo: 'all', 'psychology', 'nutrition')
    const [filter, setFilter] = useState('all');

    // Estado para la búsqueda de citas, aunque no está implementado en este fragmento
    const [searchQuery, setSearchQuery] = useState('');

    // Estado que contiene las citas programadas
    const [appointments, setAppointments] = useState([
        { id: '1', employee: 'Juan Pérez', date: '2024-12-31', time: '14:00:00', category: 'psychology', phone: '123-456-7890', title: 'Cita de Psicología' },
        { id: '2', employee: 'Ana López', date: '2023-06-16', time: '14:00:00', category: 'nutrition', phone: '098-765-4321', title: 'Cita de Nutrición' }
    ]);

    // Estado para la fecha seleccionada en el calendario
    const [selectedDate, setSelectedDate] = useState('');

    // Estado para controlar la visibilidad del modal de agregar cita
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    // Estado para gestionar la nueva cita que se está creando
    const [newAppointment, setNewAppointment] = useState({
        employee: '',
        category: '',
        date: '',
        clientPhone: '',
    });

    // Estado para mostrar el selector de fecha y hora
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Estado para los empleados disponibles
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Juan Pérez', phone: '123-456-7890' },
        { id: 2, name: 'Ana López', phone: '098-765-4321' }
    ]);

    // Estado para marcar las fechas en el calendario (colores de acuerdo con la categoría de la cita)
    const [markedDates, setMarkedDates] = useState({});

    // Estado para la cita seleccionada (para mostrar detalles en el modal)
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // useEffect para actualizar los días marcados en el calendario cada vez que cambian las citas
    useEffect(() => {
        const marked = {}; // Objeto para almacenar las fechas marcadas
        appointments.forEach(appointment => {
            // Se marca la fecha en el calendario y se asigna un color dependiendo de la categoría
            marked[appointment.date] = { marked: true, dotColor: appointment.category === 'psychology' ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR };
        });
        setMarkedDates(marked); // Actualizamos el estado de las fechas marcadas
    }, [appointments]); // Este efecto se ejecuta cada vez que cambian las citas

    // Función para manejar la selección de un día en el calendario
    const onDayPress = (day) => {
        setSelectedDate(day.dateString); // Actualizamos la fecha seleccionada
    };

    // Función para renderizar las citas programadas para el día seleccionado
    const renderAppointmentsForSelectedDate = () => {
        // Filtramos las citas que corresponden a la fecha seleccionada
        const appointmentsForDay = appointments.filter(a => a.date === selectedDate);
        return (
            <View style={styles.appointmentsList}>
                <Text style={styles.selectedDateText}>Citas para {selectedDate}</Text>
                {appointmentsForDay.map(appointment => (
                    // Al presionar una cita, se abre el modal con los detalles de la cita
                    <TouchableOpacity 
                        key={appointment.id} 
                        style={styles.appointmentItem} 
                        onPress={() => setSelectedAppointment(appointment)}
                    >
                        <Text style={styles.appointmentText}>{appointment.employee}</Text>
                        <Text style={styles.appointmentText}>{appointment.category}</Text>
                        <Text style={styles.appointmentText}>Teléfono: {appointment.phone}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <>
            {/* Encabezado de la pantalla con el texto "Bienvenido, Admin" */}
            <View style={styles.headerCitas}>
                <Header header_text="Bienvenido, Admin" />
            </View>

            <View style={styles.container}>
                {/* Filtro para seleccionar el tipo de cita (Todas, Psicología, Nutrición) */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
                        onPress={() => setFilter('all')} // Al hacer clic se activa el filtro "Todas"
                    >
                        <Text style={styles.filterText}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'psychology' && styles.activeFilter]}
                        onPress={() => setFilter('psychology')} // Al hacer clic se activa el filtro "Psicología"
                    >
                        <Text style={styles.filterText}>Psicología</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'nutrition' && styles.activeFilter]}
                        onPress={() => setFilter('nutrition')} // Al hacer clic se activa el filtro "Nutrición"
                    >
                        <Text style={styles.filterText}>Nutrición</Text>
                    </TouchableOpacity>
                </View>

                {/* ScrollView para mostrar el calendario y las citas */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Calendar
                        onDayPress={onDayPress} // Manejador de selección de días
                        markedDates={markedDates} // Fechas marcadas para mostrar en el calendario
                        theme={{
                            backgroundColor: Colors.BACKGROUND,
                            calendarBackground: Colors.BACKGROUND,
                            textSectionTitleColor: Colors.TEXT,
                            selectedDayBackgroundColor: Colors.PRIMARYCOLOR,
                            selectedDayTextColor: Colors.TEXTWHITE,
                            todayTextColor: Colors.PRIMARYCOLOR,
                            dayTextColor: Colors.TEXT,
                            textDisabledColor: '#d9e1e8',
                            dotColor: Colors.PRIMARYCOLOR,
                            selectedDotColor: Colors.TEXTWHITE,
                            arrowColor: Colors.PRIMARYCOLOR,
                            monthTextColor: Colors.TEXT,
                            indicatorColor: Colors.PRIMARYCOLOR,
                        }}
                    />
                    {/* Si se ha seleccionado una fecha, renderizamos las citas para ese día */}
                    {selectedDate && renderAppointmentsForSelectedDate()}
                </ScrollView>
            </View>

            {/* Modal para mostrar los detalles de la cita seleccionada */}
            <AppointmentModalAdmin 
                appointment={selectedAppointment} 
                visible={!!selectedAppointment} // El modal solo es visible si hay una cita seleccionada
                onClose={() => setSelectedAppointment(null)} // Cerramos el modal cuando se presiona el botón de cerrar
            />
        </>
    );
};

// Estilos para los componentes de la pantalla
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.BACKGROUND,
    },
    headerCitas: {
        paddingTop: '10%',
        backgroundColor: Colors.PRIMARYCOLOR,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    filterButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        backgroundColor: Colors.SECONDARYCOLOR
    },
    activeFilter: {
        backgroundColor: Colors.PRIMARYCOLOR,
    },
    filterText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.TEXTWHITE,
    },
    appointmentsList: {
        marginTop: 20,
    },
    selectedDateText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.TEXT,
    },
    appointmentItem: {
        backgroundColor: '#FFF',
        padding: 15,
        marginBottom: 15,
        borderRadius: 10,
    },
    appointmentText: {
        fontSize: 16,
        color: Colors.TEXT,
    },
});

// Exportación del componente AppointmentsScreen
export default AppointmentsScreen;
