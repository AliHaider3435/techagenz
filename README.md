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
Create a `.env` file in the root directory with the public Cloudflare Worker
API URL and Turnstile site key:
```env
VITE_API_BASE_URL=https://techagenz-api-dev.haider-ly5617.workers.dev
VITE_CF_TURNSTILE_SITE_KEY=your_public_turnstile_site_key
```
The enquiry forms submit directly to the Cloudflare Worker and require a valid
Turnstile token. Configure the Worker-only `RESEND_API_KEY` and
`CF_TURNSTILE_SECRET_KEY` as Cloudflare secrets; never expose them in Vite
variables.

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

## Project Structure
- `src/routes/` — File-based routes (`/` home, `/work` portfolio, `__root.tsx` root layout & SEO)
- `src/components/` — Modular UI components (Nav, Hero, Impact, Team, Footer, WhatsApp chat)
- `src/assets/` — Optimized graphics and WebP team & project assets
- `api/send-enquiry.ts` — retired endpoint returning HTTP 410
- `server/api/` — Nitro API routes; the legacy enquiry endpoint is retired
- `public/` — Static files, `robots.txt`, and canonical XML sitemaps
