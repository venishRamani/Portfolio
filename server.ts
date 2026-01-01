import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import type {
  DirectMessage,
  GitHubProject,
  GitHubRepoPreview,
  MessageStatus,
  ProfileData,
} from './src/types/portfolio.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const GITHUB_PROJECTS_FILE = path.join(DATA_DIR, 'github-projects.json');

const DEFAULT_PROFILE: ProfileData = {
  name: 'Venish Ramani',
  role: 'Full-Stack Web Developer',
  location: 'Bengaluru, India',
  email: 'ramanivenish2004@gmail.com',
  headline: 'Building fast, clean web apps from API to interface.',
  bio: 'I’m a web developer specializing in React, Node.js, and RESTful APIs. I focus on clean component architecture, accessible layouts, and reliable backend services.',
  heroImage: '/src/assets/images/hero_studio_portrait_1795082543886.jpg',
  heroImageAlt: 'Web developer workspace with laptop and notebooks',
};

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
}

function readJsonObject<T>(filePath: string, fallback: T): T {
  ensureDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonData<T>(filePath: string, data: T): void {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

async function fetchGitHubApi(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'venish-ramani-web-portfolio',
    },
  });
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({limit: '1mb'}));

  app.get('/api/health', (_req, res) => {
    res.json({ok: true});
  });

  // --- Profile API ---
  app.get('/api/profile', (_req, res) => {
    const profile = readJsonObject<ProfileData>(PROFILE_FILE, DEFAULT_PROFILE);
    res.json({profile});
  });

  app.put('/api/profile', (req, res) => {
    const current = readJsonObject<ProfileData>(PROFILE_FILE, DEFAULT_PROFILE);
    const body = req.body ?? {};

    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : current.name;
    const role = typeof body.role === 'string' && body.role.trim() ? body.role.trim() : current.role;
    const location =
      typeof body.location === 'string' && body.location.trim()
        ? body.location.trim()
        : current.location;
    const email =
      typeof body.email === 'string' && isValidEmail(body.email.trim())
        ? body.email.trim()
        : current.email;
    const headline =
      typeof body.headline === 'string' && body.headline.trim()
        ? body.headline.trim()
        : current.headline;
    const bio = typeof body.bio === 'string' && body.bio.trim() ? body.bio.trim() : current.bio;

    const updated: ProfileData = {
      ...current,
      name,
      role,
      location,
      email,
      headline,
      bio,
    };

    writeJsonData(PROFILE_FILE, updated);
    res.json({profile: updated});
  });

  // --- Direct Messages API ---
  app.get('/api/messages', (_req, res) => {
    const messages = readJsonObject<DirectMessage[]>(MESSAGES_FILE, []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    res.json({messages});
  });

  app.post('/api/messages', (req, res) => {
    const body = req.body ?? {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const organization = typeof body.organization === 'string' ? body.organization.trim() : '';
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const referenceProject =
      typeof body.referenceProject === 'string' && body.referenceProject.trim()
        ? body.referenceProject.trim()
        : undefined;

    if (!name || name.length < 2) {
      res.status(400).json({error: 'Please share your name (at least 2 characters).'});
      return;
    }
    if (!email || !isValidEmail(email)) {
      res.status(400).json({error: 'Please enter a valid email address so I can reply directly.'});
      return;
    }
    if (!topic) {
      res.status(400).json({error: 'Please select a topic for your note.'});
      return;
    }
    if (!message || message.length < 10) {
      res.status(400).json({error: 'Please write a short message (at least 10 characters).'});
      return;
    }

    const existing = readJsonObject<DirectMessage[]>(MESSAGES_FILE, []);
    const seqNumber = String(existing.length + 1).padStart(3, '0');
    const year = new Date().getFullYear();

    const newMessage: DirectMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      referenceCode: `MSG-${year}-${seqNumber}`,
      name,
      email,
      organization,
      topic,
      message,
      referenceProject,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    existing.push(newMessage);
    writeJsonData(MESSAGES_FILE, existing);
    res.status(201).json({message: newMessage});
  });

  app.patch('/api/messages/:id', (req, res) => {
    const {id} = req.params;
    const status = req.body?.status as MessageStatus | undefined;
    if (status !== 'unread' && status !== 'read' && status !== 'replied') {
      res.status(400).json({error: 'Invalid status value.'});
      return;
    }

    const messages = readJsonObject<DirectMessage[]>(MESSAGES_FILE, []);
    const index = messages.findIndex((item) => item.id === id);
    if (index === -1) {
      res.status(404).json({error: 'Message not found.'});
      return;
    }

    messages[index] = {...messages[index], status};
    writeJsonData(MESSAGES_FILE, messages);
    res.json({message: messages[index]});
  });

  app.delete('/api/messages/:id', (req, res) => {
    const {id} = req.params;
    const messages = readJsonObject<DirectMessage[]>(MESSAGES_FILE, []);
    const filtered = messages.filter((item) => item.id !== id);
    if (filtered.length === messages.length) {
      res.status(404).json({error: 'Message not found.'});
      return;
    }
    writeJsonData(MESSAGES_FILE, filtered);
    res.json({deleted: true});
  });

  // --- GitHub Live Lookup & Portfolio Persistence API ---
  app.get('/api/github/user', async (req, res) => {
    const username = typeof req.query.username === 'string' ? req.query.username.trim() : '';
    if (!username || !/^[A-Za-z0-9-]+$/.test(username)) {
      res.status(400).json({error: 'Please enter a valid GitHub username.'});
      return;
    }

    try {
      const ghRes = await fetchGitHubApi(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=18`,
      );
      if (ghRes.status === 404) {
        res.status(404).json({error: `GitHub user "${username}" was not found.`});
        return;
      }
      if (ghRes.status === 403) {
        res.status(429).json({
          error: 'GitHub API rate limit reached. You can still add repositories manually.',
        });
        return;
      }
      if (!ghRes.ok) {
        res.status(502).json({error: 'Unable to fetch repositories from GitHub right now.'});
        return;
      }

      const rawRepos = (await ghRes.json()) as RawGitHubRepo[];
      const repos = Array.isArray(rawRepos)
        ? rawRepos.filter((r) => !r.fork).map(mapGitHubRepo)
        : [];
      res.json({repos});
    } catch {
      res.status(502).json({error: 'Network error contacting GitHub API.'});
    }
  });

  app.get('/api/github/repo', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    const parsed = parseGitHubRepoInput(rawUrl);
    if (!parsed) {
      res.status(400).json({
        error: 'Enter a repository as "owner/repo" or "https://github.com/owner/repo".',
      });
      return;
    }

    try {
      const ghRes = await fetchGitHubApi(
        `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
      );
      if (ghRes.status === 404) {
        res.status(404).json({
          error: `Repository "${parsed.owner}/${parsed.repo}" was not found or is private.`,
        });
        return;
      }
      if (ghRes.status === 403) {
        res.status(429).json({
          error: 'GitHub API rate limit reached. You can still add the repository manually.',
        });
        return;
      }
      if (!ghRes.ok) {
        res.status(502).json({error: 'Failed to load repository details from GitHub.'});
        return;
      }

      const rawRepo = (await ghRes.json()) as RawGitHubRepo;
      res.json({repo: mapGitHubRepo(rawRepo)});
    } catch {
      res.status(502).json({error: 'Network error contacting GitHub API.'});
    }
  });

  app.get('/api/github-projects', (_req, res) => {
    const projects = readJsonObject<GitHubProject[]>(GITHUB_PROJECTS_FILE, []).sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );
    res.json({projects});
  });

  app.post('/api/github-projects', (req, res) => {
    const body = req.body ?? {};
    const htmlUrl = typeof body.htmlUrl === 'string' ? body.htmlUrl.trim() : '';
    const repo = typeof body.repo === 'string' ? body.repo.trim() : '';
    const owner = typeof body.owner === 'string' ? body.owner.trim() : '';
    const fullName =
      typeof body.fullName === 'string' && body.fullName.trim()
        ? body.fullName.trim()
        : owner && repo
          ? `${owner}/${repo}`
          : repo;

    if (!htmlUrl || !/^https?:\/\/github\.com\/.+/i.test(htmlUrl)) {
      res.status(400).json({error: 'Please provide a valid GitHub repository URL.'});
      return;
    }
    if (!fullName) {
      res.status(400).json({error: 'Please provide a repository name.'});
      return;
    }

    const existing = readJsonObject<GitHubProject[]>(GITHUB_PROJECTS_FILE, []);
    const duplicate = existing.find(
      (item) => item.htmlUrl.toLowerCase() === htmlUrl.toLowerCase(),
    );
    if (duplicate) {
      res.status(409).json({error: `${duplicate.fullName} is already pinned to your portfolio.`});
      return;
    }

    const newProject: GitHubProject = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      owner: owner || fullName.split('/')[0] || 'github',
      repo: repo || fullName.split('/')[1] || fullName,
      fullName,
      htmlUrl,
      homepage:
        typeof body.homepage === 'string' && body.homepage.trim()
          ? body.homepage.trim()
          : undefined,
      description:
        typeof body.description === 'string' && body.description.trim()
          ? body.description.trim()
          : 'Open-source repository.',
      language:
        typeof body.language === 'string' && body.language.trim() ? body.language.trim() : 'Code',
      stars: typeof body.stars === 'number' && body.stars >= 0 ? body.stars : 0,
      forks: typeof body.forks === 'number' && body.forks >= 0 ? body.forks : 0,
      topics: Array.isArray(body.topics)
        ? body.topics.filter((t: unknown): t is string => typeof t === 'string').slice(0, 6)
        : [],
      updatedAt:
        typeof body.updatedAt === 'string' && body.updatedAt.trim()
          ? body.updatedAt
          : new Date().toISOString(),
      customHighlight:
        typeof body.customHighlight === 'string' && body.customHighlight.trim()
          ? body.customHighlight.trim()
          : undefined,
      addedAt: new Date().toISOString(),
    };

    existing.push(newProject);
    writeJsonData(GITHUB_PROJECTS_FILE, existing);
    res.status(201).json({project: newProject});
  });

  app.patch('/api/github-projects/:id', (req, res) => {
    const {id} = req.params;
    const body = req.body ?? {};
    const projects = readJsonObject<GitHubProject[]>(GITHUB_PROJECTS_FILE, []);
    const index = projects.findIndex((item) => item.id === id);
    if (index === -1) {
      res.status(404).json({error: 'GitHub project not found.'});
      return;
    }

    const current = projects[index];
    const updated: GitHubProject = {
      ...current,
      description:
        typeof body.description === 'string' ? body.description.trim() : current.description,
      homepage:
        typeof body.homepage === 'string'
          ? body.homepage.trim() || undefined
          : current.homepage,
      language: typeof body.language === 'string' ? body.language.trim() : current.language,
      customHighlight:
        typeof body.customHighlight === 'string'
          ? body.customHighlight.trim() || undefined
          : current.customHighlight,
    };

    projects[index] = updated;
    writeJsonData(GITHUB_PROJECTS_FILE, projects);
    res.json({project: updated});
  });

  app.post('/api/github-projects/:id/sync', async (req, res) => {
    const {id} = req.params;
    const projects = readJsonObject<GitHubProject[]>(GITHUB_PROJECTS_FILE, []);
    const index = projects.findIndex((item) => item.id === id);
    if (index === -1) {
      res.status(404).json({error: 'GitHub project not found.'});
      return;
    }

    const current = projects[index];
    const parsed = parseGitHubRepoInput(current.htmlUrl);
    if (!parsed) {
      res.status(400).json({error: 'Invalid GitHub URL on record.'});
      return;
    }

    try {
      const ghRes = await fetchGitHubApi(
        `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
      );
      if (!ghRes.ok) {
        res.status(502).json({error: 'Could not refresh live stats from GitHub.'});
        return;
      }
      const rawRepo = (await ghRes.json()) as RawGitHubRepo;
      const mapped = mapGitHubRepo(rawRepo);
      projects[index] = {
        ...current,
        ...mapped,
        customHighlight: current.customHighlight,
      };
      writeJsonData(GITHUB_PROJECTS_FILE, projects);
      res.json({project: projects[index]});
    } catch {
      res.status(502).json({error: 'Network error syncing repository.'});
    }
  });

  app.delete('/api/github-projects/:id', (req, res) => {
    const {id} = req.params;
    const projects = readJsonObject<GitHubProject[]>(GITHUB_PROJECTS_FILE, []);
    const filtered = projects.filter((item) => item.id !== id);
    if (filtered.length === projects.length) {
      res.status(404).json({error: 'GitHub project not found.'});
      return;
    }
    writeJsonData(GITHUB_PROJECTS_FILE, filtered);
    res.json({deleted: true});
  });

  if (process.env.NODE_ENV !== 'production') {
    const {createServer} = await import('vite');
    const vite = await createServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
