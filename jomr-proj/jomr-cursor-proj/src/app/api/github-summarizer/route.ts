import { NextRequest, NextResponse } from 'next/server';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { getChatModel } from '@/lib/llm';
import { validateApiKey } from '@/lib/api-keys';

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

async function summarizeReadme(readme: string): Promise<GitHubSummary | null> {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'user',
      `Summarize this GitHub repository from this readme file content using Gemini AI. Provide a detailed summary of approximately 250 words and exactly 5 cool/interesting facts about the repository. IMPORTANT: Escape any quotes inside strings with backslash (e.g. \\"). Respond with valid JSON only, no markdown, in this exact format:
{{"summary": "your summary here", "cool_fact": ["fact1", "fact2", "fact3", "fact4", "fact5"]}}

Readme content:

{readme}`,
    ],
  ]);
  const messages = await prompt.invoke({ readme });
  const model = getChatModel();
  const response = await model.invoke(messages);
  const text =
    typeof response.content === 'string'
      ? response.content
      : (response.content as { text?: string }[])?.[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const json = jsonMatch ? jsonMatch[0] : text.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(json);
  return GitHubSummarySchema.parse(parsed);
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
    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
