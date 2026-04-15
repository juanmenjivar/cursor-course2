import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { getChatModel } from '@/lib/llm';
import { validateApiKey, getApiKeyUsageLimit, incrementApiKeyUsage } from '@/lib/api-keys-server'

export const runtime = 'nodejs';

const GitHubSummarySchema = z.object({
  summary: z.string(),
  cool_fact: z.array(z.string()).min(1).describe('Interesting facts about the repository'),
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

const GITHUB_JSON = { Accept: 'application/vnd.github.v3+json' } as const

async function fetchReadmeFromGitHub(owner: string, repo: string): Promise<string | null> {
  const candidates = ['README.md', 'README.MD', 'readme.md'];
  for (const file of candidates) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${file}`;
    const resp = await fetch(url);
    if (resp.ok) return await resp.text();
  }
  return null;
}

/** README via GitHub API (follows default branch; works when raw/HEAD URL fails). */
async function fetchReadmeViaGitHubApi(owner: string, repo: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: GITHUB_JSON,
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { content?: string; encoding?: string };
    if (data.encoding === 'base64' && typeof data.content === 'string') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchReadmeBestEffort(owner: string, repo: string): Promise<{ text: string | null; source: 'raw' | 'api' | null }> {
  const fromRaw = await fetchReadmeFromGitHub(owner, repo);
  if (fromRaw) return { text: fromRaw, source: 'raw' };
  const fromApi = await fetchReadmeViaGitHubApi(owner, repo);
  if (fromApi) return { text: fromApi, source: 'api' };
  return { text: null, source: null };
}

interface RepoMeta {
  stars: number | null
  latestVersion: string | null
  description: string | null
  language: string | null
  topics: string[]
  homepage: string | null
  defaultBranch: string | null
  htmlUrl: string | null
}

async function fetchRepoMeta(owner: string, repo: string): Promise<RepoMeta> {
  const out: RepoMeta = {
    stars: null,
    latestVersion: null,
    description: null,
    language: null,
    topics: [],
    homepage: null,
    defaultBranch: null,
    htmlUrl: null,
  }
  try {
    const [repoResp, releaseResp] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: GITHUB_JSON,
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        headers: GITHUB_JSON,
      }),
    ])
    if (repoResp.ok) {
      const data = (await repoResp.json()) as {
        stargazers_count?: number
        description?: string | null
        language?: string | null
        topics?: string[]
        homepage?: string | null
        default_branch?: string | null
        html_url?: string
      }
      out.stars = typeof data.stargazers_count === 'number' ? data.stargazers_count : null
      out.description = typeof data.description === 'string' ? data.description : null
      out.language = typeof data.language === 'string' ? data.language : null
      out.topics = Array.isArray(data.topics) ? data.topics : []
      out.homepage = typeof data.homepage === 'string' && data.homepage ? data.homepage : null
      out.defaultBranch = typeof data.default_branch === 'string' ? data.default_branch : null
      out.htmlUrl = typeof data.html_url === 'string' ? data.html_url : null
    }
    if (releaseResp.ok) {
      const data = (await releaseResp.json()) as { tag_name?: string }
      out.latestVersion = typeof data.tag_name === 'string' ? data.tag_name : null
    }
  } catch {
    // leave fields null
  }
  return out
}

function metaContextForPrompt(meta: RepoMeta, owner: string, repo: string): string {
  const lines: string[] = [`Repository: ${owner}/${repo}`]
  if (meta.description) lines.push(`Description: ${meta.description}`)
  if (meta.language) lines.push(`Primary language: ${meta.language}`)
  if (meta.topics.length) lines.push(`Topics: ${meta.topics.join(', ')}`)
  if (meta.stars !== null) lines.push(`Stars: ${meta.stars}`)
  if (meta.homepage) lines.push(`Homepage: ${meta.homepage}`)
  if (meta.latestVersion) lines.push(`Latest release tag: ${meta.latestVersion}`)
  if (meta.htmlUrl) lines.push(`URL: ${meta.htmlUrl}`)
  return lines.join('\n')
}

function extractJsonFromText(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text.replace(/```json\n?|\n?```/g, '').trim();
}

function attemptParseSummary(rawText: string): GitHubSummary | null {
  const jsonStr = extractJsonFromText(rawText);
  const repaired = repairJsonString(jsonStr);
  try {
    const parsed = JSON.parse(repaired);
    return GitHubSummarySchema.parse(parsed) as GitHubSummary;
  } catch {
    return null;
  }
}

/**
 * Summarize from README and/or repo metadata. Works with README-only, metadata-only, or both.
 */
async function summarizeRepository(
  readme: string | null,
  meta: RepoMeta,
  owner: string,
  repo: string
): Promise<GitHubSummary | null> {
  const metaBlock = metaContextForPrompt(meta, owner, repo);
  const model = getChatModel();

  const readmeSlice = readme?.trim() ? readme.trim().slice(0, 10000) : '';
  const hasReadme = readmeSlice.length > 0;

  const primaryPrompt = hasReadme
    ? `Summarize this GitHub repository. Use the README as the main source; repository metadata is included for context.

Repository metadata:
${metaBlock}

README:
${readmeSlice}

Return JSON only with this shape: {"summary":"...","cool_fact":["fact1",...]}. The summary should be detailed when the README is long; include at least 3 short facts (one sentence each).`
    : `No README file was found for this repository. Summarize using ONLY the metadata below. Be clear that the summary is inferred from public metadata, not a README.

${metaBlock}

Return JSON only: {"summary":"...","cool_fact":["fact1",...]}. Include at least 3 short facts (one sentence each) when possible; if metadata is very sparse, say so in the summary and list what you could infer.`;

  // HumanMessage avoids ChatPromptTemplate interpreting `{` in JSON examples as variables.
  const response = await model.invoke([new HumanMessage(primaryPrompt)]);
  const text =
    typeof response.content === 'string'
      ? response.content
      : (response.content as { text?: string }[])?.[0]?.text ?? '';
  let result = attemptParseSummary(text);

  if (!result && hasReadme) {
    const retryPrompt = ChatPromptTemplate.fromMessages([
      [
        'user',
        `Return valid JSON only. Summarize this repo readme in under 200 words. At least 3 short facts (one phrase each). Format: {{"summary":"...","cool_fact":["f1","f2","f3"]}}. No markdown, no extra text.

Readme:

{readme}`,
      ],
    ]);
    const retryMessages = await retryPrompt.invoke({ readme: readmeSlice.slice(0, 5000) });
    const retryResponse = await model.invoke(retryMessages);
    const retryText =
      typeof retryResponse.content === 'string'
        ? retryResponse.content
        : (retryResponse.content as { text?: string }[])?.[0]?.text ?? '';
    result = attemptParseSummary(retryText);
  }

  if (!result && !hasReadme) {
    const retryPrompt = ChatPromptTemplate.fromMessages([
      [
        'user',
        `Return valid JSON only. No readme. Metadata:\n${metaBlock}\n\nJSON: {{"summary":"2-4 sentences","cool_fact":["a","b","c"]}}`,
      ],
    ]);
    const retryMessages = await retryPrompt.invoke({});
    const retryResponse = await model.invoke(retryMessages);
    const retryText =
      typeof retryResponse.content === 'string'
        ? retryResponse.content
        : (retryResponse.content as { text?: string }[])?.[0]?.text ?? '';
    result = attemptParseSummary(retryText);
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

function fallbackSummaryFromMeta(meta: RepoMeta, owner: string, repo: string): GitHubSummary {
  const bits: string[] = []
  if (meta.description) bits.push(meta.description)
  if (meta.language) bits.push(`Primary language: ${meta.language}.`)
  if (meta.stars !== null) bits.push(`${meta.stars} stars on GitHub.`)
  const summary =
    bits.length > 0
      ? `${owner}/${repo}: ${bits.join(' ')}`
      : `Repository ${owner}/${repo} is reachable, but no README was found and little metadata was returned. Try another URL or check that the repo is public.`
  const cool_fact: string[] = []
  if (meta.topics.length) cool_fact.push(`Topics: ${meta.topics.join(', ')}`)
  if (meta.homepage) cool_fact.push(`Homepage: ${meta.homepage}`)
  if (meta.latestVersion) cool_fact.push(`Latest release: ${meta.latestVersion}`)
  if (meta.htmlUrl) cool_fact.push(`Repository: ${meta.htmlUrl}`)
  if (cool_fact.length === 0) {
    cool_fact.push('Summary generated from available API metadata only (no LLM narrative).')
  }
  return { summary, cool_fact }
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

    const [readmeResult, repoMeta] = await Promise.all([
      fetchReadmeBestEffort(repoInfo.owner, repoInfo.repo),
      fetchRepoMeta(repoInfo.owner, repoInfo.repo),
    ])

    const warnings: string[] = []
    if (!readmeResult.text) {
      warnings.push('No README was found via raw GitHub URLs or the GitHub README API; summary may use metadata only.')
    }

    let result: GitHubSummary | null = null
    let summaryError: string | null = null
    try {
      result = await summarizeRepository(readmeResult.text, repoMeta, repoInfo.owner, repoInfo.repo)
    } catch (err) {
      summaryError = err instanceof Error ? err.message : String(err)
    }

    if (!result) {
      result = fallbackSummaryFromMeta(repoMeta, repoInfo.owner, repoInfo.repo)
      if (summaryError) {
        warnings.push(`LLM summarization failed (${summaryError}); showing metadata fallback.`)
      } else {
        warnings.push('LLM did not return parseable JSON; showing metadata fallback.')
      }
    }

    const response: Record<string, unknown> = {
      ok: true,
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      readme_found: !!readmeResult.text,
      stars: repoMeta.stars,
      latest_version: repoMeta.latestVersion,
      description: repoMeta.description,
      language: repoMeta.language,
      topics: repoMeta.topics,
      homepage: repoMeta.homepage,
      summary: result.summary,
      cool_fact: result.cool_fact,
      warnings: warnings.length ? warnings : undefined,
    }

    await incrementApiKeyUsage(apiKey);
    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
