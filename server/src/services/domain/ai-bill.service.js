import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { env } from "../../config/env.js";

const PROMPT = `You are a pharmacy invoice OCR assistant. Extract line items from this supplier bill image.
Return ONLY valid JSON array (no markdown) with objects:
{
  "medicineName": string,
  "categorySuggestion": one of Tablets, Capsules, Syrups, Injections, Drops, Ointments, Surgical/Medical Devices, Nutraceuticals,
  "batchNumber": string,
  "expiryDate": ISO date YYYY-MM-DD,
  "quantity": number,
  "tradePrice": number (purchase/trade price per unit or pack as shown),
  "mrp": number
}
If a field is missing use sensible defaults. Expiry may be MM/YY on bill — convert to last day of month.`;

export async function extractBillItems(filePath, mimeType) {
  if (!env.geminiApiKey) {
    return mockExtraction();
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const data = fs.readFileSync(filePath);
  const base64 = data.toString("base64");

  const result = await model.generateContent([
    { text: PROMPT },
    {
      inlineData: {
        mimeType: mimeType === "application/pdf" ? "application/pdf" : mimeType,
        data: base64,
      },
    },
  ]);

  const text = result.response.text().trim();
  const jsonStart = text.indexOf("[");
  const jsonEnd = text.lastIndexOf("]");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("AI could not parse bill. Try a clearer image.");
  }
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

function mockExtraction() {
  const y = new Date();
  y.setMonth(y.getMonth() + 18);
  return [
    {
      medicineName: "Paracetamol 500mg",
      categorySuggestion: "Tablets",
      batchNumber: "DEMO-B001",
      expiryDate: y.toISOString().slice(0, 10),
      quantity: 100,
      tradePrice: 12.5,
      mrp: 18,
    },
    {
      medicineName: "Amoxicillin 250mg",
      categorySuggestion: "Capsules",
      batchNumber: "DEMO-B002",
      expiryDate: y.toISOString().slice(0, 10),
      quantity: 50,
      tradePrice: 45,
      mrp: 65,
    },
  ];
}
