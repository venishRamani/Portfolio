import {Pencil} from 'lucide-react';
import type {ProfileData} from '../types/portfolio';
import {DecoderText} from './DecoderText';
import {ResilientImage} from './ResilientImage';

interface AboutSectionProps {
  profile: ProfileData;
  onEditProfile: () => void;
  onContactClick: () => void;
}

export function AboutSection({
  profile,
  onEditProfile,
  onContactClick,
}: AboutSectionProps) {
  return (
    <section
      id="about"
      className="border-t border-white/[0.06] bg-[#141417] px-6 py-24 sm:px-12 lg:px-20"
    >
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 items-center gap-14 lg:grid-cols-12">
        {/* Left Bio Column */}
        <div className="lg:col-span-6">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="inline-block h-[2px] w-16 bg-[#00E5FF]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#00E5FF]">
              About
            </span>
          </div>

          <h2
            className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{textWrap: 'balance'}}
          >
            <DecoderText text="Hi there" />
          </h2>

          <p className="mt-5 text-base leading-relaxed text-[#C4C4CC]">
            I’m <span className="font-semibold text-white">{profile.name}</span>, a{' '}
            <span className="text-white">{profile.role}</span> based in {profile.location}.{' '}
            {profile.bio}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-[#8A8A94]">
            My day-to-day toolkit spans React, TypeScript, Node.js, Express, PostgreSQL, and
            RESTful API design—turning complex requirements into fast, accessible web
            experiences.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={onContactClick}
              className="chamfer-btn group inline-flex min-h-[46px] items-center gap-2.5 bg-[#00E5FF] px-6 py-3 text-sm font-bold text-[#111111] whitespace-nowrap shrink-0 transition-colors hover:bg-[#38EDFF]"
            >
              <span>Send me a message</span>
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </button>

            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex min-h-[44px] items-center gap-2 border border-white/15 bg-[#111111] px-4 py-2 font-mono text-xs font-medium text-[#C4C4CC] whitespace-nowrap shrink-0 transition-colors hover:border-[#00E5FF] hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Right Portrait Frame */}
        <div className="lg:col-span-6">
          <div className="relative mx-auto max-w-md lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -right-3 -bottom-3 h-24 w-24 border-r-2 border-b-2 border-[#00E5FF]/70"
            />
            <div className="chamfer-card overflow-hidden border border-white/10 bg-[#1A1A1F]">
              <ResilientImage
                src={profile.heroImage}
                alt={profile.heroImageAlt}
                fallbackTitle={profile.name}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
