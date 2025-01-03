import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import Header from '@components/HeaderUser';
import AppointmentModal from '@components/AppointmentModal';
import Colors from '@styles/colors';
import LoginScreen from '../login';


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

// Función para formatear la fecha en formato dd/mm/yyyy
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0'); // Añadir 0 si es un solo dígito
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes comienza desde 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};


const HomeUser = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({ name: 'Juan' });
  const [appointments, setAppointments] = useState(generateAppointments());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [psychologyMarkedDates, setPsychologyMarkedDates] = useState({});
  const [nutritionMarkedDates, setNutritionMarkedDates] = useState({});

  useEffect(() => {
    const psychologyMarked = {};
    const nutritionMarked = {};
    appointments.forEach(appointment => {
      if (appointment.category === 'psychology') {
        psychologyMarked[appointment.date] = { marked: true, dotColor: Colors.PSICOLOGIA };
      } else {
        nutritionMarked[appointment.date] = { marked: true, dotColor: Colors.NUTRICIÓN };
      }
    });
    setPsychologyMarkedDates(psychologyMarked);
    setNutritionMarkedDates(nutritionMarked);
  }, [appointments]);

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const renderAppointmentsForSelectedDate = (category) => {
    const appointmentsForDay = appointments.filter(a => a.date === selectedDate && a.category === category);
    const today = new Date().toISOString().split('T')[0];
    return (
      <View style={styles.appointmentsList}>
        <Text style={styles.selectedDateText}>
          {selectedDate === today ? `Citas para hoy` : `Citas para ${formatDate(new Date(selectedDate))}`}
        </Text>
        {appointmentsForDay.length > 0 ? (
          appointmentsForDay.map(appointment => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentItem}
              onPress={() => handleSelectAppointment(appointment)}
            >
              <Text style={styles.appointmentText}>{appointment.title}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noAppointmentsText}>No hay citas para esta fecha</Text>
        )}
      </View>
    );
  };

  const CalendarScreen = ({ category }) => {
    const markedDates = category === 'psychology' ? psychologyMarkedDates : nutritionMarkedDates;

    return (
      <View style={styles[`header${category}`]}>
        <Header userName={user.name} screenName={category === 'psychology' ? 'Psicología' : 'Nutrición'} />
        <View style={styles.container}>
          <TouchableOpacity style={styles[`button${category}`]} title='Hoy' onPress={() => {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(today);
          }} >
            <Text style={styles.text}>Hoy</Text>
          </TouchableOpacity>

          <Calendar
            current={selectedDate || new Date().toISOString().split('T')[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...(markedDates[selectedDate] || {}),
                selected: true,
                selectedColor: Colors[category.toUpperCase()],
              }
            }}
            theme={{
              backgroundColor: Colors.BACKGROUND,
              calendarBackground: Colors.BACKGROUND,
              textSectionTitleColor: Colors.TEXT,
              selectedDayBackgroundColor: Colors[category.toUpperCase()],
              selectedDayTextColor: Colors.PRIMARYCOLOR,
              todayTextColor: Colors[category.toUpperCase()],
              dayTextColor: Colors.TEXT,
              textDisabledColor: '#d9e1e8',
              dotColor: Colors[category.toUpperCase()],
              selectedDotColor: Colors.TEXTWHITE,
              arrowColor: Colors[category.toUpperCase()],
              monthTextColor: Colors.TEXT,
              indicatorColor: Colors[category.toUpperCase()],
            }}
          />
          {selectedDate && renderAppointmentsForSelectedDate(category)}
        </View>
      </View>
    );
  };

  const PsychologyScreen = () => <CalendarScreen category="psychology" />;
  const NutritionScreen = () => <CalendarScreen category="nutrition" />;

  const HandleLogOut = ({ navigation }) => {
    useEffect(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    }, [navigation]); // El efecto solo se ejecuta cuando el objeto `navigation` cambia
  
    return null; // No se necesita ningún render en este componente
  };

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
            } else if (route.name === 'Exit') {
              iconName = focused ? 'exit' : 'exit-outline';
              return <Ionicons name={iconName} size={size} color={color} />;}
            return null;
          },
          tabBarActiveTintColor: Colors.PRIMARYCOLOR,
          tabBarInactiveTintColor: Colors.SECONDARYCOLOR,
          tabBarStyle: Platform.OS === 'web' ? styles.webTabBar : styles.mobileTabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        })}
      >
        <Tab.Screen name="Psicología" component={PsychologyScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Nutrición" component={NutritionScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Exit" component={HandleLogOut} options={{ headerShown: false }} />
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


const styles = StyleSheet.create({
  headerpsychology: {
    paddingTop: '10%',
    flex: 1,
    backgroundColor: Colors.PSICOLOGIA,
  },
  buttonpsychology:{
    backgroundColor: Colors.PSICOLOGIA,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
    },
    buttonnutrition:{
      backgroundColor: Colors.NUTRICIÓN,
      padding: 10,
      borderRadius: 8,
      marginBottom: 10
      },
    text:{
    color: Colors.TEXTWHITE,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
    },
  headernutrition: {
    paddingTop: '10%',
    flex: 1,
    backgroundColor: Colors.NUTRICIÓN,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: 10,
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
    backgroundColor: Colors.TEXTWHITE,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  appointmentText: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: Colors.TEXT,
    fontStyle: 'italic',
  },
});

export default HomeUser;

