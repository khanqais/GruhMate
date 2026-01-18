// // utils/geminiClient.js
// import { GoogleGenAI } from "@google/genai";

// export const model = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });
// geminiClient.js
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Choose model by need: "gemini-1.5-pro" or "gemini-1.5-flash"
// export const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
// import { GoogleGenAI } from "@google/genai";

// const client = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY
// });

// export const model = client.getModel({
//   model: "gemini-2.0-flash"
// });

// utils/geminiClient.js
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateGemini(prompt) {
  const result = await genAI.models.generateContent({
    model: "models/gemini-2.5-flash-lite",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  return result.text;
}

