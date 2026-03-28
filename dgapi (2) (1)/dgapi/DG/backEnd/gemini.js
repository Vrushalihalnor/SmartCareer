import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Create instance using ENV key
const genAI = new GoogleGenerativeAI("AIzaSyC2MMo6lkBcuggY7DVzcrllF2ZWsW9jiwY");

// ✅ Export it
export { genAI };

// ✅ Clean AI response
export function cleanAIResponse(rawText) {
  let text = rawText.trim();
  text = text.replace(/^json\s*/i, "");
  text = text.replace(/```json|```/gi, "");
  text = text.replace(/\\n/g, "\n")
             .replace(/\\"/g, '"')
             .replace(/\\'/g, "'");
  return text.trim();
}