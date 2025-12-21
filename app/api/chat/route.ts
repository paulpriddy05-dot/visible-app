import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "", 
});

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return Response.json({ error: "Server Error: GOOGLE_API_KEY is missing." }, { status: 500 });
    }

    const { messages } = await req.json();

    // 🟢 CHANGE IS HERE: Switch to the standard 'gemini-1.5-pro'
    // This model is the most widely available and robust.
    const { text } = await generateText({
      model: google('gemini-pro'), 
      messages,
    });

    return Response.json({ text });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}