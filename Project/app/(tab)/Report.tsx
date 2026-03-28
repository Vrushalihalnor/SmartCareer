import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CareerSuggestion {
  title: string;
  reason: string;
}

interface Report {
  career_suggestions: CareerSuggestion[];
  interest_areas: string[];
  personality_summary: string;
  skills_to_develop: string[];
}

interface Answer {
  question_id: number;
  selected_option: string;
}

interface RouteParams {
  name: string;
  email: string;
  answers: Answer[];
}

const ReportScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { name, email, answers } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        navigation.navigate("module", { name, email });
        return true;
      });
      return () => backHandler.remove();
    }, [navigation, name, email])
  );

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`http://192.168.137.1:5000/api/predict/${email}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });

        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error("Invalid JSON returned by server"); }

        if (data.success && data.report) setReport(data.report);
        else Alert.alert("Error", data.message || "Failed to load report.");
      } catch (error) {
        console.error("Fetch Report Error:", error);
        Alert.alert("Network Error", "Could not connect to the server.");
      } finally { setLoading(false); }
    };

    fetchReport();
  }, [email, answers]);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Generating your career report...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No report data available.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F9FF" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.headerTitle}>🎯 Career Prediction Report</Text>
        <Text style={styles.subtitle}>Based on your test answers</Text>

        {/* Career Suggestions */}
        <Text style={styles.sectionTitle}>Top 3 Career Suggestions for {name}</Text>
        {report.career_suggestions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.careerBox, expandedIndex === index && { backgroundColor: "#E8F0FF" }]}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.8}
          >
            <View style={styles.careerHeader}>
              <Text style={styles.careerTitle}>{index + 1}. {item.title}</Text>
              <Ionicons name={expandedIndex === index ? "chevron-up" : "chevron-down"} size={22} color="#007BFF" />
            </View>
            {expandedIndex === index && (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>{item.reason}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Interest Areas */}
        <Text style={styles.sectionTitle}>Interest Areas for {name}</Text>
        <View style={styles.interestContainer}>
          {report.interest_areas.map((area, i) => (
            <View key={i} style={styles.interestTag}>
              <Text style={styles.interestText}>{area}</Text>
            </View>
          ))}
        </View>

        {/* Personality Summary */}
        <Text style={styles.sectionTitle}>Personality Summary of {name}</Text>
        <View style={styles.personalityBox}>
          <Text style={styles.personalityText}>{report.personality_summary}</Text>
        </View>

        {/* Skills to Develop */}
        <Text style={styles.sectionTitle}>Skills to Develop for {name}</Text>
        <View style={styles.skillsContainer}>
          {report.skills_to_develop.map((skill, i) => (
            <View key={i} style={styles.skillItem}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F9FF", padding: 20, paddingTop: 70, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1E3A8A", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#555", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 10, marginTop: 20 },
  careerBox: { backgroundColor: "#fff", borderRadius: 10, padding: 15, marginBottom: 10, elevation: 2 },
  careerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  careerTitle: { fontSize: 16, fontWeight: "600", color: "#007BFF" },
  reasonBox: { marginTop: 8 },
  reasonText: { fontSize: 14, color: "#444", lineHeight: 20 },
  interestContainer: { flexDirection: "row", flexWrap: "wrap" },
  interestTag: { backgroundColor: "#E3F2FD", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, margin: 4 },
  interestText: { color: "#007BFF", fontWeight: "500" },
  personalityBox: { backgroundColor: "#FFF8E1", padding: 15, borderRadius: 10 },
  personalityText: { fontSize: 14, color: "#5D4037" },
  skillsContainer: { backgroundColor: "#E8F5E9", borderRadius: 10, padding: 15, marginBottom: 25 },
  skillItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  skillText: { marginLeft: 10, color: "#2E7D32", fontSize: 15 },
});
