import {useEffect, useState, type FormEvent} from 'react';
import {AlertCircle, Check, GitFork, Search, Star, X} from 'lucide-react';
import type {GitHubProject, GitHubRepoPreview} from '../types/portfolio';
import {
  addGitHubProject,
  lookupGitHubRepo,
  lookupGitHubUserRepos,
} from '../lib/portfolioApi';

interface AddGitHubProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUrls: string[];
  onProjectAdded: (project: GitHubProject) => void;
}

type ModalTab = 'url' | 'username' | 'manual';

export function AddGitHubProjectModal({
  isOpen,
  onClose,
  existingUrls,
  onProjectAdded,
}: AddGitHubProjectModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('url');
  const [error, setError] = useState<string | null>(null);

  const [repoUrlInput, setRepoUrlInput] = useState('');
  const [urlHighlight, setUrlHighlight] = useState('');
  const [urlPreview, setUrlPreview] = useState<GitHubRepoPreview | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const [usernameInput, setUsernameInput] = useState('');
  const [userRepos, setUserRepos] = useState<GitHubRepoPreview[]>([]);
  const [fetchingUser, setFetchingUser] = useState(false);

  const [manualFullName, setManualFullName] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualHomepage, setManualHomepage] = useState('');
  const [manualLanguage, setManualLanguage] = useState('TypeScript');
  const [manualDescription, setManualDescription] = useState('');
  const [manualHighlight, setManualHighlight] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const normalizedExisting = existingUrls.map((u) => u.toLowerCase());

  const handleLookupRepoUrl = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setUrlPreview(null);
    if (!repoUrlInput.trim()) {
      setError('Enter a repository URL or "owner/repo".');
      return;
    }
    setFetchingUrl(true);
    try {
      const repo = await lookupGitHubRepo(repoUrlInput.trim());
      setUrlPreview(repo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not find that repository on GitHub.',
      );
    } finally {
      setFetchingUrl(false);
    }
  };

  const handlePinRepo = async (repo: GitHubRepoPreview, customHighlight?: string) => {
    setError(null);
    setSaving(true);
    try {
      const saved = await addGitHubProject({
        ...repo,
        customHighlight: customHighlight?.trim() || undefined,
      });
      onProjectAdded(saved);
      if (activeTab === 'url') {
        setRepoUrlInput('');
        setUrlHighlight('');
        setUrlPreview(null);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save repository.');
    } finally {
      setSaving(false);
    }
  };

  const handleLookupUsername = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = usernameInput.trim().replace(/^@/, '');
    if (!cleaned) {
      setError('Enter your GitHub username.');
      return;
    }
    setFetchingUser(true);
    try {
      const repos = await lookupGitHubUserRepos(cleaned);
      setUserRepos(repos);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not fetch repositories for that user.',
      );
      setUserRepos([]);
    } finally {
      setFetchingUser(false);
    }
  };

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!manualFullName.trim() || !manualUrl.trim()) {
      setError('Repository name and GitHub URL are required.');
      return;
    }
    const parts = manualFullName.trim().split('/');
    const repoObj: GitHubRepoPreview = {
      owner: parts.length > 1 ? parts[0] : 'github',
      repo: parts.length > 1 ? parts[1] : parts[0],
      fullName: manualFullName.trim(),
      htmlUrl: manualUrl.trim(),
      homepage: manualHomepage.trim() || undefined,
      description: manualDescription.trim() || 'Open-source repository.',
      language: manualLanguage.trim() || 'Code',
      stars: 0,
      forks: 0,
      topics: [],
      updatedAt: new Date().toISOString(),
    };
    await handlePinRepo(repoObj, manualHighlight);
    setManualFullName('');
    setManualUrl('');
    setManualHomepage('');
    setManualDescription('');
    setManualHighlight('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-github-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-white/15 bg-[#161618] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            <h2 id="add-github-title" className="font-mono text-sm font-semibold text-white">
              Add GitHub Project
            </h2>
            <p className="text-xs text-[#8A8A94]">
              Import live metadata from GitHub or enter repository details manually.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#111111] text-white transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 bg-[#111111] px-6 py-3">
          <div className="inline-flex flex-wrap gap-1 border border-white/10 bg-[#161618] p-1">
            {(
              [
                {id: 'url', label: 'Import by Repo URL'},
                {id: 'username', label: 'Browse Username'},
                {id: 'manual', label: 'Manual Entry'},
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setError(null);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#00E5FF] text-[#111111]'
                    : 'text-[#8A8A94] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#F87171]/40 bg-[#7F1D1D]/30 px-4 py-3 text-xs text-[#FCA5A5]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-5">
              <form onSubmit={handleLookupRepoUrl} className="space-y-2.5">
                <label
                  htmlFor="gh-repo-url"
                  className="block font-mono text-xs text-[#9CA3AF]"
                >
                  GitHub Repository URL or owner/repo
                </label>
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <input
                    id="gh-repo-url"
                    type="text"
                    value={repoUrlInput}
                    onChange={(e) => setRepoUrlInput(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="min-h-[44px] flex-1 rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3.5 py-2.5 font-mono text-xs text-[#F4F4F5] placeholder:text-[#52525B] focus:border-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={fetchingUrl}
                    className="chamfer-btn inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#00E5FF] px-5 py-2.5 text-xs font-bold text-[#111111] whitespace-nowrap shrink-0 hover:bg-[#38EDFF] disabled:opacity-60"
                  >
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{fetchingUrl ? 'Fetching...' : 'Fetch Repo'}</span>
                  </button>
                </div>
              </form>

              {urlPreview && (
                <div className="rounded-xl border border-[#23232A] bg-[#0A0A0B] p-5 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[#9CA3AF] tabular-nums">
                      <span className="text-white">{urlPreview.language}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3" aria-hidden="true" />
                        <span>{urlPreview.stars}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="h-3 w-3" aria-hidden="true" />
                        <span>{urlPreview.forks}</span>
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold text-[#F4F4F5]">
                      {urlPreview.fullName}
                    </h3>
                    <p className="mt-1 text-sm text-[#D4D4D8]">{urlPreview.description}</p>
                  </div>

                  <div>
                    <label
                      htmlFor="url-highlight"
                      className="block font-mono text-xs text-[#9CA3AF]"
                    >
                      Personal Note (Optional)
                    </label>
                    <textarea
                      id="url-highlight"
                      rows={2}
                      value={urlHighlight}
                      onChange={(e) => setUrlHighlight(e.target.value)}
                      placeholder="What did you build or learn in this project?"
                      className="mt-1.5 w-full rounded-lg border border-[#23232A] bg-[#121215] px-3.5 py-2.5 text-sm text-[#F4F4F5] placeholder:text-[#52525B] focus:border-white focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handlePinRepo(urlPreview, urlHighlight)}
                      className="chamfer-btn inline-flex min-h-[42px] items-center gap-2 bg-[#00E5FF] px-5 py-2 text-xs font-bold text-[#111111] hover:bg-[#38EDFF] disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{saving ? 'Saving...' : 'Pin to Portfolio'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'username' && (
            <div className="space-y-5">
              <form onSubmit={handleLookupUsername} className="space-y-2.5">
                <label
                  htmlFor="gh-username"
                  className="block font-mono text-xs text-[#9CA3AF]"
                >
                  GitHub Username
                </label>
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <input
                    id="gh-username"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. ramanivenish"
  
                    className="min-h-[44px] flex-1 rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3.5 py-2.5 font-mono text-xs text-[#F4F4F5] placeholder:text-[#52525B] focus:border-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={fetchingUser}
                    className="chamfer-btn inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#00E5FF] px-5 py-2.5 text-xs font-bold text-[#111111] whitespace-nowrap shrink-0 hover:bg-[#38EDFF] disabled:opacity-60"
                  >
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{fetchingUser ? 'Loading...' : 'Fetch Public Repos'}</span>
                  </button>
                </div>
              </form>

              {userRepos.length > 0 && (
                <div className="divide-y divide-[#23232A] rounded-xl border border-[#23232A] bg-[#0A0A0B]">
                  {userRepos.map((repo) => {
                    const alreadyPinned = normalizedExisting.includes(
                      repo.htmlUrl.toLowerCase(),
                    );
                    return (
                      <div
                        key={repo.htmlUrl}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="font-display text-sm font-bold text-[#F4F4F5] truncate">
                            {repo.fullName}
                          </div>
                          <p className="mt-0.5 text-xs text-[#9CA3AF] line-clamp-2">
                            {repo.description}
                          </p>
                          <div className="mt-1 font-mono text-[11px] text-[#9CA3AF] tabular-nums">
                            {repo.language} · {repo.stars} stars · {repo.forks} forks
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={alreadyPinned || saving}
                          onClick={() => void handlePinRepo(repo)}
                          className={`inline-flex min-h-[36px] items-center justify-center px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                            alreadyPinned
                              ? 'border border-white/15 bg-[#161618] text-[#8A8A94]'
                              : 'chamfer-btn bg-[#00E5FF] text-[#111111] hover:bg-[#38EDFF]'
                          }`}
                        >
                          {alreadyPinned ? 'Pinned' : 'Pin Repo'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="manual-name"
                    className="block font-mono text-xs text-[#9CA3AF]"
                  >
                    Repository Name (owner/repo) *
                  </label>
                  <input
                    id="manual-name"
                    type="text"
                    required
                    value={manualFullName}
                    onChange={(e) => setManualFullName(e.target.value)}
                    placeholder="venish/react-node-app"
                    className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3.5 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="manual-lang"
                    className="block font-mono text-xs text-[#9CA3AF]"
                  >
                    Primary Language
                  </label>
                  <input
                    id="manual-lang"
                    type="text"
                    value={manualLanguage}
                    onChange={(e) => setManualLanguage(e.target.value)}
                    placeholder="TypeScript"
                    className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3.5 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="manual-url"
                    className="block font-mono text-xs text-[#9CA3AF]"
                  >
                    GitHub URL *
                  </label>
                  <input
                    id="manual-url"
                    type="url"
                    required
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3.5 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="manual-demo"
                    className="block font-mono text-xs text-[#9CA3AF]"
                  >
                    Live Demo URL (Optional)
                  </label>
                  <input
                    id="manual-demo"
                    type="url"
                    value={manualHomepage}
                    onChange={(e) => setManualHomepage(e.target.value)}
                    placeholder="https://demo.example.com"
                    className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3.5 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="manual-desc"
                  className="block font-mono text-xs text-[#9CA3AF]"
                >
                  Short Summary
                </label>
                <textarea
                  id="manual-desc"
                  rows={2}
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="What does this web app do?"
                  className="mt-1.5 w-full rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3.5 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="manual-highlight"
                  className="block font-mono text-xs text-[#9CA3AF]"
                >
                  Personal Highlight (Optional)
                </label>
                <textarea
                  id="manual-highlight"
                  rows={2}
                  value={manualHighlight}
                  onChange={(e) => setManualHighlight(e.target.value)}
                  placeholder="Stack notes or problem solved..."
                  className="mt-1.5 w-full rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3.5 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="chamfer-btn inline-flex min-h-[42px] items-center gap-2 bg-[#00E5FF] px-6 py-2 text-xs font-bold text-[#111111] hover:bg-[#38EDFF] disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{saving ? 'Saving...' : 'Save to Portfolio'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
