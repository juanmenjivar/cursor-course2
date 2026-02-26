import { NextRequest, NextResponse } from 'next/server';
import { invokeGemini, streamGemini } from '@/lib/llm';
import { validateApiKey } from '@/lib/api-keys';

export const runtime = 'nodejs';

function getApiKeyFromRequest(req: NextRequest, body: Record<string, unknown>): string | null {
  const headerKey = req.headers.get('x-api-key') ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (headerKey) return headerKey;
  const bodyKey = body?.apiKey;
  if (typeof bodyKey === 'string' && bodyKey.trim()) return bodyKey.trim();
  return null;
}

function formatLlmError(err: unknown): { error: string; status: number } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('leaked') || msg.includes('reported as leaked')) {
    return {
      error:
        'Server configuration error: The Google API key (GOOGLE_API_KEY) used by this service has been flagged as leaked. ' +
        'The administrator must generate a new key at https://aistudio.google.com/app/apikey and update .env.local.',
      status: 503,
    };
  }
  if (msg.includes('GOOGLE_API_KEY') || msg.includes('Missing')) {
    return { error: msg, status: 503 };
  }
  return { error: msg, status: 500 };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const apiKey = getApiKeyFromRequest(req, body);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key. Provide it via x-api-key header, Authorization: Bearer <key>, or apiKey in body.' },
        { status: 401 }
      );
    }

    const validation = await validateApiKey(apiKey);
    if (validation === 'invalid') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    if (validation === 'disabled') {
      return NextResponse.json({ error: 'API key is disabled' }, { status: 403 });
    }

    const { message, stream: useStream = false, dryRun = false } = body as {
      message?: string;
      stream?: boolean;
      dryRun?: boolean;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "message" in request body' },
        { status: 400 }
      );
    }

    // dryRun: skip LLM call and return a mock response to verify flow (API key validation, routing)
    if (dryRun) {
      return NextResponse.json({
        response: `[dry run] Would process: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`,
        _meta: { dryRun: true, messageLength: message.length },
      });
    }

    if (useStream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamGemini(message)) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (err) {
            const { error, status } = formatLlmError(err);
            controller.error(new Error(JSON.stringify({ error, status })));
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    try {
      const response = await invokeGemini(message);
      return NextResponse.json({ response });
    } catch (llmErr) {
      const { error, status } = formatLlmError(llmErr);
      return NextResponse.json({ error }, { status });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const status = msg.includes('GOOGLE_API_KEY') || msg.includes('Missing') ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
