export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    // 1. Debug Endpoint: List available models
    // This tells us exactly what your key can "see"
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
       return Response.json({ 
         error: "Connection Failed", 
         details: data 
       }, { status: 500 });
    }

    // 2. Success! Send the list back to the chat window
    // We format it as a fake "AI Response" so you can read it clearly.
    const modelNames = data.models?.map((m: any) => m.name) || [];
    
    return Response.json({ 
      text: `✅ SUCCESS! Your API Key is working.\n\nHere are the models you can access:\n${modelNames.join('\n')}` 
    });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}