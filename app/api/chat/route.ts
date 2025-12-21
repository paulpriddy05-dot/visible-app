import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // 1. Check if the key exists on the server
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is missing in Vercel Environment Variables.");
    }

    // 2. Parse the incoming message
    const { messages } = await req.json();

    // 3. Call Gemini
    const result = await streamText({
      model: google('models/gemini-1.5-flash'),
      messages,
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("Backend Error:", error);
    // Return the actual error message to the frontend so we can see it
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}