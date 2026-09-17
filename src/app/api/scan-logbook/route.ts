import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ""),
      }
    };

    const promptText = "You are a helpful assistant reading a handwritten medicine stock logbook. Extract the medicine names and quantities into this JSON format: { \"medicines\": [ { \"medicineName\": \"string\", \"quantity\": 0 } ] }. Return ONLY the JSON without markdown formatting.";

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        imagePart,
        promptText
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No text received from Gemini.");
    }

    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData, { status: 200 });

  } catch (error: any) {
    console.error("Gemini API Error details:", error?.message || error);
    
    // Check if it's a JSON parse error
    if (error instanceof SyntaxError) {
       console.error("Failed to parse Gemini response as JSON. Raw response may be invalid.");
    }
    
    return NextResponse.json(
      { error: "Failed to read image or parse results. Please check server logs for details." }, 
      { status: 500 }
    );
  }
}
