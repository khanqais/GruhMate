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
  apiKey: process.env.GEMINI_API_KEY
});

// Do NOT call getModel()
// The model is selected when generating
export async function generateGemini(prompt) {
  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  });

  return response.candidates[0].content.parts[0].text;
}

