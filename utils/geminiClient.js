// geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Choose model by need: "gemini-1.5-pro" or "gemini-1.5-flash"
export const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
