import express from "express";
import { db } from "../db.js";
import { genAI, cleanAIResponse } from "../gemini.js";

const router = express.Router();

// ✅ Predict career & personality (using email & answers)
router.post("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const answers = req.body.answers;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide answers array" });
    }

    // Fetch user by email
    const [userRows] = await db.query(
      "SELECT user_id, interest1, interest2, interest3, dob, age_group FROM users WHERE email = ?",
      [email]
    );

    if (!userRows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userRows[0];
    const user_id = user.user_id;
    const dob = new Date(user.dob);
    const age = new Date().getFullYear() - dob.getFullYear();

    const userInfo = `User has interests in ${user.interest1}, ${user.interest2}, ${user.interest3}, belongs to age group ${user.age_group}, and is ${age} years old.`;

    const answersSummary = answers
      .map((a, i) => `${i + 1}. ${a.question_id}: ${a.selected_option}`)
      .join("\n");

    const prompt = `
You are an expert career counselor and psychologist.
Predict user's career interests and personality traits.

User Info:
${userInfo}

Selected Answers:
${answersSummary}

Return JSON only with exactly 3 career suggestions:
{
  "career_suggestions": [
    {"title": "Career Name", "reason": "Why this career fits the user"}
  ],
  "interest_areas": ["List of top interests"],
  "personality_summary": "Short summary",
  "skills_to_develop": ["Skill 1", "Skill 2", "Skill 3"]
}
`;

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const cleanText = cleanAIResponse(result.response.text());

    let prediction;
    try {
      prediction = JSON.parse(cleanText);

      // ✅ Ensure exactly 3 career suggestions
      if (prediction.career_suggestions.length > 3) {
        prediction.career_suggestions = prediction.career_suggestions.slice(0, 3);
      } else if (prediction.career_suggestions.length < 3) {
        while (prediction.career_suggestions.length < 3) {
          prediction.career_suggestions.push({
            title: "Other Career",
            reason: "Additional suggestion",
          });
        }
      }

    } catch (err) {
      console.error("⚠ Invalid Gemini JSON:", cleanText);
      return res.status(500).json({ success: false, message: "Invalid JSON from Gemini", raw: cleanText });
    }

    // Save report in DB
    const summary = prediction.career_suggestions.map((c) => c.title).join(", ").slice(0, 100);
    await db.query(
      "INSERT INTO reports (user_id, report_json, summary) VALUES (?, ?, ?)",
      [user_id, JSON.stringify(prediction), summary]
    );

    res.json({
      success: true,
      message: "Career and interest prediction generated successfully",
      report: prediction
    });

  } catch (error) {
    console.error("❌ Prediction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
