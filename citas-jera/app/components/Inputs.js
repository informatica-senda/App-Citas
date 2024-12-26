import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import Colors from '@styles/colors.js';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Input = forwardRef(({ title = '', icon = '', handleAction = () => {}, ...rest }, ref) => {
  const animatedValues = {
    animation: useRef(new Animated.Value(0)).current,
  };

  const { animation } = animatedValues;

  const [initialState, setInitialState] = useState({
    value: '',
    focus: false,
  });

  const { value, focus } = initialState;

  useEffect(() => {
    handleAnimated();
  }, [focus, value]);

  const handleAnimated = () => {
    // Si el valor está vacío y no está enfocado, la animación se resetea
    // Si tiene texto, se mantiene animado, sin importar el foco
    Animated.timing(animation, {
      toValue: focus || value !== '' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyles = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const handleFocus = () => {
    setInitialState({ ...initialState, focus: true });
  };

  const handleBlur = () => {
    // Solo se cambia el foco si el valor está vacío
    if (value.trim() === '') {
      setInitialState({ ...initialState, focus: false });
    }
  };

  return (
    <View style={[styles.inputContainer]}>
      <TextInput
        ref={ref}
        value={value}
        style={[styles.input]}
        selectionColor={Colors.SECONDARYCOLOR}
        autoCapitalize={'none'}
        onChangeText={(text) => setInitialState({ ...initialState, value: text })}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={Colors.GRAY}
        {...rest}
      />
      {icon && (
        <TouchableOpacity onPress={handleAction} style={styles.iconContainer}>
          <FontAwesome name={icon} size={18} color={Colors.SECONDARYCOLOR} />
        </TouchableOpacity>
      )}
      <Animated.View style={[styles.titleBox, animatedStyles]} pointerEvents={'none'}>
        <Animated.Text style={[styles.title, { color: focus || value ? Colors.SECONDARYCOLOR : Colors.GRAY }]}>
          {title}
        </Animated.Text>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    height: 60,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITEBACKGROUND,
    borderWidth: 1.5,
    borderColor: Colors.SECONDARYCOLOR,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
    color: Colors.PRIMARYCOLOR,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  iconContainer: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22.5,
    backgroundColor: Colors.LIGHTGRAY,
    marginRight: 10,
  },
  titleBox: {
    height: 'auto',
    width: 'auto',
    paddingHorizontal: 2,
    paddingVertical: 0.5,
    backgroundColor: Colors.WHITEBACKGROUND,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.SECONDARYCOLOR,
  },
});

export default Input;
