import type {
  DirectMessage,
  GitHubProject,
  GitHubRepoPreview,
  MessageStatus,
  ProfileData,
} from '../types/portfolio';

const PROFILE_KEY = 'venish_portfolio_profile_v1';
const GITHUB_KEY = 'venish_portfolio_github_v1';
const MESSAGES_KEY = 'venish_portfolio_messages_v1';

export function resolveAssetUrl(path: string): string {
  if (!path) {
    return path;
  }
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }
  const clean = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || './';
  return `${base.endsWith('/') ? base : `${base}/`}${clean}`;
}

export const DEFAULT_PROFILE: ProfileData = {
  name: 'Venish Ramani',
  role: 'Full-Stack Web Developer',
  location: 'Bengaluru, India',
  email: 'ramanivenish2004@gmail.com',
  headline: 'Building fast, clean web apps from API to interface.',
  bio: 'I specialize in React, Node.js, and RESTful APIs—focusing on clean component architecture, accessible layouts, and reliable backend services.',
  heroImage: resolveAssetUrl('src/assets/images/hero_studio_portrait_1795082543886.jpg'),
  heroImageAlt: 'Web developer workspace with laptop and notebooks',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

async function tryApiJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ok: true; status: number; data: T} | {ok: false; status: number; error?: string; staticFallback: boolean}> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Static hosts (e.g. GitHub Pages) return HTML 404 for /api/*
      return {ok: false, status: res.status, staticFallback: true};
    }
    const data = (await res.json()) as T & {error?: string};
    if (!res.ok) {
      return {ok: false, status: res.status, error: data?.error, staticFallback: false};
    }
    return {ok: true, status: res.status, data};
  } catch {
    return {ok: false, status: 0, staticFallback: true};
  }
}

function normalizeProfile(profile: ProfileData): ProfileData {
  return {
    ...profile,
    heroImage: resolveAssetUrl(profile.heroImage),
  };
}

export async function loadProfile(): Promise<ProfileData> {
  const api = await tryApiJson<{profile: ProfileData}>('/api/profile');
  if (api.ok && api.data?.profile) {
    const normalized = normalizeProfile(api.data.profile);
    writeStorage(PROFILE_KEY, normalized);
    return normalized;
  }
  return normalizeProfile(readStorage<ProfileData>(PROFILE_KEY, DEFAULT_PROFILE));
}

export async function saveProfile(updated: ProfileData): Promise<ProfileData> {
  const normalized = normalizeProfile(updated);
  const api = await tryApiJson<{profile: ProfileData}>('/api/profile', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(normalized),
  });
  if (api.ok) {
    const saved = api.data?.profile ? normalizeProfile(api.data.profile) : normalized;
    writeStorage(PROFILE_KEY, saved);
    return saved;
  }
  if (!api.staticFallback) {
    throw new Error(api.error || 'Failed to save profile');
  }
  writeStorage(PROFILE_KEY, normalized);
  return normalized;
}

// --- GitHub Lookup & Persistence ---

interface RawGitHubRepo {
  name?: string;
  full_name?: string;
  html_url?: string;
  homepage?: string | null;
  description?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  topics?: string[];
  updated_at?: string;
  fork?: boolean;
  owner?: {login?: string};
}

function parseGitHubRepoInput(input: string): {owner: string; repo: string} | null {
  const trimmed = input.trim().replace(/\/+$/, '').replace(/\.git$/, '');
  if (!trimmed) {
    return null;
  }
  const urlMatch = trimmed.match(/^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)/i);
  if (urlMatch) {
    return {owner: urlMatch[1], repo: urlMatch[2]};
  }
  const shortMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shortMatch) {
    return {owner: shortMatch[1], repo: shortMatch[2]};
  }
  return null;
}

function mapGitHubRepo(raw: RawGitHubRepo): GitHubRepoPreview {
  return {
    owner: raw.owner?.login ?? '',
    repo: raw.name ?? '',
    fullName: raw.full_name ?? '',
    htmlUrl: raw.html_url ?? '',
    homepage: raw.homepage && raw.homepage.trim() ? raw.homepage.trim() : undefined,
    description: raw.description?.trim() || 'No repository description provided.',
    language: raw.language?.trim() || 'Code',
    stars: typeof raw.stargazers_count === 'number' ? raw.stargazers_count : 0,
    forks: typeof raw.forks_count === 'number' ? raw.forks_count : 0,
    topics: Array.isArray(raw.topics) ? raw.topics.slice(0, 6) : [],
    updatedAt: raw.updated_at ?? new Date().toISOString(),
  };
}

export async function lookupGitHubRepo(urlOrSlug: string): Promise<GitHubRepoPreview> {
  const api = await tryApiJson<{repo: GitHubRepoPreview}>(
    `/api/github/repo?url=${encodeURIComponent(urlOrSlug)}`,
  );
  if (api.ok) {
    if (api.data?.repo) {
      return api.data.repo;
    }
    throw new Error('Could not fetch repository from GitHub.');
  }
  if (!api.staticFallback) {
    throw new Error(api.error || 'Could not fetch repository from GitHub.');
  }

  const parsed = parseGitHubRepoInput(urlOrSlug);
  if (!parsed) {
    throw new Error('Enter a repository as "owner/repo" or "https://github.com/owner/repo".');
  }
  const ghRes = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
    {headers: {Accept: 'application/vnd.github+json'}},
  );
  if (ghRes.status === 404) {
    throw new Error(`Repository "${parsed.owner}/${parsed.repo}" was not found or is private.`);
  }
  if (ghRes.status === 403) {
    throw new Error('GitHub API rate limit reached. You can still add the repository manually.');
  }
  if (!ghRes.ok) {
    throw new Error('Failed to load repository details from GitHub.');
  }
  const raw = (await ghRes.json()) as RawGitHubRepo;
  return mapGitHubRepo(raw);
}

export async function lookupGitHubUserRepos(username: string): Promise<GitHubRepoPreview[]> {
  const cleaned = username.trim().replace(/^@/, '');
  const api = await tryApiJson<{repos: GitHubRepoPreview[]}>(
    `/api/github/user?username=${encodeURIComponent(cleaned)}`,
  );
  if (api.ok) {
    return Array.isArray(api.data?.repos) ? api.data.repos : [];
  }
  if (!api.staticFallback) {
    throw new Error(api.error || 'Could not fetch repositories for that user.');
  }

  if (!cleaned || !/^[A-Za-z0-9-]+$/.test(cleaned)) {
    throw new Error('Please enter a valid GitHub username.');
  }
  const ghRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(cleaned)}/repos?sort=updated&per_page=18`,
    {headers: {Accept: 'application/vnd.github+json'}},
  );
  if (ghRes.status === 404) {
    throw new Error(`GitHub user "${cleaned}" was not found.`);
  }
  if (ghRes.status === 403) {
    throw new Error('GitHub API rate limit reached. You can still add repositories manually.');
  }
  if (!ghRes.ok) {
    throw new Error('Unable to fetch repositories from GitHub right now.');
  }
  const rawRepos = (await ghRes.json()) as RawGitHubRepo[];
  return Array.isArray(rawRepos) ? rawRepos.filter((r) => !r.fork).map(mapGitHubRepo) : [];
}

export async function loadGitHubProjects(): Promise<GitHubProject[]> {
  const api = await tryApiJson<{projects: GitHubProject[]}>('/api/github-projects');
  if (api.ok && Array.isArray(api.data?.projects)) {
    writeStorage(GITHUB_KEY, api.data.projects);
    return api.data.projects;
  }
  return readStorage<GitHubProject[]>(GITHUB_KEY, []).sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
}

export async function addGitHubProject(
  payload: GitHubRepoPreview & {customHighlight?: string},
): Promise<GitHubProject> {
  const api = await tryApiJson<{project: GitHubProject}>('/api/github-projects', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  if (api.ok) {
    if (api.data?.project) {
      return api.data.project;
    }
    throw new Error('Could not save repository.');
  }
  if (!api.staticFallback) {
    throw new Error(api.error || 'Could not save repository.');
  }

  const existing = readStorage<GitHubProject[]>(GITHUB_KEY, []);
  const duplicate = existing.find(
    (item) => item.htmlUrl.toLowerCase() === payload.htmlUrl.toLowerCase(),
  );
  if (duplicate) {
    throw new Error(`${duplicate.fullName} is already pinned to your portfolio.`);
  }

  const created: GitHubProject = {
    ...payload,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    addedAt: new Date().toISOString(),
  };
  writeStorage(GITHUB_KEY, [created, ...existing]);
  return created;
}

export async function syncGitHubProject(id: string): Promise<GitHubProject | null> {
  const api = await tryApiJson<{project: GitHubProject}>(`/api/github-projects/${id}/sync`, {
    method: 'POST',
  });
  if (api.ok) {
    return api.data?.project ?? null;
  }
  if (!api.staticFallback) {
    return null;
  }

  const existing = readStorage<GitHubProject[]>(GITHUB_KEY, []);
  const current = existing.find((item) => item.id === id);
  if (!current) {
    return null;
  }
  const fresh = await lookupGitHubRepo(current.htmlUrl);
  const updated: GitHubProject = {
    ...current,
    ...fresh,
    customHighlight: current.customHighlight,
  };
  writeStorage(
    GITHUB_KEY,
    existing.map((item) => (item.id === id ? updated : item)),
  );
  return updated;
}

export async function updateGitHubProjectHighlight(
  id: string,
  customHighlight: string,
): Promise<GitHubProject | null> {
  const api = await tryApiJson<{project: GitHubProject}>(`/api/github-projects/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({customHighlight}),
  });
  if (api.ok) {
    return api.data?.project ?? null;
  }
  if (!api.staticFallback) {
    return null;
  }

  const existing = readStorage<GitHubProject[]>(GITHUB_KEY, []);
  const current = existing.find((item) => item.id === id);
  if (!current) {
    return null;
  }
  const updated: GitHubProject = {
    ...current,
    customHighlight: customHighlight.trim() || undefined,
  };
  writeStorage(
    GITHUB_KEY,
    existing.map((item) => (item.id === id ? updated : item)),
  );
  return updated;
}

export async function deleteGitHubProject(id: string): Promise<boolean> {
  const api = await tryApiJson<{deleted: boolean}>(`/api/github-projects/${id}`, {
    method: 'DELETE',
  });
  if (api.ok) {
    return true;
  }
  if (!api.staticFallback) {
    return false;
  }
  const existing = readStorage<GitHubProject[]>(GITHUB_KEY, []);
  writeStorage(
    GITHUB_KEY,
    existing.filter((item) => item.id !== id),
  );
  return true;
}

// --- Direct Messages ---

export async function loadMessages(): Promise<DirectMessage[]> {
  const api = await tryApiJson<{messages: DirectMessage[]}>('/api/messages');
  if (api.ok && Array.isArray(api.data?.messages)) {
    writeStorage(MESSAGES_KEY, api.data.messages);
    return api.data.messages;
  }
  return readStorage<DirectMessage[]>(MESSAGES_KEY, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function submitDirectMessage(payload: {
  name: string;
  email: string;
  organization: string;
  topic: string;
  message: string;
}): Promise<DirectMessage> {
  const api = await tryApiJson<{message: DirectMessage}>('/api/messages', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  if (api.ok) {
    if (api.data?.message) {
      return api.data.message;
    }
    throw new Error('Could not send message.');
  }
  if (!api.staticFallback) {
    throw new Error(api.error || 'Could not send message.');
  }

  const existing = readStorage<DirectMessage[]>(MESSAGES_KEY, []);
  const seqNumber = String(existing.length + 1).padStart(3, '0');
  const year = new Date().getFullYear();
  const created: DirectMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    referenceCode: `MSG-${year}-${seqNumber}`,
    name: payload.name,
    email: payload.email,
    organization: payload.organization,
    topic: payload.topic,
    message: payload.message,
    status: 'unread',
    createdAt: new Date().toISOString(),
  };
  writeStorage(MESSAGES_KEY, [created, ...existing]);
  return created;
}

export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<DirectMessage | null> {
  const api = await tryApiJson<{message: DirectMessage}>(`/api/messages/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({status}),
  });
  if (api.ok) {
    return api.data?.message ?? null;
  }
  if (!api.staticFallback) {
    return null;
  }
  const existing = readStorage<DirectMessage[]>(MESSAGES_KEY, []);
  const target = existing.find((item) => item.id === id);
  if (!target) {
    return null;
  }
  const updated = {...target, status};
  writeStorage(
    MESSAGES_KEY,
    existing.map((item) => (item.id === id ? updated : item)),
  );
  return updated;
}

export async function deleteDirectMessage(id: string): Promise<boolean> {
  const api = await tryApiJson<{deleted: boolean}>(`/api/messages/${id}`, {
    method: 'DELETE',
  });
  if (api.ok) {
    return true;
  }
  if (!api.staticFallback) {
    return false;
  }
  const existing = readStorage<DirectMessage[]>(MESSAGES_KEY, []);
  writeStorage(
    MESSAGES_KEY,
    existing.filter((item) => item.id !== id),
  );
  return true;
}
