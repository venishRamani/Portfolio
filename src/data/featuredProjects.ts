import {resolveAssetUrl} from '../lib/portfolioApi';

export interface FeaturedProject {
  id: 'project-1' | 'project-2' | 'project-3' | 'project-4';
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
    title: 'CampIndia — Outdoor & Camping Booking Platform',
    subtitle: 'CampIndia · Travel Showcase & Destination Web App',
    description:
      'A responsive travel and camping web experience showcasing curated campsites across India with interactive gallery views, destination details, and Firebase-ready hosting.',
    architectureSummary:
      'Built with structured HTML, modular CSS layouts, and interactive JavaScript components, organized into dedicated About Us and Gallery sections with Firebase project configuration.',
    highlights: [
      'Responsive multi-section destination showcase with custom About Us and Gallery flows',
      'Clean CSS grid & responsive styling tuned for both desktop and mobile travelers',
      'Deployed live on GitHub Pages with Firebase project configuration (.firebaserc)',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Firebase'],
    deviceVariant: 'laptop',
    align: 'left',
<<<<<<< HEAD
    screenTexture: resolveAssetUrl('src/assets/images/campindia_laptop_ui_1795096726444.jpg'),
=======
    screenTexture: resolveAssetUrl('src/assets/images/work_fintech_platform_1795082546240.jpg'),
>>>>>>> c8a2a8590a60a6fff156e6f6093cebdad0c73790
    repoUrl: 'https://github.com/venishRamani/CampIndia',
    liveUrl: 'https://venishramani.github.io/CampIndia/',
    year: '2026',
  },
  {
    id: 'project-2',
    index: '02',
    title: 'Tourism Website — Interactive Travel Portal',
    subtitle: 'Tourism-website · Mobile-Ready Travel & Carousel UI',
    description:
      'An interactive tourism web application featuring full-bleed destination imagery, smooth image carousels, and mobile web app icons designed for fast cross-device browsing.',
    architectureSummary:
      'Engineered with semantic HTML, custom CSS transitions, and JavaScript carousel controls paired with progressive web icon assets for mobile home-screen compatibility.',
    highlights: [
      'Interactive hero carousel highlighting top travel destinations',
      'Responsive mobile-first layout with custom PWA/app icon manifest assets',
      'Published live via GitHub Pages for instant browser previews',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    deviceVariant: 'phones',
    align: 'right',
<<<<<<< HEAD
    screenTexture: resolveAssetUrl('src/assets/images/tourism_mobile_home_1795096707038.jpg'),
    secondaryScreenTexture: resolveAssetUrl('src/assets/images/tourism_mobile_gallery_1795096710029.jpg'),
=======
    screenTexture: resolveAssetUrl('src/assets/images/work_mobility_os_1795082546266.jpg'),
    secondaryScreenTexture: resolveAssetUrl('src/assets/images/work_audio_hardware_1795082564583.jpg'),
>>>>>>> c8a2a8590a60a6fff156e6f6093cebdad0c73790
    repoUrl: 'https://github.com/venishRamani/Tourism-website',
    liveUrl: 'https://venishramani.github.io/Tourism-website/',
    year: '2026',
  },
  {
    id: 'project-3',
    index: '03',
    title: 'Apartment Management — Society Portal & SQL Schema',
    subtitle: 'Apartment-management · Property UI & Relational Database',
    description:
      'A residential society and apartment management web system combining a custom animated loader interface with a structured SQL database schema (sms.sql) for residents and units.',
    architectureSummary:
      'Pairs a lightweight HTML/CSS web portal and custom preloader animation (loader.css) with a relational SQL schema (sms.sql) modeling society records, flats, and maintenance tracking.',
    highlights: [
      'Custom CSS loading animation and clean dashboard entry interface',
      'Relational SQL database structure (sms.sql) for apartment and resident records',
      'Live preview hosted on GitHub Pages with clear documentation',
    ],
    stack: ['HTML', 'CSS', 'SQL'],
    deviceVariant: 'laptop',
    align: 'left',
<<<<<<< HEAD
    screenTexture: resolveAssetUrl('src/assets/images/apartment_laptop_ui_1795096710714.jpg'),
=======
    screenTexture: resolveAssetUrl('src/assets/images/work_editorial_monograph_1795082546224.jpg'),
>>>>>>> c8a2a8590a60a6fff156e6f6093cebdad0c73790
    repoUrl: 'https://github.com/venishRamani/Apartment-management',
    liveUrl: 'https://venishramani.github.io/Apartment-management/',
    year: '2024',
  },
  {
    id: 'project-4',
    index: '04',
    title: 'Frontend Projects — Interactive Web UI Collection',
    subtitle: 'Frontend-Projects · 11 Mini Web Apps & UI Components',
    description:
      'A curated collection of 11 interactive frontend builds including a Todo App, Contact Manager, Password Generator, Swiper Cards, Animated Search Bar, and Responsive Sticky Navbar.',
    architectureSummary:
      'Hands-on JavaScript, HTML, and CSS component library covering DOM state management, form validation, card sliders, animated profile cards, and responsive navigation patterns.',
    highlights: [
      'Practical utility apps: Todo App, Contact Manager App, and Password Generator System',
      'Interactive UI patterns: Swiper Cards, Slideshow, Search Bar Animation, and 3D Social Icons',
      'Clean responsive forms and sticky navbar patterns built with vanilla HTML/CSS/JS',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    deviceVariant: 'phones',
    align: 'right',
<<<<<<< HEAD
    screenTexture: resolveAssetUrl('src/assets/images/frontend_apps_mobile_1795096709775.jpg'),
    secondaryScreenTexture: resolveAssetUrl('src/assets/images/frontend_cards_mobile_1795096709598.jpg'),
=======
    screenTexture: resolveAssetUrl('src/assets/images/work_apothecary_brand_1795082546073.jpg'),
    secondaryScreenTexture: resolveAssetUrl('src/assets/images/work_fintech_platform_1795082546240.jpg'),
>>>>>>> c8a2a8590a60a6fff156e6f6093cebdad0c73790
    repoUrl: 'https://github.com/venishRamani/Frontend-Projects',
    year: '2026',
  },
];
