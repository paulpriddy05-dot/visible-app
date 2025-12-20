import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  // 1. Grab the messages and the "context" (your dashboard data) from the request
  const { messages, context } = await req.json();

  // 2. Create the System Prompt
  const systemMessage = `
    You are an AI analyst for a workspace dashboard called "Visible".
    
    Here is the live data from the user's dashboard:
    --- START DASHBOARD CONTEXT ---
    ${JSON.stringify(context, null, 2)}
    --- END DASHBOARD CONTEXT ---

    Instructions:
    1. Answer the user's question based ONLY on the data provided above.
    2. If the user asks about a specific card, trip, or budget, look up the details in the context.
    3. If the answer is not in the data, strictly say "I don't see that information on your dashboard."
    4. Keep answers concise, helpful, and friendly.
  `;

  // 3. Stream the response using Gemini 1.5 Flash
  const result = await streamText({
    model: google('models/gemini-1.5-flash'),
    system: systemMessage,
    messages,
  });

  return result.toDataStreamResponse();
}