import {useEffect, useState} from 'react';
import {Github, Inbox, Mail, Menu, X} from 'lucide-react';

interface NavbarProps {
  ownerName: string;
  ownerEmail: string;
  messageCount: number;
  onContactClick: () => void;
  onOpenInbox: () => void;
}

const NAV_ITEMS = [
  {id: 'project-1', label: 'Projects'},
  {id: 'github', label: 'GitHub'},
  {id: 'about', label: 'About'},
  {id: 'contact', label: 'Contact'},
];

function MonogramMark() {
  return (
    <svg
      width="34"
      height="28"
      viewBox="0 0 36 30"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200 group-hover:scale-105"
    >
      <path
        d="M3 4L14.5 26H19.5L8 4H3Z"
        fill="currentColor"
      />
      <path
        d="M21 4L16.5 13L19.5 18.5L27 4H21Z"
        fill="#00E5FF"
      />
      <path
        d="M28.5 4L33 4L29 12H24.5L28.5 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Navbar({
  ownerName,
  ownerEmail,
  messageCount,
  onContactClick,
  onOpenInbox,
}: NavbarProps) {
  const [activeId, setActiveId] = useState<string>('intro');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const ids = ['intro', 'project-1', 'project-2', 'project-3', 'github', 'about', 'contact'];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          const id = visible.target.id;
          if (id === 'project-2' || id === 'project-3') {
            setActiveId('project-1');
          } else {
            setActiveId(id);
          }
        }
      },
      {rootMargin: '-28% 0px -45% 0px', threshold: [0.15, 0.45]},
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavJump = (id: string) => {
    setMobileOpen(false);
    if (id === 'contact') {
      onContactClick();
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({behavior: 'smooth'});
    }
  };

  return (
    <>
      {/* Desktop Fixed Left Vertical Rail (hamishw.com signature chrome) */}
      <aside
        aria-label="Primary navigation"
        className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-center justify-between border-r border-white/[0.06] bg-[#111111]/95 py-8 md:flex"
      >
        <a
          href="#intro"
          aria-label={`${ownerName} home`}
          onClick={(e) => {
            e.preventDefault();
            handleNavJump('intro');
          }}
          className="group flex h-11 w-11 items-center justify-center text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00E5FF]"
        >
          <MonogramMark />
        </a>

        <nav className="flex flex-col items-center gap-6" aria-label="Section links">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavJump(item.id);
                }}
                aria-current={isActive ? 'location' : undefined}
                className={`vertical-nav-link relative py-1.5 font-sans text-xs font-medium tracking-[0.08em] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00E5FF] ${
                  isActive ? 'text-white' : 'text-[#8A8A94] hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-[#00E5FF]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-3">
          <a
            href="https://github.com/ramanivenish"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="flex h-10 w-10 items-center justify-center text-[#8A8A94] transition-colors hover:text-[#00E5FF]"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
          </a>

          <a
            href={`mailto:${ownerEmail}`}
            aria-label={`Email ${ownerEmail}`}
            className="flex h-10 w-10 items-center justify-center text-[#8A8A94] transition-colors hover:text-[#00E5FF]"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={onOpenInbox}
            aria-label={`Open message log (${messageCount} messages)`}
            className="relative flex h-10 w-10 items-center justify-center text-[#8A8A94] transition-colors hover:text-[#00E5FF]"
          >
            <Inbox className="h-4 w-4" aria-hidden="true" />
            {messageCount > 0 && (
              <span className="absolute right-1.5 top-1.5 font-mono text-[9px] font-semibold text-[#00E5FF] tabular-nums">
                {messageCount}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#111111]/95 px-5 md:hidden">
        <a
          href="#intro"
          onClick={(e) => {
            e.preventDefault();
            handleNavJump('intro');
          }}
          aria-label={`${ownerName} home`}
          className="group flex min-h-[44px] items-center gap-3 text-white"
        >
          <MonogramMark />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#C4C4CC]">
            {ownerName}
          </span>
        </a>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex h-11 w-11 items-center justify-center text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Full-Screen Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-30 flex flex-col justify-between bg-[#111111] px-8 pt-24 pb-10 md:hidden"
        >
          <nav className="flex flex-col gap-5">
            {NAV_ITEMS.map((item, idx) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavJump(item.id);
                }}
                className="flex items-baseline gap-4 border-b border-white/[0.08] pb-4 font-display text-2xl font-bold text-white"
              >
                <span className="font-mono text-xs text-[#00E5FF] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenInbox();
              }}
              className="chamfer-btn inline-flex min-h-[44px] items-center gap-2 bg-[#00E5FF] px-5 py-2.5 text-xs font-bold text-[#111111]"
            >
              <Inbox className="h-4 w-4" aria-hidden="true" />
              <span>Message Log ({messageCount})</span>
            </button>

            <a
              href={`mailto:${ownerEmail}`}
              className="inline-flex min-h-[44px] items-center gap-2 border border-white/15 px-4 py-2 text-xs font-medium text-white"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Email</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
