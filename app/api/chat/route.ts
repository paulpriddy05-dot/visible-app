import { google } from '@ai-sdk/google';
import { generateText } from 'ai'; // 👈 We use this instead of streamText

export const maxDuration = 60; // Give Gemini time to think

export async function POST(req: Request) {
  try {
    // 1. Check API Key
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is missing.");
    }

    const { messages } = await req.json();

    // 2. Generate the full answer (Non-Streaming)
    const { text } = await generateText({
      model: google('models/gemini-1.5-flash'),
      messages,
    });

    // 3. Send it back as simple JSON
    return Response.json({ text });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}