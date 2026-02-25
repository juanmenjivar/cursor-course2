/**
 * LangChain + Google Gemini integration
 *
 * Uses @langchain/google with ChatGoogle for the Gemini model.
 * Requires GOOGLE_API_KEY in environment (from Google AI Studio: https://aistudio.google.com/app/apikey)
 */

import { ChatGoogle } from '@langchain/google/node';
import { HumanMessage, type BaseMessage } from '@langchain/core/messages';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

let chatModel: ChatGoogle | null = null;

function getChatModel(): ChatGoogle {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing GOOGLE_API_KEY. Set it in .env.local (from https://aistudio.google.com/app/apikey)'
    );
  }

  if (!chatModel) {
    chatModel = new ChatGoogle({
      model: GEMINI_MODEL,
      apiKey,
      maxOutputTokens: 2048,
      temperature: 0.7,
    });
  }

  return chatModel;
}

/**
 * Invoke the Gemini model with a single prompt or message array.
 */
export async function invokeGemini(
  input: string | BaseMessage[]
): Promise<string> {
  const model = getChatModel();
  const messages =
    typeof input === 'string'
      ? [new HumanMessage(input)]
      : input;

  const response = await model.invoke(messages);
  return typeof response.content === 'string'
    ? response.content
    : (response.content as { text?: string }[])?.[0]?.text ?? String(response.content);
}

/**
 * Stream the Gemini model response (for real-time UI updates).
 */
export async function* streamGemini(
  input: string | BaseMessage[]
): AsyncGenerator<string> {
  const model = getChatModel();
  const messages =
    typeof input === 'string'
      ? [new HumanMessage(input)]
      : input;

  const stream = await model.stream(messages);

  for await (const chunk of stream) {
    const content = chunk.content;
    if (typeof content === 'string' && content) {
      yield content;
    } else if (Array.isArray(content) && content[0]?.text) {
      yield String(content[0].text);
    }
  }
}

export { getChatModel };
