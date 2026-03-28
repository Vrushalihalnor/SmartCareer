import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

type ModuleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Module">;

const Module = () => {
  const navigation = useNavigation<ModuleScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as { userId?: number; name?: string; email?: string };

  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load userId
        if (params?.userId) {
          setUserId(params.userId);
          await AsyncStorage.setItem("userId", params.userId.toString());
        } else {
          const savedId = await AsyncStorage.getItem("userId");
          if (savedId) setUserId(parseInt(savedId, 10));
        }

        // Load name
        if (params?.name) {
          setName(params.name);
          await AsyncStorage.setItem("userName", params.name);
        } else {
          const savedName = await AsyncStorage.getItem("userName");
          if (savedName) setName(savedName);
        }

        // Load email
        if (params?.email) {
          setEmail(params.email);
          await AsyncStorage.setItem("userEmail", params.email);
        } else {
          const savedEmail = await AsyncStorage.getItem("userEmail");
          if (savedEmail) setEmail(savedEmail);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const modules = [
    {
      title: "Test",
      description: "Access and attempt your assessments.",
      color: "#B3E5FC",
      navigateTo: "Test",
    },
    {
      title: "Report",
      description: "View your performance and progress reports.",
      color: "#C8E6C9",
      navigateTo: "Report",
    },
  ];

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.navigate("Login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading your details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>SmartCareer</Text>
      <Text style={styles.subHeader}>Welcome, {name || "User"}</Text>

      <View style={styles.grid}>
        {modules.map((mod, index) => (
          <View key={index} style={[styles.card, { backgroundColor: mod.color }]}>
            <Text style={styles.title}>{mod.title}</Text>
            <Text style={styles.description}>{mod.description}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate(mod.navigateTo as keyof RootStackParamList, {
                  userId,
                  name,
                  email,
                })
              }
            >
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Module;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#E6F7FF",
  },
  header: { fontSize: 24, fontWeight: "bold", color: "#1E90FF", marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: "600", marginBottom: 30 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", width: "100%" },
  card: {
    width: "98%",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 5, color: "#000" },
  description: { fontSize: 13, color: "#444", marginBottom: 10 },
  button: { backgroundColor: "#1E90FF", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  logoutButton: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 40,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
