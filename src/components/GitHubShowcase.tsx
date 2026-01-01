import {useState} from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  GitFork,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from 'lucide-react';
import type {GitHubProject} from '../types/portfolio';
import {addGitHubProject, lookupGitHubRepo} from '../lib/portfolioApi';
import {DecoderText} from './DecoderText';

interface GitHubShowcaseProps {
  projects: GitHubProject[];
  loading: boolean;
  error: string | null;
  onOpenAddModal: () => void;
  onProjectAdded: (project: GitHubProject) => void;
  onSyncProject: (id: string) => Promise<void>;
  onUpdateHighlight: (id: string, customHighlight: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export function GitHubShowcase({
  projects,
  loading,
  error,
  onOpenAddModal,
  onProjectAdded,
  onSyncProject,
  onUpdateHighlight,
  onDeleteProject,
}: GitHubShowcaseProps) {
  const [quickInput, setQuickInput] = useState('');
  const [quickImporting, setQuickImporting] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftHighlight, setDraftHighlight] = useState('');

  const handleQuickImport = async () => {
    const trimmed = quickInput.trim();
    if (!trimmed) {
      setQuickError('Enter a GitHub URL or "owner/repo".');
      return;
    }

    setQuickError(null);
    setQuickImporting(true);
    try {
      const repo = await lookupGitHubRepo(trimmed);
      const saved = await addGitHubProject(repo);
      onProjectAdded(saved);
      setQuickInput('');
    } catch (err) {
      setQuickError(
        err instanceof Error ? err.message : 'Could not import repository.',
      );
    } finally {
      setQuickImporting(false);
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await onSyncProject(id);
    } finally {
      setSyncingId(null);
    }
  };

  const startEdit = (project: GitHubProject) => {
    setEditingId(project.id);
    setDraftHighlight(project.customHighlight ?? '');
  };

  const saveEdit = async (id: string) => {
    await onUpdateHighlight(id, draftHighlight);
    setEditingId(null);
  };

  return (
    <section
      id="github"
      className="border-t border-white/[0.06] bg-[#111111] px-6 py-24 sm:px-12 lg:px-20"
    >
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="inline-block h-[2px] w-16 bg-[#00E5FF]" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#00E5FF]">
                GitHub
              </span>
            </div>

            <h2
              className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{textWrap: 'balance'}}
            >
              <DecoderText text="Open-source & pinned repositories" />
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="chamfer-btn inline-flex min-h-[44px] items-center gap-2 bg-[#00E5FF] px-5 py-2.5 text-xs font-bold text-[#111111] whitespace-nowrap shrink-0 self-start sm:self-auto transition-colors hover:bg-[#38EDFF]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add GitHub Project</span>
          </button>
        </div>

        {loading ? (
          <div className="mt-10 py-6 font-mono text-xs text-[#8A8A94]">
            Loading repositories...
          </div>
        ) : error ? (
          <div className="mt-10 flex items-center gap-2 text-sm text-[#FCA5A5]">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-10 border border-white/10 bg-[#161618] p-6 sm:p-8">
            <p className="text-sm text-[#C4C4CC] sm:text-base">
              Paste any public GitHub repository URL or{' '}
              <span className="font-mono text-[#00E5FF]">owner/repo</span> below to pin it to
              your portfolio with live star and fork metadata.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                aria-label="GitHub repository URL or owner/repo"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleQuickImport();
                  }
                }}
                placeholder="https://github.com/username/project"
                className="min-h-[46px] flex-1 border-b border-white/20 bg-[#111111] px-4 py-2.5 font-mono text-xs text-white placeholder:text-[#6B6B76] focus:border-[#00E5FF] focus:outline-none"
              />
              <button
                type="button"
                disabled={quickImporting}
                onClick={() => void handleQuickImport()}
                className="chamfer-btn inline-flex min-h-[46px] items-center justify-center bg-[#00E5FF] px-6 py-2.5 text-xs font-bold text-[#111111] whitespace-nowrap shrink-0 hover:bg-[#38EDFF] disabled:opacity-60"
              >
                {quickImporting ? 'Importing...' : 'Import Repo'}
              </button>
            </div>

            {quickError && (
              <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs text-[#FCA5A5]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{quickError}</span>
              </p>
            )}

            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-5 font-mono text-xs font-medium text-[#8A8A94] transition-colors hover:text-[#00E5FF]"
            >
              Or browse all repos by GitHub username →
            </button>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {projects.map((project, index) => {
              const code = String(index + 1).padStart(2, '0');
              const isEditing = editingId === project.id;

              return (
                <article key={project.id} className="py-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-[#8A8A94] tabular-nums">
                        <span className="text-[#00E5FF] font-semibold">{code}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-white">{project.language}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3" aria-hidden="true" />
                          <span>{project.stars}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="h-3 w-3" aria-hidden="true" />
                          <span>{project.forks}</span>
                        </span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-white">
                        {project.fullName}
                      </h3>

                      <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-[#C4C4CC]">
                        {project.description}
                      </p>

                      {isEditing ? (
                        <div className="mt-3 max-w-xl space-y-2 border border-white/15 bg-[#161618] p-3">
                          <textarea
                            rows={2}
                            value={draftHighlight}
                            onChange={(e) => setDraftHighlight(e.target.value)}
                            placeholder="Add a short personal note about this repo..."
                            className="w-full border-b border-white/20 bg-[#111111] px-3 py-2 text-xs text-white focus:border-[#00E5FF] focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 text-xs text-[#8A8A94] hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void saveEdit(project.id)}
                              className="chamfer-btn inline-flex items-center gap-1 bg-[#00E5FF] px-3.5 py-1.5 text-xs font-bold text-[#111111]"
                            >
                              <Check className="h-3 w-3" aria-hidden="true" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        project.customHighlight && (
                          <p className="mt-2 font-mono text-xs text-[#00E5FF]">
                            {project.customHighlight}
                          </p>
                        )
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {project.homepage && (
                        <a
                          href={project.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[36px] items-center gap-1 font-mono text-xs font-medium text-[#C4C4CC] transition-colors hover:text-[#00E5FF]"
                        >
                          <span>Demo</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                      <a
                        href={project.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[36px] items-center gap-1 font-mono text-xs font-semibold text-white transition-colors hover:text-[#00E5FF]"
                      >
                        <span>GitHub</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>

                      <button
                        type="button"
                        disabled={syncingId === project.id}
                        onClick={() => void handleSync(project.id)}
                        aria-label={`Sync stats for ${project.fullName}`}
                        className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#161618] text-[#C4C4CC] transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${syncingId === project.id ? 'animate-spin' : ''}`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        aria-label={`Edit note for ${project.fullName}`}
                        className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#161618] text-[#C4C4CC] transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteProject(project.id)}
                        aria-label={`Remove ${project.fullName}`}
                        className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#161618] text-[#C4C4CC] transition-colors hover:border-[#F87171] hover:text-[#F87171]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
