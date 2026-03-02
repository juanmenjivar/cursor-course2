import { NextRequest, NextResponse } from 'next/server';
import { invokeGemini } from '@/lib/llm';
import { validateApiKey } from '@/lib/api-keys';

export const runtime = 'nodejs';

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

    let summary: string | null = null;
    try {
      summary = await invokeGemini(
        `Summarize the following GitHub repository README in 2-4 concise paragraphs. Focus on the project's purpose, main features, and how to use it.\n\n---\n\n${readme.slice(0, 10000)}`
      );
    } catch {
      // LLM failed (e.g. leaked key); still return readme, summary stays null
    }

    return NextResponse.json({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      readme,
      summary,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
