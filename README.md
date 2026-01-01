# Venish Ramani — Web Developer Portfolio

A dark-monochrome and electric-cyan full-stack web developer portfolio built with **React**, **TypeScript**, **Three.js**, **Tailwind CSS**, and **Express**.

Designed around an interactive WebGL hero backdrop, real-time 3D device mockups (`#project-1`, `#project-2`, `#project-3`), live GitHub repository importing and stat syncing, inline profile editing, and a persistent contact inbox.

---

## Features

- **Interactive Three.js Hero (`#intro`)**
  - Real-time `DisplacementSphere` WebGL shader backdrop with 3D simplex noise vertex/normal displacement, studio `RoomEnvironment` reflections, cursor parallax, and automatic hardware/software-GL adaptive rendering.
  - `DecoderText` glyph-scramble typography reveal (respects `prefers-reduced-motion`).
  - Clickable focus switcher (`Full-Stack`, `React & Node`, `APIs & UI`).
- **3D Project Showcase (`#project-1` — `#project-3`)**
  - Alternating split layouts with interactive Three.js 3D **Laptop** and **Dual-Phone** device assemblies (`DeviceCanvas3D`) textured with project visuals and pointer-driven damped tilt.
  - Chamfered `#00E5FF` action buttons opening a detailed case-study modal with architecture notes and engineering highlights.
- **Live GitHub Project Showcase (`#github`)**
  - Pin public repositories by URL (`https://github.com/owner/repo` or `owner/repo`), browse any GitHub username's public repositories, or enter repository details manually.
  - Edit personal project highlights and refresh live stars/forks directly from the GitHub REST API.
- **Self-Editable Profile (`#about`)**
  - Update name, title, location, email, headline, and short bio directly from the UI via the **Edit Profile** modal, persisted to disk via Express.
- **Direct Contact & Message Log (`#contact`)**
  - Copy email or open `mailto:` directly, submit validated notes via the contact form, and inspect/manage received notes (`unread`, `read`, `replied`) inside the **Message Log** modal.
- **Fixed Vertical Rail Navigation**
  - Left-edge monogram mark, rotated vertical section links with active `IntersectionObserver` tracking, quick social/inbox triggers, and a responsive mobile drawer.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons |
| **3D / WebGL** | Three.js (`WebGLRenderer`, `RoomEnvironment`, `PMREMGenerator`, custom `onBeforeCompile` GLSL noise) |
| **Backend** | Node.js, Express 4, JSON file persistence (`data/`), GitHub REST API v3 proxy |

---

## Deploy to GitHub Pages (Static Hosting)

GitHub Pages only serves static files (it does not run a Node.js server), so this project is pre-configured to work in **both** modes:

- **GitHub Pages (`dist/`)**: Uses relative asset paths (`base: './'`), queries the public GitHub REST API directly from the browser for repository imports/syncing, and persists profile, pinned repos, and contact log entries in browser `localStorage`.
- **Node.js / Local (`npm run dev` / `npm start`)**: Persists data to `data/*.json` via Express `/api/*` endpoints.

### One-Click Deployment via GitHub Actions

1. Push this repository to GitHub (`main` or `master` branch).
2. Open your repository on GitHub and go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically build `dist/` and publish your live site at `https://<your-username>.github.io/<repo-name>/`.

*(Tip: Do not deploy the raw root folder without building—always deploy via the GitHub Actions workflow or the generated `dist/` folder, since browsers cannot execute raw `.tsx` files directly.)*

---

## Getting Started (Local Development)

### Prerequisites

- **Node.js** `>= 20`
- **npm** `>= 10`

### Installation & Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/ramanivenish/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the full-stack development server**

   Runs Express + Vite middleware on `http://localhost:3000`:

   ```bash
   npm run dev
   ```

4. **Typecheck & production build**

   ```bash
   npm run lint
   npm run build
   ```

5. **Run in production mode**

   ```bash
   npm start
   ```

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Express + Vite development server on port `3000` |
| `npm run build` | Compiles the client production bundle into `dist/` |
| `npm run start` | Serves the production build and API routes via `server.ts` |
| `npm run lint` | Runs `tsc --noEmit` TypeScript type checking |
| `npm run preview` | Previews the Vite production build |
| `npm run clean` | Removes `dist/` and compiled build artifacts |

---

## API Endpoints

All API routes are served by `server.ts` and persist data locally in `data/*.json`.

- `GET /api/health` — Server health check
- `GET /api/profile` · `PUT /api/profile` — Read and update developer profile
- `GET /api/github/user?username=...` — Fetch public non-fork repositories for a GitHub user
- `GET /api/github/repo?url=...` — Look up repository metadata by URL or `owner/repo`
- `GET /api/github-projects` · `POST /api/github-projects` · `PATCH /api/github-projects/:id` · `POST /api/github-projects/:id/sync` · `DELETE /api/github-projects/:id` — Manage pinned GitHub projects
- `GET /api/messages` · `POST /api/messages` · `PATCH /api/messages/:id` · `DELETE /api/messages/:id` — Direct contact form submission and inbox management

---

## Project Structure

```text
.
├── index.html
├── package.json
├── server.ts                        # Express API + Vite dev/static server (port 3000)
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── index.css                    # Tailwind CSS v4 + chamfer & vertical nav utilities
    ├── main.tsx
    ├── assets/images/               # Local project & portrait assets
    ├── data/featuredProjects.ts     # #project-1, #project-2, #project-3 definitions
    ├── types/portfolio.ts           # Shared TypeScript interfaces
    └── components/
        ├── Navbar.tsx               # Fixed vertical sidebar + mobile drawer
        ├── IntroHero.tsx            # #intro hero + focus switcher
        ├── DecoderText.tsx          # Glyph scramble text animation
        ├── ProjectShowcase.tsx      # #project-1 / #project-2 / #project-3 layout
        ├── ProjectCaseStudyModal.tsx
        ├── GitHubShowcase.tsx       # GitHub repo import, sync, and notes
        ├── AddGitHubProjectModal.tsx
        ├── AboutSection.tsx
        ├── EditProfileModal.tsx
        ├── ContactSection.tsx
        ├── MessageInboxModal.tsx
        ├── Footer.tsx
        ├── ResilientImage.tsx
        └── three/
            ├── DisplacementSphere.tsx # Custom GLSL noise hero backdrop
            ├── DeviceCanvas3D.tsx     # Interactive 3D laptop & dual-phone models
            └── glDetection.ts         # WebGL software-renderer & fallback texture helpers
```

---

## Contact

- **Developer:** Venish Ramani
- **Email:** [ramanivenish2004@gmail.com](mailto:ramanivenish2004@gmail.com)
- **GitHub:** [github.com/ramanivenish](https://github.com/ramanivenish)
