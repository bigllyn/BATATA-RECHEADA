import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import db from "@/lib/db";

// Initialize without API key will require env var GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    // Fetch the menu from DB to give context to the AI
    const products = db.prepare('SELECT p.name, p.description, p.price, c.name as categoryName FROM Product p JOIN Category c ON p.categoryId = c.id').all() as any[];
    
    let menuContext = "Você é o atendente virtual do restaurante Gourmet Bites. Seja educado, rápido e focado em vender.\n\nNOSSO CARDÁPIO ATUAL:\n";
    for (const p of products) {
      menuContext += `- ${p.name} (${p.categoryName}): R$ ${p.price.toFixed(2)}. ${p.description || ''}\n`;
    }
    menuContext += "\nRegras: 1. Responda de forma curta como no WhatsApp. 2. Se o cliente quiser pedir, diga que ele pode pedir pelo link: http://localhost:3000/gourmet-bites ou você mesmo pode anotar. 3. Sugira sempre um item a mais (upsell).";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: menuContext }] },
          { role: 'model', parts: [{ text: 'Entendido, sou o atendente virtual.' }] },
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ]
      });

      return NextResponse.json({ reply: response.text() });
    } catch (apiError) {
      console.warn("API key might be missing", apiError);
      
      // Fallback response if no API key
      return NextResponse.json({ 
        reply: "Olá! Notei que minha inteligência artificial está temporariamente offline (falta da chave de API), mas você pode fazer seu pedido direto no nosso cardápio digital: http://localhost:3000/gourmet-bites" 
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro no chat" }, { status: 500 });
  }
}
