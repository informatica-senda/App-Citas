import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@styles/colors.js'

/* The `const Header =` statement is defining a functional component named `Header`. This component
takes in two props, `userName` and `screenName`, and returns a JSX element that displays a header
with the provided user and screen names. The component is defined using an arrow function syntax
and is exported as the default export of the file. */

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
