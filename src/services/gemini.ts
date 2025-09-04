// src/lib/Gemini.ts
import { GoogleGenAI } from "@google/genai";
import { env } from "../env.ts";

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const model = "gemini-2.5-flash";

export async function validateEmailWithGemini(email: string) {
  const prompt = `
    O usuário forneceu este email: ${email}.
    Responda apenas com o mesmo email, se ele for válido.
    Caso não pareça um email válido, responda com "invalid".
  `.trim();

  const response = await gemini.models.generateContent({
    model,
    contents: [{ text: prompt }],
  });

  if (!response.text) {
    throw new Error("Falha ao validar email com Gemini");
  }

  return response.text.trim().toLowerCase();
}

export async function describeUserWithGemini(user: {
  id: string;
  name: string;
  email: string;
}) {
  const prompt = `
    Gere uma frase curta em português confirmando que o usuário foi encontrado.
    Nome: ${user.name}, Email: ${user.email}.
    Exemplo de saída: "Usuário João Silva encontrado com sucesso."
  `.trim();

  const response = await gemini.models.generateContent({
    model,
    contents: [{ text: prompt }],
  });

  if (!response.text) {
    throw new Error("Falha ao gerar descrição com Gemini");
  }

  return response.text.trim();
}
