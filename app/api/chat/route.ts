export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Server Error: GOOGLE_API_KEY is missing." }, { status: 500 });
    }

    const { messages } = await req.json();

    // 1. Prepare conversation
    let systemInstruction = "";
    const contents = [];

    for (const m of messages) {
      if (m.role === 'system') {
        systemInstruction += m.content + "\n";
      } else if (m.role === 'user' || m.role === 'assistant') {
        const role = m.role === 'assistant' ? 'model' : 'user';
        let text = m.content;
        
        // Attach system context to the first user message
        if (role === 'user' && systemInstruction) {
          text = systemInstruction + "\n\n" + text;
          systemInstruction = ""; 
        }

        contents.push({
          role: role,
          parts: [{ text: text }]
        });
      }
    }

    // 🟢 FIX: Use 'gemini-flash-latest'
    // This model is explicitly in your allowed list and has better free-tier quotas.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", data);
      // Pass the specific error back so you can see it
      return Response.json({ error: data.error?.message || "Quota Exceeded or API Error" }, { status: 500 });
    }

    // 3. Extract Answer
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

    return Response.json({ text });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}