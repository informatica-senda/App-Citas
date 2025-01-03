import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Header from '@components/HeaderAdmin.js';
import Colors from '@styles/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppointmentModalAdmin from '@components/AppointmentModalAdmin'; // Importamos el modal

const AppointmentsScreen = () => {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [appointments, setAppointments] = useState([
        { id: '1', employee: 'Juan Pérez', date: '2024-12-31', time: '14:00:00', category: 'psychology', phone: '123-456-7890', title: 'Cita de Psicología',  },
        { id: '2', employee: 'Ana López', date: '2023-06-16', time: '14:00:00',category: 'nutrition', phone: '098-765-4321', title: 'Cita de Nutrición' },
    ]);
    const [selectedDate, setSelectedDate] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        employee: '',
        category: '',
        date: '',
        clientPhone: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Juan Pérez', phone: '123-456-7890' },
        { id: 2, name: 'Ana López', phone: '098-765-4321' }
    ]);
    const [markedDates, setMarkedDates] = useState({});
    const [selectedAppointment, setSelectedAppointment] = useState(null); // Estado para la cita seleccionada

    useEffect(() => {
        const marked = {};
        appointments.forEach(appointment => {
            marked[appointment.date] = { marked: true, dotColor: appointment.category === 'psychology' ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR };
        });
        setMarkedDates(marked);
    }, [appointments]);

    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    const renderAppointmentsForSelectedDate = () => {
        const appointmentsForDay = appointments.filter(a => a.date === selectedDate);
        return (
            <View style={styles.appointmentsList}>
                <Text style={styles.selectedDateText}>Citas para {selectedDate}</Text>
                {appointmentsForDay.map(appointment => (
                    <TouchableOpacity 
                        key={appointment.id} 
                        style={styles.appointmentItem} 
                        onPress={() => setSelectedAppointment(appointment)} // Al presionar, abrir el modal
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
            <View style={styles.headerCitas}>
                <Header header_text="Bienvenido, Admin" />
            </View>
            <View style={styles.container}>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={styles.filterText}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'psychology' && styles.activeFilter]}
                        onPress={() => setFilter('psychology')}
                    >
                        <Text style={styles.filterText}>Psicología</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'nutrition' && styles.activeFilter]}
                        onPress={() => setFilter('nutrition')}
                    >
                        <Text style={styles.filterText}>Nutrición</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Calendar
                        onDayPress={onDayPress}
                        markedDates={markedDates}
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
                    {selectedDate && renderAppointmentsForSelectedDate()}
                </ScrollView>
            </View>

            {/* Modal de cita seleccionada */}
            <AppointmentModalAdmin 
                appointment={selectedAppointment} 
                visible={!!selectedAppointment} 
                onClose={() => setSelectedAppointment(null)} 
            />
        </>
    );
};

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

export default AppointmentsScreen;
