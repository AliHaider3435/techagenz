# Tech Agenz Worker

Cloudflare Worker API for the Tech Agenz frontend. Development must remain
separate from production. Do not change production resources, DNS, nameservers,
or Vercel settings as part of Worker development.

## Development environment

The verified Cloudflare account has the workers.dev subdomain
`haider-ly5617`. The development environment in `wrangler.toml` is configured
as follows:

| Resource     | Development binding    | Verified resource                                           |
| ------------ | ---------------------- | ----------------------------------------------------------- |
| Worker       | —                      | `techagenz-api-dev` (not deployed)                          |
| D1           | `DB`                   | `techagenz-dev-db` (`c5c5385d-0677-4260-96be-7a8a36d84669`) |
| R2           | `ASSETS`               | `techagenz-dev-assets`                                      |
| Rate limiter | `ENQUIRY_RATE_LIMITER` | Cloudflare native binding; 5 requests per 60 seconds        |

The development D1 migrations `0001_initial_schema.sql` and
`0002_seed_data.sql` are applied. The remote database was verified to have 6
team members, 22 blog posts, 3 case studies, 410 CMS seed rows, no foreign-key
violations, and no pending migrations. The existing R2 bucket is accessible
and was verified empty after the temporary Phase 2 check. Do not reapply the
seed migration; its child-table inserts can duplicate relationship records.

The Worker has **not** been deployed. Do not start a remote preview or deploy
unless separately authorized. `npm run deploy` explicitly targets `--env dev`;
do not replace it with an unqualified Wrangler command. The base configuration
is intentionally non-public (`workers_dev = false`), has a placeholder D1 ID,
and does not bind R2. Use the `dev` environment for development commands; do
not deploy the base configuration.

From `worker/`:

```bash
npm run typecheck
npm test
npm run dev
```

`npm run dev` uses the explicit `dev` environment in local mode. Local D1/R2
bindings are simulations; local testing does not validate production or remote
resource behavior. The native rate limiter is approximate and is enforced
independently in each Cloudflare location, not as a strict global quota.

## API routes

The Worker exposes only public, read-only CMS endpoints and the protected
enquiry submission endpoint:

| Method | Path                   | Purpose                        |
| ------ | ---------------------- | ------------------------------ |
| GET    | `/api/health`          | Health check                   |
| GET    | `/api/cms/team`        | Public team member listing     |
| GET    | `/api/cms/blogs`       | Public blog listing            |
| GET    | `/api/cms/blogs/:slug` | Public blog by slug            |
| GET    | `/api/cms/projects`    | Public case-study listing      |
| POST   | `/api/enquiries`       | Enquiry submission (protected) |
| GET    | `/assets/*`            | Public R2 asset serving        |

All write, mutation, and administrative endpoints have been removed.

## Enquiry protection and local testing

`POST /api/enquiries` is protected by both server-side Turnstile verification
and the Cloudflare-native `ENQUIRY_RATE_LIMITER` binding. The configured limit
is 5 attempts per 60 seconds per client address. The key uses only
Cloudflare's platform-provided `CF-Connecting-IP`; arbitrary
`X-Forwarded-For` and other client-supplied forwarding headers are ignored.
IPv6 addresses are grouped by `/64` to make simple address rotation less
effective. Requests without a valid platform client IP or with a failed rate
limiter are rejected; an exceeded limit returns HTTP 429 and `Retry-After`.

Run the rate-limit unit tests with `npm test`. For local endpoint checks, start
`npm run dev`, then send six requests from the same client within one minute.
The first five reach request validation (with no local Turnstile secret they
should fail closed with 422); the next should return 429. Use only a dummy
Turnstile token and do not submit real enquiries during local security tests.

## CORS

The source-code origin and preflight policy in `src/middleware/cors.ts` is
authoritative; Wrangler CORS variables are not used.

- Allowed origins: `https://techagenz.com`, `https://www.techagenz.com`, and
  local development origins `http://localhost:5173`, `3000`, `3001`, and `4173`.
- Preflights allow only `GET` and `POST`. `Content-Type` is allowed for
  requests.
- Preflights validate the exact origin, requested method, and every requested
  header. They return only CORS metadata and never route to D1 or R2 handlers.

## Secrets

The Worker does not store secret values in source or Wrangler configuration.
Required for the corresponding features:

- `CF_TURNSTILE_SECRET_KEY` — required for server-side verification of public
  enquiry submissions. Missing or failed verification rejects the submission.
- `RESEND_API_KEY` — required to send enquiry notification email. If absent or
  Resend fails, the enquiry may still be saved, so monitor provider errors.

For local development, copy `.dev.vars.example` to the ignored `.dev.vars` file
and enter development-only secret values there. Never commit `.dev.vars`, paste
secret values into chat, or use production secrets for local tests.

For a deployed development Worker, configure values through Wrangler's secret
prompt; the commands below prompt for the value and do not put it in a file:

```bash
wrangler secret put CF_TURNSTILE_SECRET_KEY --config ./wrangler.toml --env dev
wrangler secret put RESEND_API_KEY --config ./wrangler.toml --env dev
```

Do not configure secrets or send real enquiries as part of local verification.
The Turnstile site key is public frontend configuration, not a Worker secret.

## Database and migration safety

Migration scripts explicitly target `--env dev`. Do not run remote migrations
as part of ordinary development. Before any remote operation, verify
`wrangler whoami` matches the approved account. Never change the verified D1
ID, recreate existing resources, upload production files, or modify production,
DNS, or Vercel resources.

The `admin_sessions` table exists in D1 from migration `0004_admin_sessions.sql`.
This table is now orphaned (no code reads or writes to it) and may be dropped
via a future migration when convenient. Do not delete the migration file itself,
as removing applied migrations corrupts the migration chain.
