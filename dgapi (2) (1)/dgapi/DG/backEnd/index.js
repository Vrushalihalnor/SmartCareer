// // backend/index.js
// import express from "express";
// import cors from "cors";
// import mysql from "mysql2/promise";
// import dotenv from "dotenv";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ MySQL Connection Pool
// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "210405",
//   database: "dg",
// });

// // ✅ Test Database Connection
// try {
//   const conn = await db.getConnection();
//   console.log("✅ Database connected successfully!");
//   conn.release();
// } catch (err) {
//   console.error("❌ Database connection failed:", err.message);
// }

// // ✅ Gemini API setup
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // ✅ Helper: Clean AI response
// function cleanAIResponse(rawText) {
//   let text = rawText.trim();
//   text = text.replace(/^json\s*/i, ""); // Remove leading 'json'
//   text = text.replace(/```json|```/gi, ""); // Remove code blocks
//   text = text.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
//   return text.trim();
// }

// // ✅ Endpoint: Generate structured quiz questions
// app.get("/api/generate-questions/:email", async (req, res) => {
//   try {
//     const { email } = req.params;

//     // Fetch user data
//     const [rows] = await db.query(
//       "SELECT interest1, interest2, interest3, dob, age_group FROM users WHERE email = ?",
//       [email]
//     );

//     if (!rows.length) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const user = rows[0];
//     const dob = new Date(user.dob);
//     const age = new Date().getFullYear() - dob.getFullYear();

//     const userInfo = `User has interests in ${user.interest1}, ${user.interest2}, ${user.interest3}, belongs to age group ${user.age_group}, and is ${age} years old.`;

//     // Gemini model
//     const model = genAI.getGenerativeModel({
//       model: "models/gemini-2.5-flash-lite",
//     });

//     // Prompt for 14 MCQs + 1 long question
//     const prompt = `
// You are an expert in psychological assessments and career guidance.

// Generate **15 questions** based on this user information: ${userInfo}.

// Requirements:
// 1. Generate **14 multiple-choice questions (MCQs)** where all options are valid. The user selects based on their interest or preference.
// 2. Generate **1 long descriptive question** for reflection or explanation.
// 3. Format the output strictly as JSON with this structure:

// {
//   "mcq_questions": [
//     {
//       "question": "Question text here",
//       "options": ["Option A", "Option B", "Option C", "Option D"],
//       "answer": "All options are correct; user selects based on preference"
//     }
//   ],
//   "long_question": {
//     "question": "Long descriptive question here",
//     "answer": "Expected answer is open-ended for reflection"
//   }
// }

// Make sure the questions are personalized to the user's interests and age group.
// `;

//     const result = await model.generateContent(prompt);
//     const questionsText = cleanAIResponse(result.response.text());

//     let questionsJSON;
//     try {
//       questionsJSON = JSON.parse(questionsText);
//     } catch (parseError) {
//       return res.status(500).json({
//         success: false,
//         message: "Invalid JSON from Gemini model",
//         raw: questionsText,
//       });
//     }

//     res.json({ success: true, questions: questionsJSON });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// });

// // ✅ Endpoint: Predict career & personality based on user answers
// app.post("/api/predict/:email", async (req, res) => {
//   try {
//     const { email } = req.params;
//     const answers = req.body.answers;

//     if (!Array.isArray(answers) || answers.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Please provide answers array" });
//     }

//     // Get user info
//     const [userRows] = await db.query(
//       "SELECT user_id, interest1, interest2, interest3, dob, age_group FROM users WHERE email = ?",
//       [email]
//     );

//     if (!userRows.length) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     const user = userRows[0];
//     const user_id = user.user_id;
//     const dob = new Date(user.dob);
//     const age = new Date().getFullYear() - dob.getFullYear();

//     const userInfo = `User has interests in ${user.interest1}, ${user.interest2}, ${user.interest3}, belongs to age group ${user.age_group}, and is ${age} years old.`;

//     const answersSummary = answers
//       .map((a, i) => `${i + 1}. ${a.question_id}: ${a.selected_option}`)
//       .join("\n");

//     // Gemini Prompt for career prediction
//     const prompt = `
// You are an expert career counselor and psychologist.
// Based on the following user information and selected answers, predict the user's career interests and personality traits only 3.

// User Info:
// ${userInfo}

// Selected Answers:
// ${answersSummary}

// Return a JSON object with this exact structure:
// {
//   "career_suggestions": [
//     {"title": "Career Name", "reason": "Why this career fits the user"}
//   ],
//   "interest_areas": ["List of top interests"],
//   "personality_summary": "Short summary of user's personality",
//   "skills_to_develop": ["Skill 1", "Skill 2", "Skill 3"]
// }

// Make sure your response is strictly valid JSON (no markdown, no text outside the JSON).
// `;

//     const model = genAI.getGenerativeModel({
//       model: "models/gemini-2.5-flash-lite",
//     });
//     const result = await model.generateContent(prompt);

//     let text = cleanAIResponse(result.response.text());

//     let prediction;
//     try {
//       prediction = JSON.parse(text);
//     } catch (err) {
//       console.error("⚠ JSON parse failed, raw text:", text);
//       return res.status(500).json({
//         success: false,
//         message: "Invalid JSON from Gemini model",
//         raw: text,
//       });
//     }

//     // Save report in DB
//     const summary = (prediction.career_suggestions || [])
//       .map((c) => c.title)
//       .join(", ")
//       .slice(0, 100);

//     await db.query(
//       "INSERT INTO reports (user_id, report_json, summary) VALUES (?, ?, ?)",
//       [user_id, JSON.stringify(prediction), summary]
//     );

//     res.json({
//       success: true,
//       message: "Career and interest prediction generated successfully",
//       report: prediction,
//     });
//   } catch (error) {
//     console.error("❌ Prediction error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// });

// // ✅ Start server
// const PORT = 5000;
// app.listen(PORT, () =>
//   console.log(`🚀 Server running successfully on port ${PORT}`)
// );
import dotenv from "dotenv";
dotenv.config(); // ✅ MUST BE FIRST

import express from "express";
import cors from "cors";
import generateQuestions from "./routes/generateQuestions.js";
import predictCareer from "./routes/predictCareer.js";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ DEBUG (check API key)
console.log("API KEY:", process.env.GEMINI_API_KEY);

// ✅ Test DB connection
try {
  const conn = await db.getConnection();
  console.log("✅ MySQL connected successfully!");
  conn.release();
} catch (err) {
  console.error("❌ DB Connection Error:", err.message);
}

// Routes
app.use("/generate-questions", generateQuestions);
app.use("/api/predict", predictCareer);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});