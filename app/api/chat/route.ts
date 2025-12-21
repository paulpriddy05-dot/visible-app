import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // 1. Check API Key
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is missing via process.env");
    }

    // 2. Get Messages
    const { messages } = await req.json();

    // 3. Call Gemini
    const result = await streamText({
      model: google('models/gemini-1.5-flash'),
      messages,
    });

    // 🛑 FIX IS HERE:
    // Instead of .toDataStreamResponse() (which is crashing),
    // we use .toTextStreamResponse() to send plain, simple text.
    // This matches your manual frontend perfectly.
    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Backend Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}