import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@styles/colors.js'

const Header = ({header_text}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{header_text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 15,
    paddingVertical: 20
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.PRIMARYCOLOR
  },
});

export default Header;
