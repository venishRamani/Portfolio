import {resolveAssetUrl} from '../lib/portfolioApi';

export interface FeaturedProject {
  id: 'project-1' | 'project-2' | 'project-3';
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
    title: 'Designing the CampIndia Website',
    subtitle: 'Kinetix Cloud Console · React + Node.js API Platform',
    description:
       'your gateway to exploring the beauty and diversity of India camping destinations!',
    architectureSummary:
      'Foster a community of outdoor enthusiasts who love exploring India's wilderness.',
    highlights: [
      'Camping Spot Directory: A curated list of camping sites across India, complete with location details, amenities, and user reviews.',
      'Travel Guides: Step-by-step guides for planning your camping trips, including packing lists, safety tips, and must-visit attractions.',
      'Community Contributions: Open to contributions from fellow campers! Share your experiences, photos, and tips to help others.',
    ],
    stack: ['HTMl', 'TypeScript', 'CSS', 'JAVASCRIPT'],
    deviceVariant: 'laptop',
    align: 'left',
    screenTexture: resolveAssetUrl('src/assets/images/work_fintech_platform_1795082546240.jpg'),
    repoUrl: 'https://github.com/ramanivenish',
    year: '2026',
  },
  {
    id: 'project-2',
    index: '02',
    title: 'Real-time mobile web payments & ledger',
    subtitle: 'PulsePay Web · Responsive Web App & Webhook Engine',
    description:
      'A mobile-first financial web application featuring instant ledger reconciliation, idempotent webhook processing, and optimistic UI updates across devices.',
    architectureSummary:
      'Engineered an idempotent Node.js payment webhook pipeline paired with responsive mobile web views, offline queue resilience, and deterministic state reconciliation.',
    highlights: [
      'Mobile-first React interface tuned for 60fps scroll performance and zero layout shift',
      'Idempotent REST API design preventing duplicate transactions under flaky networks',
      'Automated integration test suite covering auth tokens, pagination, and CSV exports',
    ],
    stack: ['React', 'Node.js', 'REST APIs', 'Webhooks', 'SQLite / Postgres'],
    deviceVariant: 'phones',
    align: 'right',
    screenTexture: resolveAssetUrl('src/assets/images/work_mobility_os_1795082546266.jpg'),
    secondaryScreenTexture: resolveAssetUrl('src/assets/images/work_audio_hardware_1795082564583.jpg'),
    repoUrl: 'https://github.com/ramanivenish',
    year: '2025',
  },
  {
    id: 'project-3',
    index: '03',
    title: 'A composable developer portfolio & CMS',
    subtitle: 'Monolith Studio · Headless Content & GitHub Sync Engine',
    description:
      'Created a fast, self-editable web platform with live GitHub repository metadata syncing, inline profile authoring, and persistent JSON/API storage.',
    architectureSummary:
      'Combines an Express persistence layer and GitHub REST v3 proxy with a dark monochrome WebGL frontend featuring zero-dependency interactive controls.',
    highlights: [
      'Live GitHub repository lookup by URL or handle with one-click star and fork sync',
      'Self-editable developer profile and direct contact inbox persisted to backend storage',
      'Accessible keyboard navigation, reduced-motion support, and Three.js hardware-adaptive rendering',
    ],
    stack: ['TypeScript', 'React', 'Three.js', 'Express', 'GitHub REST API'],
    deviceVariant: 'laptop',
    align: 'left',
    screenTexture: resolveAssetUrl('src/assets/images/work_editorial_monograph_1795082546224.jpg'),
    repoUrl: 'https://github.com/ramanivenish',
    year: '2025',
  },
];
