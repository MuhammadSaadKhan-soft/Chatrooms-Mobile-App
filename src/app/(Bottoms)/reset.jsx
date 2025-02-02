import React, { useEffect, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ImageBackground, Platform } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native"
import { AxiosRequest } from "../Axios/AxiosRequest"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { navigationRef } from "../_layout"
import { BlurView } from "@react-native-community/blur"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { Formik } from "formik"
import * as Yup from "yup"

const ResetPassword = (props) => {
  const navigation = useNavigation()
  const formikRef = useRef(null)

  useEffect(() => {
    const getEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("Email")
      return storedEmail
    }

    getEmail().then((email) => {
      if (email) {
        formikRef.current?.setFieldValue("email", email)
      }
    })
  }, [])

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    code: Yup.string().required("Reset code is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("New password is required"),
  })

  const onSubmit = async (values) => {
    const email = await AsyncStorage.getItem("Email")
    if (!email) {
      Alert.alert("Error", "Email is not available.")
      return
    }

    try {
      const response = await AxiosRequest.post("/api/auth/reset-password", {
        email,
        code: values.code,
        newPassword: values.newPassword,
      })
      const data = response.data

      if (data.status === "success") {
        Alert.alert("Success", data.message)
        await AsyncStorage.removeItem("Email")
        await AsyncStorage.removeItem("authToken")
        await AsyncStorage.setItem("tempNewPassword", values.newPassword)
        navigation.navigate("login")
      } else {
        Alert.alert("Error", data.message || "An error occurred.")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      Alert.alert("Error", "An unexpected error occurred. Please try again later.")
    }
  }

  const ContainerBackground = Platform.OS === "ios" ? BlurView : View

  return (
    <ImageBackground
      source={require("../../images/chats.png")}
      style={styles.background}
      imageStyle={{ resizeMode: "cover" }}
    >
      <ContainerBackground
        style={styles.blurContainer}
        blurType={props.mode === "dark" ? "dark" : "light"}
        blurAmount={10}
        reducedTransparencyFallbackColor={props.mode === "dark" ? "black" : "white"}
      >
        <Formik
          innerRef={formikRef}
          initialValues={{ email: "", code: "", newPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.formContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate("(Bottoms)", { screen: "login" })}
              >
                <FontAwesomeIcon icon={faArrowLeft} size={24} color="white" />
              </TouchableOpacity>
              <Text style={[styles.heading, { color: props.mode === "dark" ? "white" : "black" }]}>Reset Password</Text>

              <View style={styles.formGroup}>
                <Icon
                  name="envelope"
                  style={[styles.inputIcon, { color: props.mode === "dark" ? "white" : "black" }]}
                />
                <TextInput
                  style={[styles.input, { color: props.mode === "dark" ? "white" : "black" }]}
                  placeholder="Enter your email"
                  placeholderTextColor="#B0B0B0"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  editable={false}
                />
                {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Icon name="key" style={[styles.inputIcon, { color: props.mode === "dark" ? "white" : "black" }]} />
                <TextInput
                  style={[styles.input, { color: props.mode === "dark" ? "white" : "black" }]}
                  placeholder="Enter your reset code"
                  placeholderTextColor="#B0B0B0"
                  value={values.code}
                  onChangeText={handleChange("code")}
                  onBlur={handleBlur("code")}
                />
                {touched.code && errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Icon name="lock" style={[styles.inputIcon, { color: props.mode === "dark" ? "white" : "black" }]} />
                <TextInput
                  style={[styles.input, { color: props.mode === "dark" ? "white" : "black" }]}
                  placeholder="Enter your new password"
                  placeholderTextColor="#B0B0B0"
                  value={values.newPassword}
                  onChangeText={handleChange("newPassword")}
                  onBlur={handleBlur("newPassword")}
                  secureTextEntry
                />
                {touched.newPassword && errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                <Text style={[styles.buttonText, { color: props.mode === "dark" ? "black" : "white" }]}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ContainerBackground>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurContainer: {
    width: "90%",
    borderRadius: 20,
    overflow: "hidden",
  },
  formContainer: {
    width: "100%",
    padding: 30,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  heading: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  formGroup: {
    position: "relative",
    marginBottom: 20,
  },
  input: {
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#444857",
    borderRadius: 8,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "#3a3f51",
    paddingLeft: 40,
  },
  inputIcon: {
    position: "absolute",
    left: 10,
    top: 15,
    fontSize: 20,
  },
  button: {
    backgroundColor: "#6200EE",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 5,
  },
})

export default ResetPassword

