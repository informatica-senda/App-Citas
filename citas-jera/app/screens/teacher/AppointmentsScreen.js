import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Header from '@components/HeaderAdmin.js';
import Colors from '@styles/colors';
import AppointmentModalAdmin from '@components/AppointmentModalAdmin';

const AppointmentsScreen = () => {
    // State management
    const [filter, setFilter] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [markedDates, setMarkedDates] = useState({});
    
    // Sample data
    const [appointments, setAppointments] = useState([
        { id: '1', employee: 'Juan Pérez', date: '2025-04-18', time: '14:00:00', category: 'psychology', phone: '123-456-7890', title: 'Cita de Psicología' },
        { id: '2', employee: 'Ana López', date: '2025-04-18', time: '14:00:00', category: 'nutrition', phone: '098-765-4321', title: 'Cita de Nutrición' },
        { id: '3', employee: 'Ana López', date: '2025-04-18', time: '14:00:00', category: 'nutrition', phone: '098-765-4321', title: 'Cita de Nutrición' }
    ]);

    // Update marked dates when appointments change
    useEffect(() => {
        const marked = {};
        appointments.forEach(appointment => {
            marked[appointment.date] = { 
                marked: true, 
                dotColor: appointment.category === 'psychology' ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR 
            };
        });
        setMarkedDates(marked);
    }, [appointments]);

    // Handle day selection in calendar
    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    // Filter appointments based on selected category and date
    const getFilteredAppointments = () => {
        return appointments.filter(appointment => {
            const matchesFilter = filter === 'all' || appointment.category === filter;
            const matchesDate = !selectedDate || appointment.date === selectedDate;
            return matchesFilter && matchesDate;
        });
    };

    // Render appointments for selected date
    const renderAppointments = () => {
        const filteredAppointments = getFilteredAppointments();
        
        if (filteredAppointments.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No hay citas programadas para esta fecha</Text>
                </View>
            );
        }

        return (
            <View style={styles.appointmentsList}>
                <Text style={styles.sectionTitle}>
                    {selectedDate ? `Citas para ${selectedDate}` : 'Todas las citas'}
                </Text>
                {filteredAppointments.map(appointment => (
                    <TouchableOpacity 
                        key={appointment.id} 
                        style={styles.appointmentCard} 
                        onPress={() => setSelectedAppointment(appointment)}
                    >
                        <View style={[
                            styles.categoryIndicator, 
                            { backgroundColor: appointment.category === 'psychology' ? Colors.PRIMARYCOLOR : Colors.SECONDARYCOLOR }
                        ]} />
                        <View style={styles.appointmentContent}>
                            <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                            <Text style={styles.appointmentDetail}>{appointment.employee}</Text>
                            <View style={styles.appointmentFooter}>
                                <Text style={styles.appointmentTime}>{appointment.time}</Text>
                                <Text style={styles.appointmentPhone}>{appointment.phone}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Header header_text="Administración de Citas" />
            </View>

            <View style={styles.container}>
                {/* Filter tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'psychology' && styles.activeFilter]}
                        onPress={() => setFilter('psychology')}
                    >
                        <Text style={[styles.filterText, filter === 'psychology' && styles.activeFilterText]}>Psicología</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'nutrition' && styles.activeFilter]}
                        onPress={() => setFilter('nutrition')}
                    >
                        <Text style={[styles.filterText, filter === 'nutrition' && styles.activeFilterText]}>Nutrición</Text>
                    </TouchableOpacity>
                </View>

                {/* Calendar and appointments */}
                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                    <View style={styles.calendarContainer}>
                        <Calendar
                            onDayPress={onDayPress}
                            markedDates={{
                                ...markedDates,
                                [selectedDate]: {
                                    ...markedDates[selectedDate],
                                    selected: true,
                                    selectedColor: Colors.PRIMARYCOLOR
                                }
                            }}
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
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '600',
                            }}
                        />
                    </View>
                    
                    {renderAppointments()}
                </ScrollView>
            </View>

            {/* Appointment details modal */}
            <AppointmentModalAdmin 
                appointment={selectedAppointment} 
                visible={!!selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND,
    },
    header: {
        paddingTop: '10%',
        backgroundColor: Colors.PRIMARYCOLOR,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    scrollView: {
        flex: 1,
    },
    calendarContainer: {
        backgroundColor: Colors.BACKGROUND,
        borderRadius: 12,
        marginBottom: 16,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 30,
        padding: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 25,
        alignItems: 'center',
    },
    activeFilter: {
        backgroundColor: Colors.PRIMARYCOLOR,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.TEXT,
    },
    activeFilterText: {
        color: Colors.TEXTWHITE,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: Colors.TEXT,
    },
    appointmentsList: {
        marginTop: 8,
    },
    appointmentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    categoryIndicator: {
        width: 6,
        height: '100%',
    },
    appointmentContent: {
        flex: 1,
        padding: 16,
    },
    appointmentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.TEXT,
        marginBottom: 4,
    },
    appointmentDetail: {
        fontSize: 14,
        color: Colors.TEXT,
        marginBottom: 8,
    },
    appointmentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    appointmentTime: {
        fontSize: 14,
        color: Colors.PRIMARYCOLOR,
        fontWeight: '500',
    },
    appointmentPhone: {
        fontSize: 14,
        color: Colors.TEXT,
        opacity: 0.7,
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        marginTop: 16,
    },
    emptyStateText: {
        fontSize: 16,
        color: Colors.TEXT,
        opacity: 0.7,
    },
});

export default AppointmentsScreen;