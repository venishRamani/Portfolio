import {useEffect, useState} from 'react';
import {ArrowDown} from 'lucide-react';
import type {ProfileData} from '../types/portfolio';
import {DecoderText} from './DecoderText';
import {DisplacementSphere} from './three/DisplacementSphere';

interface IntroHeroProps {
  profile: ProfileData;
  onScrollToProject: () => void;
}

const DISCIPLINES = ['Full-Stack', 'React & Node', 'APIs & UI'];

export function IntroHero({profile, onScrollToProject}: IntroHeroProps) {
  const [disciplineIndex, setDisciplineIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      return;
    }
    const timer = setInterval(() => {
      setDisciplineIndex((prev) => (prev + 1) % DISCIPLINES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const currentDiscipline = DISCIPLINES[disciplineIndex];

  return (
    <section
      id="intro"
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#111111] px-6 pt-24 pb-20 sm:px-12 lg:px-20"
    >
      <DisplacementSphere />

      <div className="relative z-10 mx-auto w-full max-w-[1120px]">
        <header className="max-w-3xl">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.34em] text-[#C4C4CC] sm:text-sm">
            <DecoderText text={profile.name.toUpperCase()} delay={120} />
          </p>

          <h1
            className="mt-6 font-display text-[2.85rem] font-bold leading-[1.04] tracking-[-0.03em] text-white sm:text-7xl lg:text-[5.5rem]"
            style={{textWrap: 'balance'}}
          >
            <span className="block">Web Developer</span>
            <span className="mt-2 flex flex-wrap items-center gap-4 text-[#C4C4CC]">
              <span aria-hidden="true" className="font-light text-[#8A8A94]">
                +
              </span>
              <button
                type="button"
                onClick={() =>
                  setDisciplineIndex((prev) => (prev + 1) % DISCIPLINES.length)
                }
                title="Click to cycle focus"
                className="group relative inline-flex items-center text-left text-white transition-colors hover:text-[#00E5FF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00E5FF]"
              >
                <DecoderText key={currentDiscipline} text={currentDiscipline} />
              </button>
              <span
                aria-hidden="true"
                className="hidden h-[2px] flex-1 max-w-[160px] bg-white/20 sm:inline-block"
              />
            </span>
          </h1>

          <p className="mt-8 max-w-[54ch] text-base leading-relaxed text-[#C4C4CC] sm:text-lg">
            {profile.headline}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="#project-1"
              onClick={(e) => {
                e.preventDefault();
                onScrollToProject();
              }}
              className="chamfer-btn inline-flex min-h-[48px] items-center gap-3 bg-[#00E5FF] px-6 py-3 text-sm font-bold text-[#111111] whitespace-nowrap shrink-0 transition-transform hover:translate-y-[-1px] hover:bg-[#38EDFF]"
            >
              <span>View Projects</span>
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href="#github"
              className="group inline-flex min-h-[44px] items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#C4C4CC] transition-colors hover:text-white"
            >
              <span>GitHub Repositories</span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-hover:translate-x-1 text-[#00E5FF]"
              >
                →
              </span>
            </a>
          </div>
        </header>
      </div>

      {/* Bottom Scroll Indicator */}
      <a
        href="#project-1"
        onClick={(e) => {
          e.preventDefault();
          onScrollToProject();
        }}
        aria-label="Scroll to featured projects"
        className="group absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[#8A8A94] transition-colors hover:text-[#00E5FF] sm:flex"
      >
        <span className="h-9 w-[1px] bg-white/20 transition-colors group-hover:bg-[#00E5FF]" />
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
}
