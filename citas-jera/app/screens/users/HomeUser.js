import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native'; // Importar Platform
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Header from '@components/HeaderUser';
import AppointmentList from '@components/AppointmentList';
import AppointmentModal from '@components/AppointmentModal';
import Colors from '@styles/colors';  // Importar los colores personalizados

const Tab = createBottomTabNavigator();

const generateAppointments = () => {
  const appointments = [];
  const baseDate = new Date('2023-06-01');
  
  for (let i = 0; i < 50; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    const category = Math.random() > 0.5 ? 'psychology' : 'nutrition';

    appointments.push({
      id: i + 1,
      title: `Consulta ${category === 'psychology' ? 'de Psicología' : 'de Nutrición'} ${i + 1}`,
      date: date.toISOString().split('T')[0],
      category: category,
    });
  }

  return appointments;
};

const HomeUser = () => {
  const [user, setUser] = useState({ name: 'Juan' });
  const [appointments, setAppointments] = useState(generateAppointments());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const PsychologyScreen = () => (
    <View style={styles.headerPsicologia}>
      <Header userName={user.name} screenName={'Psicología'} />
      <View style={styles.container}>
        <AppointmentList 
          appointments={appointments.filter(app => app.category === 'psychology')} 
          onSelectAppointment={handleSelectAppointment}
        />
      </View>
    </View>
  );

  const NutritionScreen = () => (
    <View style={styles.headerNutricion}>
      <Header userName={user.name} screenName={'Nutrición'} />
      <View style={styles.container}>
        <AppointmentList 
          appointments={appointments.filter(app => app.category === 'nutrition')} 
          onSelectAppointment={handleSelectAppointment}
        />
      </View>
    </View>
  );

  return (
    <>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Psicología') {
              iconName = focused ? 'brain' : 'brain';
              return <FontAwesome5 name={iconName} size={size} color={color} />;
            } else if (route.name === 'Nutrición') {
              iconName = focused ? 'nutrition' : 'nutrition-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            }
            return null;
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: Colors.SECONDARYCOLOR,
          tabBarStyle: Platform.OS === 'web' ? styles.webTabBar : styles.mobileTabBar, // Estilos condicionales
          tabBarLabelStyle: styles.tabBarLabel,
        })}
      >
        <Tab.Screen name="Psicología" component={PsychologyScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Nutrición" component={NutritionScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

// Estilos condicionales
const styles = StyleSheet.create({
  headerPsicologia: {
    paddingTop: '10%',
    flex: 1,
    backgroundColor: Colors.PSICOLOGIA,
  },
  headerNutricion: {
    paddingTop: '10%',
    flex: 1,
    backgroundColor: Colors.NUTRICIÓN,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: 0,
  },
  webTabBar: {
    backgroundColor: Colors.BACKGROUND,
    borderTopWidth: 0,
    paddingTop: 5,
    height: '10%',
  },
  mobileTabBar: {
    backgroundColor: Colors.BACKGROUND,
    borderTopWidth: 0,
    paddingTop: 5,
    height: '9%',
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeUser;
