// import express from "express";
// import db from "../db.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const router = express.Router();
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// function cleanAIResponse(text) {
//   return text.replace(/```json|```/g, "").trim();
// }

// router.get("/:email", async (req, res) => {
//   try {
//     const { email } = req.params;

//     const [rows] = await db.query(
//       "SELECT `interest1`, `interest2`, `interest3`, `dob`, `age_group` FROM users WHERE email = ?",
//       [email]
//     );

//     if (!rows.length) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const user = rows[0];
//     const dob = new Date(user.dob);
//     const age = new Date().getFullYear() - dob.getFullYear();

//     const userInfo = `User has interests in ${user.interest1}, ${user.interest2}, ${user.interest3}, belongs to age group ${user.age_group}, and is ${age} years old.`;

//     const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });

//     const prompt = `
// You are an expert in psychological assessments and career guidance.

// Generate **15 questions** based on this user information: ${userInfo}.

// Requirements:
// 1. Generate **14 multiple-choice questions (MCQs)** where all options are valid.
// 2. Generate **1 long descriptive question** for reflection.
// 3. Format strictly as JSON:
// {
//   "mcq_questions": [
//     {
//       "question": "Question text",
//       "options": ["A", "B", "C", "D"],
//       "answer": "All options are correct"
//     }
//   ],
//   "long_question": {
//     "question": "Long question here",
//     "answer": "Open-ended"
//   }
// }`;

//     const result = await model.generateContent(prompt);
//     const text = cleanAIResponse(result.response.text());

//     let questionsJSON;
//     try {
//       questionsJSON = JSON.parse(text);
//     } catch {
//       return res.status(500).json({ success: false, message: "Invalid JSON from Gemini", raw: text });
//     }

//     res.json({ success: true, questions: questionsJSON });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// });

import express from "express";
import { db } from "../db.js";
import { genAI, cleanAIResponse } from "../gemini.js";

const router = express.Router();

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await db.query(
      "SELECT interest1, interest2, interest3, dob, age_group FROM users WHERE user_id = ?",
      [user_id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];
    const dob = new Date(user.dob);
    const age = new Date().getFullYear() - dob.getFullYear();

    const userInfo = `User has interests in ${user.interest1}, ${user.interest2}, ${user.interest3}, belongs to age group ${user.age_group}, and is ${age} years old.`;

    // ✅ SAFE MODEL
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Generate 15 questions based on this user:
${userInfo}

Return JSON format:
{
  "mcq_questions": [],
  "long_question": {}
}
`;

    const result = await model.generateContent(prompt);

    const cleanText = cleanAIResponse(result.response.text());

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Invalid JSON from Gemini",
        raw: cleanText,
      });
    }

    res.json({
      success: true,
      questions: parsed,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;