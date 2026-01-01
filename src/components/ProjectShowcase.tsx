import {useState} from 'react';
import {FEATURED_PROJECTS, type FeaturedProject} from '../data/featuredProjects';
import {DeviceCanvas3D} from './three/DeviceCanvas3D';
import {ProjectCaseStudyModal} from './ProjectCaseStudyModal';

interface ProjectShowcaseProps {
  onContactClick: () => void;
}

export function ProjectShowcase({onContactClick}: ProjectShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<FeaturedProject | null>(
    null,
  );

  return (
    <>
      <div className="divide-y divide-white/[0.06] bg-[#111111]">
        {FEATURED_PROJECTS.map((project) => {
          const isTextRight = project.align === 'right';

          return (
            <section
              key={project.id}
              id={project.id}
              className="relative py-20 sm:py-28 px-6 sm:px-12 lg:px-20"
            >
              <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
                {/* Text Column */}
                <div
                  className={`lg:col-span-5 ${
                    isTextRight ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  {/* Signature hamishw.com Cyan Divider + Index */}
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="inline-block h-[2px] w-16 bg-[#00E5FF]"
                    />
                    <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[#00E5FF] tabular-nums">
                      {project.index}
                    </span>
                  </div>

                  <h2
                    className="mt-6 font-display text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl"
                    style={{textWrap: 'balance'}}
                  >
                    {project.title}
                  </h2>

                  <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-[#C4C4CC]">
                    {project.description}
                  </p>

                  <p className="mt-4 font-mono text-xs text-[#8A8A94]">
                    {project.stack.join(' · ')}
                  </p>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="chamfer-btn group inline-flex min-h-[46px] items-center gap-3 bg-[#00E5FF] px-6 py-3 text-sm font-bold text-[#111111] whitespace-nowrap shrink-0 transition-colors hover:bg-[#38EDFF]"
                    >
                      <span>View Project</span>
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3D Interactive Device Canvas Column */}
                <div
                  className={`lg:col-span-7 ${
                    isTextRight ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="relative">
                    <DeviceCanvas3D
                      variant={project.deviceVariant}
                      screenTexture={project.screenTexture}
                      secondaryScreenTexture={project.secondaryScreenTexture}
                      title={project.title}
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <ProjectCaseStudyModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onInquire={onContactClick}
      />
    </>
  );
}
