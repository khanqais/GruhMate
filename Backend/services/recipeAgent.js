// import { genAI } from "../utils/geminiClient.js";
// import { buildPrompt } from "../utils/promptBuilder.js";

// export async function generateRecipeJSON(ctx) {
//   const prompt = buildPrompt(ctx);
// // async function listModels() {
// //   const res = await genAI.models.list();
// //   console.log(res);
// // }

// // listModels();
// //   if (!prompt || prompt.trim() === "") {
// //     throw new Error("Prompt is empty. Cannot send to Gemini.");
// //   }

//   // ✅ Minimal change: correct SDK call
//   const resp = await genAI.models.generateContent({
//    model: "models/gemini-2.5-flash-lite",
//     contents: [
//       { role: "user", parts: [{ text: typeof prompt === "string" ? prompt : JSON.stringify(prompt) }] }
//     ],
//     generationConfig: {
//       responseMimeType: "application/json"
//     }
//   });

//   const text = resp.text; // string output

//   const start = text.indexOf("{");
//   const end = text.lastIndexOf("}");
//   if (start === -1 || end === -1) throw new Error("INVALID_JSON_OUTPUT");
//   const rawJson = text.slice(start, end + 1);
//   return JSON.parse(rawJson);
// }
// services/recipeAgent.js
import { generateGemini  } from "../utils/geminiClient.js";
import { buildPrompt } from "../utils/promptBuilder.js";

export async function generateRecipeJSON(ctx) {
  const prompt = buildPrompt(ctx);
  const resp = await generateGemini(prompt);
  const text = resp.response.text();

  // Harden: strip non-JSON noise if any and parse
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("INVALID_JSON_OUTPUT");
  const rawJson = text.slice(start, end + 1);
  return JSON.parse(rawJson);
}
