import { NextRequest, NextResponse } from 'next/server';
import { invokeGemini, streamGemini } from '@/lib/llm';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, stream: useStream = false } = body as {
      message?: string;
      stream?: boolean;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "message" in request body' },
        { status: 400 }
      );
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
            controller.error(err);
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

    const response = await invokeGemini(message);
    return NextResponse.json({ response });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status =
      message.includes('GOOGLE_API_KEY') || message.includes('Missing')
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
