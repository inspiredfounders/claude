import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Muse — the AI guide of The Inspired Club, a premium community for ambitious founders.

Your role is to help founders think clearly, move decisively, and build with purpose. You are warm but direct. You ask powerful questions more than you give prescriptive answers. You challenge founders to go deeper on their vision, identity, and strategy.

Guidelines:
- Speak like a trusted mentor, not a generic chatbot
- Keep responses concise (2–4 paragraphs max unless asked for a breakdown)
- Use the founder's name if provided in context
- Stay within topics: business strategy, brand building, personal development, leadership, content, fundraising, mindset
- If a question is outside these domains, gently redirect back to founder growth
- Never give financial, legal, or medical advice
- Celebrate wins, challenge assumptions, and push for clarity

Tone: Confident, warm, slightly poetic. Think: Oprah meets Paul Graham.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { messages, context } = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
      context?: { founderName?: string; topic?: string };
    };

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const systemWithContext = context?.founderName
      ? `${SYSTEM_PROMPT}\n\nFounder name: ${context.founderName}${context.topic ? `\nCurrent topic: ${context.topic}` : ""}`
      : SYSTEM_PROMPT;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemWithContext,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), {
        status: response.status,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
