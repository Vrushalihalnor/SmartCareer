import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  module: { userId: number };
};

const Register = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [std, setStd] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [interest1, setInterest1] = useState("");
  const [interest2, setInterest2] = useState("");
  const [interest3, setInterest3] = useState("");

  const subjectOptions: Record<string, string[]> = {
    "6-10": ["Math", "Science", "Drawing", "English", "Storytelling", "Crafts"],
    "10-15": ["Math", "Science", "Computer Basics", "English", "Art", "Sports", "History"],
    "15-20": ["Physics", "Chemistry", "Biology", "Programming", "Music", "Psychology", "Design", "Entrepreneurship"],
    "18-25": ["Artificial Intelligence", "Web Development", "Data Science", "Music Technology", "Marketing", "Finance", "Graphic Design", "Cybersecurity"],
    "20-25": ["AI", "Machine Learning", "Cloud Computing", "Digital Art", "Business Analytics", "Music Production", "Film Making", "UX/UI Design"],
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !dob || !std || !ageGroup) {
      Alert.alert("Error", "Please fill all required fields!");
      return;
    }
    if (!interest1 || !interest2 || !interest3) {
      Alert.alert("Error", "Please select 3 interests!");
      return;
    }

    try {
      const response = await fetch("http://192.168.137.1:3300/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, std, password, dob, interest1, interest2, interest3, age_group: ageGroup }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", `Registration successful! User ID: ${data.userId || "N/A"}`);
        
        // Navigate to module with userId only
        navigation.navigate("Login", { userId: data.userId });
      } else {
        Alert.alert("Error", data.error || "Registration failed!");
      }
    } catch (err: any) {
      Alert.alert("Network Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Registration</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="DOB (YYYY-MM-DD)" value={dob} onChangeText={setDob} />
      <TextInput style={styles.input} placeholder="Standard" value={std} onChangeText={setStd} />

      <View style={styles.pickerContainer}>
        <Picker selectedValue={ageGroup} onValueChange={(val) => { setAgeGroup(val); setInterest1(""); setInterest2(""); setInterest3(""); }}>
          <Picker.Item label="Select age group" value="" />
          <Picker.Item label="6-10 years" value="6-10" />
          <Picker.Item label="10-15 years" value="10-15" />
          <Picker.Item label="15-20 years" value="15-20" />
          <Picker.Item label="18-25 years" value="18-25" />
          <Picker.Item label="20-25 years" value="20-25" />
        </Picker>
      </View>

      {ageGroup && [0, 1, 2].map((i) => (
        <View key={i} style={styles.pickerContainer}>
          <Picker
            selectedValue={i === 0 ? interest1 : i === 1 ? interest2 : interest3}
            onValueChange={(val) => i === 0 ? setInterest1(val) : i === 1 ? setInterest2(val) : setInterest3(val)}
          >
            <Picker.Item label={`Select Interest ${i + 1}`} value="" />
            {subjectOptions[ageGroup].map((subj, idx) => <Picker.Item key={idx} label={subj} value={subj} />)}
          </Picker>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F7FF", alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#0066CC", marginBottom: 30 },
  input: { width: "100%", height: 45, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderColor: "#ccc", borderWidth: 1 },
  pickerContainer: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 15, backgroundColor: "#fff" },
  button: { backgroundColor: "#007BFF", paddingVertical: 12, borderRadius: 8, width: "100%", marginTop: 10 },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "bold" },
});
