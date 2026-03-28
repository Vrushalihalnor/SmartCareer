import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Index = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/DGlogo.jpeg")} // make sure the logo is in the same folder
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to SmartCareer!</Text>
      <Text style={styles.subtitle}>Your journey starts here.</Text>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => navigation.navigate("register")}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E6F7FF",
  },
 logo: {
  width: 150,
  height: 150,
  borderRadius: 75, // circular
  marginBottom: 30,
  // Shadow for iOS
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.8,
  shadowRadius: 4,
  // Shadow for Android
  elevation: 20,
}

,
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: "#007BFF",
  },
  loginButton: {
    backgroundColor: "#007BFF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
