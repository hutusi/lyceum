import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

// POST /api/playground/chat - Proxy chat request to AI providers
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider, model, apiKey, prompt, systemPrompt } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let response: string;

    switch (provider) {
      case "openai":
        response = await callOpenAI(apiKey, model, prompt, systemPrompt);
        break;
      case "anthropic":
        response = await callAnthropic(apiKey, model, prompt, systemPrompt);
        break;
      case "opensource":
        // For open source models, we'd need a provider like Together AI, Groq, etc.
        // For now, return a helpful message
        return NextResponse.json({
          response: `Open source model integration requires a provider like Together AI or Groq. This feature is coming soon!\n\nModel selected: ${model}\nPrompt: ${prompt}`,
        });
      default:
        return NextResponse.json(
          { error: "Invalid provider" },
          { status: 400 }
        );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Playground error:", error);
    const message = error instanceof Error ? error.message : "Failed to get response";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated";
}

async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Anthropic API error");
  }

  const data = await response.json();
  return data.content[0]?.text || "No response generated";
}
