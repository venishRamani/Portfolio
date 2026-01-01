import type {ProfileData} from '../types/portfolio';

interface FooterProps {
  profile: ProfileData;
  onOpenInbox: () => void;
}

export function Footer({profile, onOpenInbox}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-[#111111] px-6 py-10 sm:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-xs text-[#8A8A94] tabular-nums">
          © {year} {profile.name} · {profile.location}
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-[#8A8A94]">
          <a href="#project-1" className="transition-colors hover:text-[#00E5FF]">
            Projects
          </a>
          <a href="#github" className="transition-colors hover:text-[#00E5FF]">
            GitHub
          </a>
          <a href={`mailto:${profile.email}`} className="transition-colors hover:text-[#00E5FF]">
            {profile.email}
          </a>
          <button
            type="button"
            onClick={onOpenInbox}
            className="font-semibold text-white transition-colors hover:text-[#00E5FF]"
          >
            Message Log
          </button>
        </div>
      </div>
    </footer>
  );
}
