import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  BackHandler,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

type Question = {
  question: string;
  options: string[];
};

type RouteParams = {
  userId: number;
  name?: string;
  email?: string;
};

const TestScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [mcqQuestions, setMcqQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // ✅ Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        navigation.navigate("module");
        return true;
      });
      return () => backHandler.remove();
    }, [navigation])
  );

  // ✅ Load userId, name, email from route params
  useEffect(() => {
    if (params) {
      setUserId(params.userId);
      setName(params.name || "");
      setEmail(params.email || "");
    }
  }, [params]);

  // ✅ Fetch questions (use userId if needed for API)
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!userId) return;
      try {
        // Example API using userId to fetch personalized questions
        const res = await fetch(`http://192.168.137.1:5000/generate-questions/${userId}`);
        const data = await res.json();

        if (data.success && data.questions) {
          setMcqQuestions(data.questions.mcq_questions || []);
        } else {
          Alert.alert("Error", "Failed to load questions from server.");
        }
      } catch (err) {
        console.error("❌ Error fetching questions:", err);
        Alert.alert("Network Error", "Could not connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [userId]);

  // ✅ Handle MCQ selection
  const handleMCQSelect = (index: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [`mcq_${index}`]: option }));
  };

  // ✅ Submit test
  const handleSubmit = () => {
    if (!userId) return;

    const allAnswered = mcqQuestions.every((_, idx) => answers[`mcq_${idx}`]);
    if (!allAnswered) {
      Alert.alert("Incomplete", "Please answer all questions before submitting.");
      return;
    }

    const formattedAnswers = mcqQuestions.map((q, i) => ({
      question_id: i + 1,
      selected_option: answers[`mcq_${i}`],
    }));

    console.log("✅ Sending Answers:", { userId, formattedAnswers });

    navigation.navigate("Report", { userId, name, email, answers: formattedAnswers });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading questions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("module")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>🧠 Test</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {mcqQuestions.map((q, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {q.question}
            </Text>
            {q.options.map((opt, i) => {
              const selected = answers[`mcq_${index}`] === opt;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionButton, selected && styles.selectedOption]}
                  onPress={() => handleMCQSelect(index, opt)}
                >
                  <Text style={[styles.optionText, selected && styles.selectedText]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Test</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TestScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F7FF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: {
    height: 80,
    paddingTop: 40,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: "bold", marginLeft: 10 },
  scrollContainer: { paddingHorizontal: 15 },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  questionText: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: { backgroundColor: "#D6E4FF", borderColor: "#007BFF" },
  optionText: { fontSize: 15 },
  selectedText: { color: "#007BFF", fontWeight: "600" },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    margin: 20,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
