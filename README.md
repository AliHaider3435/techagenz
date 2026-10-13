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
Create a `.env` file in the root directory:
```env
RESEND_API_KEY=re_your_api_key_here
```
> In Vercel, add `RESEND_API_KEY` under **Project Settings > Environment Variables**.

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
- `api/send-enquiry.ts` — Vercel Serverless Function handling contact form enquiries
- `server/api/` — Nitro backend API route handler
- `public/` — Static files, `robots.txt`, and canonical XML sitemaps
