import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar, CalendarList, Agenda, LocaleConfig } from 'react-native-calendars';
import Header from '@components/HeaderAdmin.js';
import Colors from '@styles/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

const AppointmentsScreen = () => {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [appointments, setAppointments] = useState([
        { id: '1', employee: 'Juan Pérez', date: '2024-12-31', category: 'psychology', phone: '123-456-7890' },
        { id: '2', employee: 'Ana López', date: '2023-06-16', category: 'nutrition', phone: '098-765-4321' },
    ]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        employee: '',
        category: '',
        date: '',
        clientPhone: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    const [employees, setEmployees] = useState([
        { id: 1, name: 'Juan Pérez', phone: '123-456-7890' },
        { id: 2, name: 'Ana López', phone: '098-765-4321' }
    ]);

    const [markedDates, setMarkedDates] = useState({});

    useEffect(() => {
        const marked = {};
        appointments.forEach(appointment => {
            marked[appointment.date] = { marked: true, dotColor: appointment.category === 'psychology' ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR };
        });
        setMarkedDates(marked);
    }, [appointments]);

    const addNewEmployee = (employeeName, employeePhone) => {
        const newEmployee = {
            id: employees.length + 1,
            name: employeeName,
            phone: employeePhone
        };
        setEmployees(prevEmployees => [...prevEmployees, newEmployee]);
    };

    const handleEmployeeChange = (employeeName) => {
        const selectedEmployee = employees.find(emp => emp.name === employeeName);
        setNewAppointment({
            ...newAppointment,
            employee: employeeName,
            clientPhone: selectedEmployee ? selectedEmployee.phone : '',
        });
    };

    const addAppointment = () => {
        if (
            newAppointment.employee &&
            newAppointment.category &&
            newAppointment.date &&
            newAppointment.clientPhone
        ) {
            const newAppointmentObj = { ...newAppointment, id: Date.now().toString() };
            setAppointments(prevAppointments => [...prevAppointments, newAppointmentObj]);
            setNewAppointment({
                employee: '',
                category: '',
                date: '',
                clientPhone: ''
            });
            setIsAddModalVisible(false);
        } else {
            console.log("Todos los campos son necesarios");
        }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || newAppointment.date;
        setShowDatePicker(false);
        setNewAppointment({ ...newAppointment, date: currentDate.toISOString().split('T')[0] });
    };

    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    const renderAppointmentsForSelectedDate = () => {
        const appointmentsForDay = appointments.filter(a => a.date === selectedDate);
        return (
            <View style={styles.appointmentsList}>
                <Text style={styles.selectedDateText}>Citas para {selectedDate}</Text>
                {appointmentsForDay.map(appointment => (
                    <View key={appointment.id} style={styles.appointmentItem}>
                        <Text style={styles.appointmentText}>{appointment.employee}</Text>
                        <Text style={styles.appointmentText}>{appointment.category}</Text>
                        <Text style={styles.appointmentText}>Teléfono: {appointment.phone}</Text>
                    </View>
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
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
                        <Text style={styles.addButtonText}>Añadir Cita</Text>
                    </TouchableOpacity>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isAddModalVisible}
                        onRequestClose={() => setIsAddModalVisible(false)}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Picker
                                    selectedValue={newAppointment.employee}
                                    style={styles.picker}
                                    onValueChange={handleEmployeeChange}
                                >
                                    <Picker.Item label="Seleccionar empleado" value="" />
                                    {employees.map(emp => (
                                        <Picker.Item key={emp.id} label={emp.name} value={emp.name} />
                                    ))}
                                </Picker>
                                <Picker
                                    selectedValue={newAppointment.category}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setNewAppointment({ ...newAppointment, category: itemValue })}
                                >
                                    <Picker.Item label="Seleccionar categoría" value="" />
                                    <Picker.Item label="Psicología" value="psychology" />
                                    <Picker.Item label="Nutrición" value="nutrition" />
                                </Picker>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Fecha (YYYY-MM-DD)"
                                        value={newAppointment.date}
                                        editable={false}
                                    />
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={newAppointment.date ? new Date(newAppointment.date) : new Date()}
                                        mode="date"
                                        display="spinner"
                                        onChange={handleDateChange}
                                    />
                                )}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Teléfono del cliente"
                                    value={newAppointment.clientPhone}
                                    editable={false}
                                />
                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: Colors.SUCCESS }]} onPress={addAppointment}>
                                    <Text style={styles.modalButtonText}>Añadir Cita</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: Colors.ERROR }]} onPress={() => setIsAddModalVisible(false)}>
                                    <Text style={styles.modalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </View>

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
    addButton: {
        backgroundColor: Colors.PRIMARYCOLOR,
        paddingVertical: 15,
        borderRadius: 50,
        marginTop: 20,
    },
    addButtonText: {
        color: Colors.TEXTWHITE,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: Colors.TEXTWHITE,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
    },
    input: {
        height: 45,
        width: 250,
        borderColor: Colors.TEXT,
        borderWidth: 1,
        borderRadius: 25,
        paddingLeft: 20,
        marginBottom: 15,
        fontSize: 16,
    },
    picker: {
        width: 250,
        marginBottom: 15,
        backgroundColor: Colors.BACKGROUND,
        borderRadius: 25,
        color: Colors.TEXT,
    },
    modalButton: {
        width: '50%',
        paddingVertical: 15,
        borderRadius: 50,
        marginTop: 10
    },
    modalButtonText: {
        color: Colors.TEXTWHITE,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default AppointmentsScreen;

