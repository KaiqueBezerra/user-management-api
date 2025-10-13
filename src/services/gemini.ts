// src/lib/Gemini.ts
import { GoogleGenAI } from "@google/genai";
import { env } from "../env.ts";

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const model = "gemini-2.5-flash";

export async function validateEmailWithGemini(email: string) {
  const prompt = `
    The user provided this email: ${email}.
    Respond only with the same email if it is valid.
    If it does not seem like a valid email, respond with "invalid".
  `.trim();

  const response = await gemini.models.generateContent({
    model,
    contents: [{ text: prompt }],
  });

  if (!response.text) {
    throw new Error("Failed to validate email with Gemini");
  }

  return response.text.trim().toLowerCase();
}

export async function describeUserWithGemini(user: {
  id: string;
  name: string;
  email: string;
}) {
  const prompt = `
    Generate a short phrase confirming that the user was found.
    Name: ${user.name}, Email: ${user.email}.
    Example output: "User João Silva found successfully."
  `.trim();

  const response = await gemini.models.generateContent({
    model,
    contents: [{ text: prompt }],
  });

  if (!response.text) {
    throw new Error("Failed to generate description with Gemini");
  }

  return response.text.trim();
}
