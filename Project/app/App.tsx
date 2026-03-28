// Login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

// Navigation type
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://192.168.1.110:3300/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login API Response:", data);

      // Adjust according to your backend response structure
      if (data.user || data.success) {
        Alert.alert("✅ Success", "Login successful!");

        // Navigate to Module screen (capital M!)
        navigation.navigate("Module", {
          email,
          password,
        });
      } else {
        Alert.alert("Error", data.error || data.message || "Invalid email or password!");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DreamsGuider Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.registerText}>
          Don’t have an account? <Text style={styles.linkText}>Register here</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 25, backgroundColor: "#E6F7FF" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 35, color: "#007BFF" },
  input: { borderWidth: 1, borderColor: "#B0C4DE", borderRadius: 12, padding: 14, marginBottom: 15, backgroundColor: "#fff", fontSize: 16 },
  button: { backgroundColor: "#007BFF", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  registerLink: { marginTop: 25, alignItems: "center" },
  registerText: { color: "#333", fontSize: 14 },
  linkText: { color: "#007BFF", fontWeight: "bold" },
});
