# Admin API and Cloudflare Access Integration

## Status and scope

The frontend now has a typed, read-only Admin API authorization probe. It does
not implement CMS CRUD, uploads, deletes, or application-level authentication.
The API base remains intentionally unset in `.env.example` until the custom
hostname, Worker attachment, and API Access application audience are verified.
This repository change does not configure Cloudflare, Vercel, DNS, or deploy
anything.

The admin page continues to render local preview data. Seeing `/admin`, the
login guidance page, or a Cloudflare redirect is not by itself proof that an
administrator is authorized. The frontend displays only the outcome of an
API request and does not store or display an email, Access assertion, cookie,
or JWT.

## Request flow

1. A user opens the frontend at `https://admin-dev.techagenz.com`. The
   Cloudflare Access application for that hostname must enforce the approved
   administrator policy at the edge.
2. The browser begins an API Access session through a top-level navigation to
   `https://api-dev.techagenz.com/api/admin`. The user must authenticate to the
   API Access application separately if it has no session. The response is a
   read-only `501 Not implemented` while admin API operations remain disabled.
3. The admin page calls `GET {VITE_ADMIN_API_BASE_URL}/api/admin` with
   `credentials: "include"`, `cache: "no-store"`, and no caller-supplied Access
   headers. The browser sends eligible API-origin cookies; Cloudflare Access
   validates its session and supplies the assertion to the Worker.
4. The Worker independently validates the assertion, issuer, audience,
   administrator allow-list, and protected API hostname. It then returns the
   existing authorized `501` placeholder. This status means the current
   authorization chain accepted this request, not that any CMS operation is
   available.

The browser must never construct, read, persist, or forward
`Cf-Access-Jwt-Assertion` itself. A frontend-side state, email, query parameter,
or redirect is not an authorization credential.

## Frontend configuration and behavior

- `VITE_API_BASE_URL` remains the public enquiry API setting; this change does
  not redirect public enquiry traffic.
- `VITE_ADMIN_API_BASE_URL` is a separate, optional admin-only API origin.
  Leave it empty until the custom API hostname and the API Access application
  have been verified. Do not configure it to a `workers.dev` hostname.
- The client permits HTTPS origins (and localhost HTTP for local development),
  rejects URL credentials, path/query/fragment components, and workers.dev
  hosts.
- The API status is reported as unconfigured, checking, session required,
  forbidden, authorized read-only, or unavailable. Errors do not imply
  authorization.
- The `/login` route is guidance only. It has no password form and links to the
  development admin hostname; it does not authenticate or establish an Access
  session.
- The browser's same-origin admin hostname session and API hostname session
  are distinct. A top-level API navigation may be required to establish the
  latter. Test this in the target browsers because third-party cookie and
  Access redirect behavior can vary.

## Worker route and authorization boundaries

The current Worker implementation separates these surfaces:

| Route surface                   | Intended access                            | Current behavior                       |
| ------------------------------- | ------------------------------------------ | -------------------------------------- |
| Public CMS GET routes           | Public                                     | Remain public                          |
| `POST /api/enquiries`           | Public, with Turnstile/rate-limit controls | Remains public                         |
| `GET /api/r2/:path*`            | Public reads                               | Remains public                         |
| `/api/admin` and `/api/admin/*` | Access JWT plus administrator allow-list   | Authenticated placeholder; returns 501 |
| `POST /api/r2/upload`           | Access JWT plus administrator allow-list   | Writes remain disabled                 |
| `DELETE /api/r2/:path*`         | Access JWT plus administrator allow-list   | Deletes remain disabled                |

Do not protect all of `/api/r2/*` at the Access edge if doing so would also
block public reads. Prefer narrowly scoped protected paths where Cloudflare
Access supports the required path matching. The Worker remains the independent
authorization boundary even when the edge application is configured.

Current development Worker configuration in `worker/wrangler.toml`:

- `CF_ACCESS_TEAM_DOMAIN`: `broad-voice-f670.cloudflareaccess.com`
- `CF_ACCESS_AUD`: `4337c569505d0367294fd5adbdc57d49cbe1c0faf4b62f4a27eb8de2ff943a19`
- Expected issuer: `https://broad-voice-f670.cloudflareaccess.com`
- `ADMIN_ALLOWED_EMAILS`: the approved development administrator configured
  in the development environment only
- `CF_ACCESS_API_HOST`: `api-dev.techagenz.com`

The configured audience is intended for the **API Access application**. Confirm
that it exactly matches that application's audience in Cloudflare before
setting `VITE_ADMIN_API_BASE_URL`. It is not the audience for the admin
frontend application merely because both use the same Access team.

## Required Cloudflare and hosting prerequisites

Complete and verify these manually before enabling the frontend API setting:

1. **Admin Access application**
   - Self-hosted application hostname: `admin-dev.techagenz.com`.
   - Allow policy restricted to the approved administrator email.
   - No broad bypass policy.
   - Confirm the DNS record is proxied through Cloudflare and that an
     unauthenticated request is challenged by Access.
2. **API Access application**
   - Protect `api-dev.techagenz.com` and only the intended admin and R2
     mutation paths if path scoping is supported reliably.
   - Keep public CMS reads, enquiry submission, and R2 reads reachable without
     an Access login.
   - Use the same approved administrator identity.
   - Confirm its AUD exactly equals the development `CF_ACCESS_AUD` above.
3. **Worker hostname**
   - Attach `api-dev.techagenz.com` to `techagenz-api-dev`.
   - Confirm an API request reaches that Worker and the Access assertion reaches
     the Worker without exposing the assertion in browser logs or support
     material.
   - Confirm the Worker rejects protected requests made through the
     `workers.dev` hostname. `workers_dev = true` is still configured for the
     development environment; the Worker host check is defense in depth, not
     equivalent to disabling that route.
4. **Vercel and DNS**
   - Confirm the Vercel deployment is attached to `admin-dev.techagenz.com` and
     that Cloudflare proxying is in place for this hostname.
   - Review Vercel preview and deployment URLs: they may serve the same
     frontend outside the Access-protected custom hostname. Keep backend
     authorization independent and do not treat obscuring these aliases as a
     substitute for Worker authorization.
   - Use a valid Cloudflare-to-origin TLS mode, typically Full (strict) when
     the Vercel origin certificate is valid for the origin hostname. Avoid
     Flexible mode and conflicting HTTP-to-HTTPS redirects that can loop.

Do not change or disable the `workers.dev` route until the custom hostname,
Access path, and Worker behavior have been verified and separately approved.

## CORS, preflight, and future writes

The Worker CORS policy allows credentialed requests only from the exact
`https://admin-dev.techagenz.com` origin, validates requested methods and
headers, and rejects browser-supplied `Cf-Access-Jwt-Assertion`. Successful
preflight is not authentication. OPTIONS handling must remain free of D1/R2
mutations, and protected actual requests must still pass JWT and administrator
checks.

Local tests do not establish how the Cloudflare Access edge handles
unauthenticated OPTIONS requests for the real API hostname. Verify preflight
behavior on that hostname before adding browser calls that require preflight.
Do not use a broad Access bypass to make a preflight succeed.

Before any future write implementation, separately design and test:

- exact `Origin` checks on every write;
- CSRF protections appropriate for cookie-based authentication;
- server-side Access JWT verification and fail-closed behavior;
- a separate administrator allow-list check;
- JSON/content-type and input validation;
- authorization before any D1 or R2 mutation.

This integration does not enable any of those writes.

## Verification plan

### Automated, local-only checks

Run the frontend API client test and frontend checks:

```sh
node --test tests/admin-api-client.test.mjs
npx tsc --noEmit
npm run build
```

Run Worker checks from the repository root:

```sh
npm --prefix worker run typecheck
npm --prefix worker test
```

The Worker tests should continue to cover JWT validation, exact email
authorization, CORS/preflight, public routes, and the disabled admin/R2
mutation paths. A Wrangler development dry-run is a configuration check only;
it is not a deployment or live Access verification.

### Real-host browser checks

After Cloudflare and hosting prerequisites are confirmed:

1. In a clean browser profile, open `https://admin-dev.techagenz.com/admin`.
   Confirm unauthenticated access is challenged by Cloudflare Access before
   the application page is served.
2. Authenticate as the approved identity. Separately test an identity not in
   the Access policy and confirm denial.
3. From the approved session, open
   `https://api-dev.techagenz.com/api/admin` in a top-level tab to establish
   API Access if required. The expected current authorized response is the
   existing JSON 501 placeholder; it does not prove that CRUD is enabled.
4. Return to the admin page and use **Verify API session**. Confirm the
   browser reports authorized read-only only after the Worker returns the
   exact authorized placeholder response. A 401/redirect requires an Access
   session; 403 means authorization was denied; network/CORS/other responses
   remain unverified.
5. Test API preflight behavior and public CMS, enquiry, and R2 read behavior.
   Confirm public routes are not unintentionally gated.
6. Request a protected route through the `workers.dev` hostname and confirm
   the Worker rejects it. Do not use any mutation method as a test.
7. Confirm no admin CRUD, R2 upload, or R2 delete operation succeeds.

Do not copy or capture cookies, Access assertions, JWTs, login challenges, or
other authentication material during testing. Do not claim successful live
authentication based solely on a redirect, a page loading, or the presence of
Cloudflare response headers.

## Safe release sequence

1. Complete local typecheck, unit tests, frontend build, Worker tests, and
   development dry-run.
2. Manually verify the Access applications, API AUD, Worker custom hostname,
   DNS proxy, TLS, and public-route boundaries.
3. Verify approved and denied browser sessions, real-host CORS/preflight, and
   workers.dev host rejection without exercising mutations.
4. Only after owner approval, set `VITE_ADMIN_API_BASE_URL` to
   `https://api-dev.techagenz.com` in the intended development frontend
   environment and deploy that frontend through the approved process.
5. Keep CMS CRUD and R2 writes disabled until separately implemented,
   reviewed, tested, and approved.
