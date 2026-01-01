import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function scanInventory(imagePath) {
  try {
    const prompt = `
      Extract item names and quantities from this image.
      Return ONLY a JSON array.
      Format:
      [{ "item": "name", "quantity": 10, "unit": "kg" }]
    `;

    // Use gemini-1.5-flash (supports vision + free tier)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Read and encode image
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    // Generate content with image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const rawText = response.text();

    // Strip markdown code blocks (``````)
    const cleanJson = rawText.replace(/``````/g, "").trim();

    return JSON.parse(cleanJson);
    
  } catch (error) {
    if (error.status === 429) {
      console.error("❌ 429 ERROR: API quota exceeded. Check your billing in AI Studio.");
    }
    console.error("❌ Scan inventory error:", error.message);
    throw error;
  }
}
