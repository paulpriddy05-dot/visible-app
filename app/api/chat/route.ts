import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  // We only need 'messages' now. The context is already inside them.
  const { messages } = await req.json();

  const result = await streamText({
    model: google('models/gemini-1.5-flash'),
    messages, // 👈 We pass the history (which includes our hidden data) directly
  });

  return result.toDataStreamResponse();
}