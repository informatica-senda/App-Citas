import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const AppointmentList = ({ appointments, onSelectAppointment }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onSelectAppointment(item)}>
      <View style={styles.appointmentItem}>
        <Text style={styles.appointmentTitle}>{item.title}</Text>
        <Text style={styles.appointmentDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={appointments}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={styles.emptyText}>No hay citas programadas</Text>}
    />
  );
};


const styles = StyleSheet.create({
  appointmentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default AppointmentList;
