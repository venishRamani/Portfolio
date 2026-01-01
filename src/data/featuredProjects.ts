import {resolveAssetUrl} from '../lib/portfolioApi';

export interface FeaturedProject {
  index: string;
  title: string;
  subtitle: string;
  description: string;
  architectureSummary: string;
  highlights: string[];
  stack: string[];
  deviceVariant: 'laptop' | 'phones';
  align: 'left' | 'right';
  screenTexture: string;
  secondaryScreenTexture?: string;
  repoUrl?: string;
  liveUrl?: string;
  year: string;
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: 'project-1',
    index: '01',
    description:
    architectureSummary:
    highlights: [
    ],
    deviceVariant: 'laptop',
    align: 'left',
    screenTexture: resolveAssetUrl('src/assets/images/work_fintech_platform_1795082546240.jpg'),
    year: '2026',
  },
  {
    id: 'project-2',
    index: '02',
    description:
    architectureSummary:
    highlights: [
    ],
    deviceVariant: 'phones',
    align: 'right',
    screenTexture: resolveAssetUrl('src/assets/images/work_mobility_os_1795082546266.jpg'),
    secondaryScreenTexture: resolveAssetUrl('src/assets/images/work_audio_hardware_1795082564583.jpg'),
  },
  {
    id: 'project-3',
    index: '03',
    description:
    architectureSummary:
    highlights: [
    ],
    deviceVariant: 'laptop',
    align: 'left',
    screenTexture: resolveAssetUrl('src/assets/images/work_editorial_monograph_1795082546224.jpg'),
  },
];
