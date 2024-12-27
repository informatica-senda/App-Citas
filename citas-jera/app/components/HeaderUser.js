import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@styles/colors.js'

const Header = ({ userName, screenName }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.screenName}>Servicio de {screenName}</Text>
      <Text style={styles.headerText}>Bienvenido, {userName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    
    padding: 15,
    margin: 0,
  },
  screenName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.TEXTWHITE
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'normal',
    color: Colors.TEXTWHITE
  },
});

export default Header;
