import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 60;

// 1. Manually configure the Google provider with YOUR key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "", 
});

export async function POST(req: Request) {
  try {
    // 2. Double-check the key exists before we start
    if (!process.env.GOOGLE_API_KEY) {
      return Response.json({ error: "Server Error: GOOGLE_API_KEY is missing." }, { status: 500 });
    }

    const { messages } = await req.json();

    // 3. Generate the answer using our configured 'google' instance
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      messages,
    });

    return Response.json({ text });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}