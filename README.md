# Tech Agenz — AI-Powered Software House

Official web platform for [Tech Agenz](https://www.techagenz.com) engineering intelligent AI, automation pipelines, and modern web platforms.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) with [Nitro](https://nitro.unjs.io/) & [Vite](https://vite.dev/)
- **UI & Styling:** React 19, Tailwind CSS v4, Lucide Icons, Framer Motion, GSAP
- **Email Service:** [Resend](https://resend.com) for client enquiry dispatch and automated confirmation
- **Deployment:** Vercel

## Getting Started

### 1. Prerequisites
- Node.js 20+ (v24 recommended)
- npm or pnpm

### 2. Environment Variables
For local development, create a `.env` file with the enquiry API origin and
public Turnstile site key:
```env
VITE_API_BASE_URL=https://api-dev.techagenz.com
VITE_CF_TURNSTILE_SITE_KEY=your_public_turnstile_site_key
```
`VITE_API_BASE_URL` is used only to submit public enquiries to the Cloudflare
Worker. Production uses `https://api.techagenz.com`. The Turnstile site key is
public; never put secrets in Vite variables.

The Worker verifies enquiries with `CF_TURNSTILE_SECRET_KEY`, applies
Cloudflare rate limiting, stores submissions in D1, and sends notifications
through Resend. Configure the Turnstile secret and `RESEND_API_KEY` as
Worker-only secrets. For local Worker development, set
`TURNSTILE_ENQUIRY_HOSTNAME=localhost` in `worker/.dev.vars` when testing from
a local frontend.

### 3. Install Dependencies
```bash
npm install
```

### 4. Development Server
```bash
npm run dev
```

### 5. Build & Typecheck
```bash
npx tsc --noEmit
npm run build
```

## Managing Website Content
Public content is version-controlled in `src/content/` and `public/`:

- `src/content/team.ts` — team profiles and local portrait paths.
- `src/content/blogs/*.json` — one complete article per file, including its
  existing slug, publication date, keywords, takeaways, body, image, and SEO
  fields. Use `## ` or `### ` at the start of a body string for a heading.
- `src/content/projects/*.json` — one complete case study per file.
- `src/content/services.ts` and `src/content/testimonials.ts` — service and
  testimonial copy.
- `src/content/site.ts` — shared business details, social links, and default
  SEO configuration.
- `public/team-images/`, `public/blog-images/`, and `public/project-images/` —
  website images referenced by local paths.

Keep existing blog IDs and project slugs to preserve their public URLs. After
editing, run the typecheck and build, then commit and push to `main`; Vercel
builds the checked-in content with the website. Do not put credentials or
private enquiry data in content files.

## Project Structure
- `src/routes/` — File-based public routes and SEO metadata.
- `src/content/` — GitHub-managed team, blog, project, service, testimonial,
  and site configuration data.
- `src/components/` — Shared responsive UI components and animations.
- `src/assets/` — Bundled interface graphics and illustrations.
- `public/` — Local content images, static files, and sitemap.
- `worker/` — Cloudflare Worker backend retained for protected enquiry
  submission, Turnstile verification, rate limiting, D1 persistence, and email.
