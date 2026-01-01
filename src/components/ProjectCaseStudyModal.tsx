import {useEffect} from 'react';
import {ArrowUpRight, CheckCircle2, Github, X} from 'lucide-react';
import type {FeaturedProject} from '../data/featuredProjects';
import {ResilientImage} from './ResilientImage';

interface ProjectCaseStudyModalProps {
  project: FeaturedProject | null;
  onClose: () => void;
  onInquire: () => void;
}

export function ProjectCaseStudyModal({
  project,
  onClose,
  onInquire,
}: ProjectCaseStudyModalProps) {
  useEffect(() => {
    if (!project) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  if (!project) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border border-white/15 bg-[#161618] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3 font-mono text-xs text-[#C4C4CC] tabular-nums">
            <span className="text-[#00E5FF] font-semibold">{project.index}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{project.subtitle}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close case study"
            className="inline-flex h-10 w-10 items-center justify-center border border-white/15 bg-[#111111] text-white transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="aspect-[16/9] w-full overflow-hidden border border-white/10 bg-[#111111]">
            <ResilientImage
              src={project.screenTexture}
              alt={project.title}
              fallbackTitle={project.title}
              className="h-full w-full object-cover"
            />
          </div>

          <h2
            id="case-study-title"
            className="mt-6 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            {project.title}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-[#C4C4CC] sm:text-base">
            {project.architectureSummary}
          </p>

          <div className="mt-6 border-t border-white/10 pt-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-[#00E5FF]">
              Engineering Highlights
            </h3>
            <ul className="mt-3 space-y-2.5">
              {project.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-[#E4E4E7]"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#00E5FF]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="font-mono text-xs text-[#8A8A94]">
              Stack: <span className="text-white">{project.stack.join(' · ')}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 border border-[#00E5FF]/50 bg-[#111111] px-4 py-2 font-mono text-xs font-semibold text-[#00E5FF] transition-colors hover:border-[#00E5FF] hover:bg-[#00E5FF]/10"
                >
                  <span>Live Demo</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 border border-white/15 bg-[#111111] px-4 py-2 font-mono text-xs font-semibold text-white transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span>Source Code</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onInquire();
              }}
              className="chamfer-btn inline-flex min-h-[44px] items-center gap-2 bg-[#00E5FF] px-5 py-2.5 text-xs font-bold text-[#111111] transition-colors hover:bg-[#38EDFF]"
            >
              <span>Discuss Similar Build</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
