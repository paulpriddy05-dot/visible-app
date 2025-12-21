export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Server Error: GOOGLE_API_KEY is missing." }, { status: 500 });
    }

    const { messages } = await req.json();

    // 1. Prepare the conversation for Google's specific format
    // Google expects strict "user" and "model" roles.
    let systemInstruction = "";
    const contents = [];

    for (const m of messages) {
      if (m.role === 'system') {
        // Extract system data (your dashboard context) to prepend later
        systemInstruction += m.content + "\n";
      } else if (m.role === 'user' || m.role === 'assistant') {
        // Map "assistant" -> "model" for Google
        const role = m.role === 'assistant' ? 'model' : 'user';
        
        // If this is the very first user message, attach the system context to it
        // (This is the safest way to ensure the AI reads your data)
        let text = m.content;
        if (role === 'user' && systemInstruction) {
          text = systemInstruction + "\n\n" + text;
          systemInstruction = ""; // Clear it so we don't add it twice
        }

        contents.push({
          role: role,
          parts: [{ text: text }]
        });
      }
    }

    // 2. Send Raw Request to Google API (Bypassing the Vercel SDK)
    // We use the "gemini-1.5-flash" endpoint directly.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    // 3. Handle Errors
    if (!response.ok) {
      console.error("Google API Error:", data);
      return Response.json({ error: data.error?.message || "Google API Refused Connection" }, { status: 500 });
    }

    // 4. Extract Answer
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

    return Response.json({ text });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}