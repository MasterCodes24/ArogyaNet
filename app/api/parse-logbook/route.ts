import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawImage = body.image || body.base64 || body.imageBase64;

    if (!rawImage) {
      return NextResponse.json(
        { error: "No image provided. Please send a base64 encoded image string in the request body ('image' or 'base64')." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 500 }
      );
    }

    // Extract mimeType and base64 string if data URI format is provided
    let mimeType = "image/jpeg";
    let base64Data = rawImage;

    const dataUriMatch = rawImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (dataUriMatch) {
      mimeType = dataUriMatch[1];
      base64Data = dataUriMatch[2];
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: `Analyze this logbook or prescription image containing medical inventory records.
Extract all listed entries into a JSON array where each object has these exact key names:
- "medicine": Name of the medicine/drug (string)
- "quantity": Quantity/dosage count (number or string)
- "batchNumber": Batch or lot number (string, use "N/A" if missing)

Return ONLY the raw JSON array.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "[]";
    let parsedData;
    try {
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, "").trim();
      parsedData = JSON.parse(cleanedText);
    } catch {
      parsedData = responseText;
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Error in parse-logbook API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while parsing the logbook." },
      { status: 500 }
    );
  }
}
