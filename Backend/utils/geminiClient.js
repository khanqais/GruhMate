// geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-1.5-flash (fast, supports vision, free tier)
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
