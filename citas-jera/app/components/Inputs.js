"use client"

import { forwardRef, useEffect, useRef, useState } from "react"
import { Animated, StyleSheet, View, TextInput, TouchableOpacity, Platform } from "react-native"
import Colors from "@styles/colors.js"
import FontAwesome from "react-native-vector-icons/FontAwesome"

const Input = forwardRef(({ title = "", icon = "", handleAction = () => {}, ...rest }, ref) => {
  const animatedValues = {
    animation: useRef(new Animated.Value(0)).current,
  }

  const { animation } = animatedValues

  const [initialState, setInitialState] = useState({
    value: "",
    focus: false,
  })

  const { value, focus } = initialState

  useEffect(() => {
    handleAnimated()
  }, [focus, value])

  const handleAnimated = () => {
    Animated.timing(animation, {
      toValue: focus || value !== "" ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const animatedStyles = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
          extrapolate: "clamp",
        }),
      },
    ],
  }

  const handleFocus = () => {
    setInitialState({ ...initialState, focus: true })
  }

  const handleBlur = () => {
    if (value.trim() === "") {
      setInitialState({ ...initialState, focus: false })
    }
  }

  useEffect(() => {
    if (ref) {
      ref.current = {
        getValue: () => value, // Devuelve el valor actual
      }
    }
  }, [ref, value])

  return (
    <View style={[styles.inputContainer, { borderColor: focus ? Colors.SECONDARYCOLOR : "#E0E0E0" }]}>
      <TextInput
        value={value}
        style={[styles.input, { outlineStyle: "none" }]}
        selectionColor={Colors.SECONDARYCOLOR}
        autoCapitalize={"none"}
        onChangeText={(text) => setInitialState({ ...initialState, value: text })}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={Colors.ACCENT}
        {...rest}
      />
      {icon && (
        <TouchableOpacity onPress={handleAction} style={styles.iconContainer}>
          <FontAwesome name={icon} size={18} color={Colors.SECONDARYCOLOR} />
        </TouchableOpacity>
      )}
      <Animated.View style={[styles.titleBox, animatedStyles]} pointerEvents={"none"}>
        <Animated.Text style={[styles.title, { color: focus || value ? Colors.SECONDARYCOLOR : Colors.TEXT }]}>
          {title}
        </Animated.Text>
      </Animated.View>
    </View>
  )
})

const styles = StyleSheet.create({
  inputContainer: {
    height: 60,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND,
    borderWidth: 1.5,
    // El color del borde ahora se aplica condicionalmente en el componente
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: "row",
    // Sombras más sutiles y profesionales
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        transition: "all 0.2s ease",
      },
    }),
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    color: Colors.PRIMARYCOLOR,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    // Eliminamos el borde resaltado en navegadores web
    outlineWidth: 0,
    outlineStyle: "none",
    outlineColor: "transparent",
  },
  iconContainer: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22.5,
    backgroundColor: Colors.BACKGROUND,
    marginRight: 10,
  },
  titleBox: {
    height: "auto",
    width: "auto",
    paddingHorizontal: 2,
    paddingVertical: 0.5,
    backgroundColor: Colors.BACKGROUND,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    left: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.TEXT,
  },
})

export default Input

