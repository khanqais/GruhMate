import { model } from "../utils/geminiClient.js";
import { buildPrompt } from "../utils/promptBuilder.js";

export async function generateRecipeJSON(ctx) {
  const prompt = buildPrompt(ctx);
  const resp = await model.generateContent(prompt);
  const text = resp.response.text();

  // Extract JSON from response
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("INVALID_JSON_OUTPUT");
  const rawJson = text.slice(start, end + 1);
  return JSON.parse(rawJson);
}
