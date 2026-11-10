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

- Public API requests retain these origins: `https://techagenz.com`,
  `https://www.techagenz.com`, and local development origins
  `http://localhost:5173`, `3000`, `3001`, and `4173`.
- The admin frontend origin is exactly `https://admin-dev.techagenz.com`.
  Credentialed CORS is enabled only for this exact origin.
- Admin routes and R2 mutation paths accept browser CORS only from the admin
  origin. Responses to the public website origins cannot expose admin responses.
- Public preflights allow only `GET` and `POST`; admin preflights allow only
  `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`. `Content-Type` is allowed for
  public requests. The browser may not request
  `Cf-Access-Jwt-Assertion` or `Authorization`.
- Preflights validate the exact origin, requested method, and every requested
  header. They return only CORS metadata and never route to D1 or R2 handlers.
  A successful preflight is not authentication: actual protected requests
  still require a valid Access assertion, administrator authorization, and the
  canonical API hostname. State-changing admin and R2 requests also enforce the
  exact configured admin Origin before authentication or storage/database
  operations. This Origin check is not a general substitute for CSRF tokens if
  cookie-based authentication is introduced in the future.

Cloudflare Access may challenge or reject browser `OPTIONS` preflights before
they reach the Worker. Verify the actual Access application path scope,
preflight behavior, cookie credentials, and assertion injection against the
development hostname before browser integration. Do not add a broad Access
bypass policy to make preflights work. The local CORS tests do not verify
Cloudflare edge behavior.

## Cloudflare Access authentication foundation

The Worker verifies `Cf-Access-Jwt-Assertion` using the fixed HTTPS JWKS path
for `CF_ACCESS_TEAM_DOMAIN`. It accepts RS256 signatures only, validates the
exact issuer and `CF_ACCESS_AUD`, requires identity/time claims, and fails
closed on missing configuration, invalid tokens, or unavailable signing keys.
JWKS keys are cached in memory for at most five minutes; an unknown `kid`
forces a refresh. Tokens, keys, and provider response bodies are not logged.

Authentication is separate from administrator authorization. `ADMIN_ALLOWED_EMAILS`
is a comma-separated list of exact email addresses, normalized by trimming and
lowercasing. The development Wrangler config contains only the owner-approved
development administrator address; do not copy it into a base or production
environment without separate approval. An empty or missing allow-list denies
all administrators with HTTP 403. Missing or invalid authentication receives
HTTP 401. Do not assume the Cloudflare account email is an approved application
administrator.

`CF_ACCESS_API_HOST` pins protected routes to `api-dev.techagenz.com`. This
prevents a valid Access assertion from being replayed against the public
workers.dev hostname. Keep `workers_dev = true` only while the host check is
present and tested; before relying on Access in a controlled deployment, attach
the approved custom API hostname to the Worker, protect that hostname with
Cloudflare Access, verify the host and assertion path end-to-end, and disable
the public workers.dev route. None of those Cloudflare resources or settings
are created or changed by this code.

### Browser-to-Worker development arrangement

The public enquiry helper uses `VITE_API_BASE_URL`, which may point at the
Worker’s workers.dev URL. The admin frontend has a separate, read-only
authorization probe configured by `VITE_ADMIN_API_BASE_URL`; keep it unset
until the custom API hostname and its Access application are verified. The
recommended development arrangement is:

- Serve the admin UI at `admin-dev.techagenz.com` and the API at
  `api-dev.techagenz.com`; protect both applications with Cloudflare Access.
- Scope the API Access application to the protected admin/R2 mutation paths so
  public CMS and enquiry routes are not unintentionally gated. Establish the
  Access session through a top-level browser navigation, then use
  `credentials: "include"` for API fetches. The browser must not read, store, or
  construct an Access JWT; Access validates its session and supplies
  `Cf-Access-Jwt-Assertion` to the Worker.
- The source policy enables credentialed CORS only for the exact admin origin.
  Determine and test how Access handles unauthenticated `OPTIONS` preflights
  before enabling the browser client. Any preflight that reaches the Worker is
  validated and receives only a strict, non-mutating CORS response.
- Cookie authentication requires origin validation and CSRF protection for
  future mutations. Require the exact approved `Origin`, JSON content type,
  and a CSRF defense (for example a synchronizer token) before enabling writes.
- Do not assume protecting the admin hostname protects the API hostname. Do
  not expose admin operations through workers.dev; the Worker host pin is an
  additional defense, not a replacement for Access.

The API hostname, Access applications/policies, CORS credential behavior, and
DNS are deployment prerequisites and require separate owner approval. Do not
use a browser-supplied `Cf-Access-Jwt-Assertion` as a substitute for the
Access edge session.

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

## Admin and R2 writes remain disabled

The development administrator identity is owner-approved, but all
`/api/admin/*` CRUD handlers remain placeholders and return HTTP 501 only after
authentication and authorization; unauthorized requests return HTTP 401 or 403. R2 upload and delete handlers always return HTTP 403 after authorization
and never call R2 write operations. Keep these features disabled until Access
and the custom API hostname are verified, CRUD validation is implemented and
tested, and R2 MIME/extension/content checks, safe key generation, and size
limits are complete. Public CMS endpoints remain read-only and do not require
Access.

## Database and migration safety

Migration scripts explicitly target `--env dev`. Do not run remote migrations
as part of ordinary development or this Phase 2 hardening task. Before any
remote operation, verify `wrangler whoami` matches the approved account. Never
change the verified D1 ID, recreate existing resources, upload production
files, or modify production, DNS, or Vercel resources.
