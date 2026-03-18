import { NextRequest, NextResponse } from 'next/server';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { getChatModel } from '@/lib/llm';
import { validateApiKey, getApiKeyUsageLimit, incrementApiKeyUsage } from '@/lib/api-keys-server'

export const runtime = 'nodejs';

const GitHubSummarySchema = z.object({
  summary: z.string().describe('~500-word summary of the GitHub repository based on the README'),
  cool_fact: z
    .array(z.string())
    .min(5)
    .describe('List of at least 5 interesting/cool facts about the repository'),
});

type GitHubSummary = z.infer<typeof GitHubSummarySchema>;

function getApiKeyFromRequest(req: NextRequest): string | null {
  const headerKey =
    req.headers.get('x-api-key') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  return headerKey || null;
}

function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim();
  let match: RegExpMatchArray | null = null;
  if (trimmed.startsWith('git@')) {
    match = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/i);
  } else {
    match = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?(\/.*)?$/i);
  }
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ''),
  };
}

async function fetchReadmeFromGitHub(owner: string, repo: string): Promise<string | null> {
  const candidates = ['README.md', 'README.MD', 'readme.md'];
  for (const file of candidates) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${file}`;
    const resp = await fetch(url);
    if (resp.ok) return await resp.text();
  }
  return null;
}

function extractJsonFromText(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text.replace(/```json\n?|\n?```/g, '').trim();
}

async function summarizeReadme(readme: string): Promise<GitHubSummary | null> {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'user',
      `Summarize this GitHub repository from the readme content below. Provide a detailed summary (approximately 250 words) and exactly 5 cool or interesting facts about the repository. Keep fact strings concise (one short sentence each).

Readme content:

{readme}`,
    ],
  ]);
  const messages = await prompt.invoke({ readme });
  const model = getChatModel();

  const attemptParse = (rawText: string): GitHubSummary | null => {
    const jsonStr = extractJsonFromText(rawText);
    const repaired = repairJsonString(jsonStr);
    try {
      const parsed = JSON.parse(repaired);
      return GitHubSummarySchema.parse(parsed) as GitHubSummary;
    } catch {
      return null;
    }
  };

  const response = await model.invoke(messages);
  const text =
    typeof response.content === 'string'
      ? response.content
      : (response.content as { text?: string }[])?.[0]?.text ?? '';
  let result = attemptParse(text);

  if (!result) {
    const retryPrompt = ChatPromptTemplate.fromMessages([
      [
        'user',
        `Return valid JSON only. Summarize this repo readme in under 200 words. List exactly 5 short facts (one phrase each). Format: {"summary":"...","cool_fact":["fact1","fact2","fact3","fact4","fact5"]}. No markdown, no extra text.

Readme:

{readme}`,
      ],
    ]);
    const retryMessages = await retryPrompt.invoke({ readme: readme.slice(0, 5000) });
    const retryResponse = await model.invoke(retryMessages);
    const retryText =
      typeof retryResponse.content === 'string'
        ? retryResponse.content
        : (retryResponse.content as { text?: string }[])?.[0]?.text ?? '';
    result = attemptParse(retryText);
  }

  return result;
}

/**
 * Attempt to fix common JSON issues from LLM output (e.g. unterminated string).
 * Truncates at the error position, closes the open string, then closes any open brackets/braces.
 */
function repairJsonString(jsonStr: string): string {
  try {
    JSON.parse(jsonStr);
    return jsonStr;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('position') && !msg.includes('Unterminated')) return jsonStr;
  }
  const posMatch = jsonStr.match(/position (\d+)/);
  const cut = posMatch ? Math.min(Number(posMatch[1]), jsonStr.length) : jsonStr.length;
  let s = jsonStr.slice(0, cut);
  const inDoubleQuote = (s.match(/"([^"\\]|\\.)*$/) ?? [])[0];
  if (inDoubleQuote) s = s.slice(0, s.length - inDoubleQuote.length) + '"';
  let openBracket = 0;
  let openBrace = 0;
  for (const c of s) {
    if (c === '[') openBracket++;
    else if (c === ']') openBracket--;
    else if (c === '{') openBrace++;
    else if (c === '}') openBrace--;
  }
  s += ']'.repeat(Math.max(0, openBracket)) + '}'.repeat(Math.max(0, openBrace));
  return s;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const apiKey = getApiKeyFromRequest(req);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key. Provide it via x-api-key header or Authorization: Bearer <key>.' },
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

    const usageLimit = await getApiKeyUsageLimit(apiKey);
    if (usageLimit && usageLimit.usage >= usageLimit.limit) {
      return NextResponse.json(
        {
          error: 'Maximum API call limit reached',
          usage: usageLimit.usage,
          limit: usageLimit.limit,
        },
        { status: 429 }
      );
    }

    const gitHubUrl = body?.gitHubUrl;

    if (!gitHubUrl || typeof gitHubUrl !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "gitHubUrl" in request body' },
        { status: 400 }
      );
    }

    const repoInfo = parseGitHubRepoUrl(gitHubUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL' },
        { status: 400 }
      );
    }

    const readme = await fetchReadmeFromGitHub(repoInfo.owner, repoInfo.repo);
    if (!readme) {
      return NextResponse.json(
        { error: 'Could not find README in the specified repository' },
        { status: 404 }
      );
    }

    let result: GitHubSummary | null = null;
    let summaryError: string | null = null;
    try {
      result = await summarizeReadme(readme.slice(0, 10000));
    } catch (err) {
      summaryError = err instanceof Error ? err.message : String(err);
    }

    const response: Record<string, unknown> = {
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      summary: result?.summary ?? null,
      cool_fact: result?.cool_fact ?? null,
    };
    if (summaryError) {
      response.summary_error = summaryError;
    }

    await incrementApiKeyUsage(apiKey);
    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
