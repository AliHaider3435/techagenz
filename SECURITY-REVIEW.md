# Tech Agenz Phase 2 Security Review

**Review date:** 2026-11-05  
**Scope:** Read-only audit of the Phase 2 development Cloudflare Worker
hardening and related public enquiry handlers.

## Executive summary

The Worker hardening passes the reviewed configuration and local regression
checks. However, the application still has a separate public enquiry route that
does not use the Worker protections. Treat overall enquiry protection as
incomplete until that path is protected or removed. Worker-only deployment to
the isolated development environment is conditional; do not route production
frontend traffic to it.

## Finding

### MEDIUM — Legacy enquiry handlers bypass Worker protections

**Confidence:** 9/10  
**Files:**

- [`api/send-enquiry.ts`](./api/send-enquiry.ts#L51)
- [`server/api/send-enquiry.post.ts`](./server/api/send-enquiry.post.ts#L52)
- Frontend callers: [`src/routes/contact.tsx`](./src/routes/contact.tsx#L120)
  and [`src/routes/index.tsx`](./src/routes/index.tsx#L1159)

The frontend submits enquiries to `/api/send-enquiry`. The legacy handlers
send notifications through Resend without server-side Turnstile verification
or the Worker rate limiter. This allows callers to bypass the protected
`POST /api/enquiries` Worker route and may enable automated notification-email
abuse.

**Recommended fix:** Route frontend submissions through the protected Worker
endpoint and disable the legacy handlers, or implement equivalent server-side
Turnstile verification and abuse controls on every still-live handler.

## Reviewed controls and configuration

- **Enquiry rate limiting:** Uses only Cloudflare's `CF-Connecting-IP`,
  ignores arbitrary forwarding headers, normalizes IPv4-mapped IPv6 addresses,
  and groups IPv6 clients by `/64`. Missing or invalid IPs and rate-limiter
  errors fail closed. Limit denial returns HTTP 429 with `Retry-After`.
- **CORS:** Uses a restrictive explicit origin allow-list, returns no wildcard,
  and rejects unapproved preflight requests with HTTP 403. CORS is not an
  authorization mechanism.
- **Admin and R2 mutations:** Access verification remains unimplemented and
  fail-closed. Unauthenticated admin requests and R2 uploads/deletions remain
  HTTP 401. Keep mutations disabled until Phase 3 authentication and upload
  controls are implemented and tested.
- **Turnstile:** Worker enquiry handling rejects missing credentials and
  unsuccessful verification.
- **CMS:** Public CMS routes are read-only.
- **Secrets:** No hardcoded credentials were identified in the reviewed source.
- **Environment targeting:** Development, deployment, and migration scripts
  explicitly select `--env dev`. The verified dev D1 ID and R2 bucket name are
  preserved; the base config is non-public and has a placeholder D1 ID.

Cloudflare's native rate limiter is approximate and enforced independently per
Cloudflare location; it is not a strict global quota.

## Validation

- Worker TypeScript typecheck: passed.
- Worker unit tests: 5 passed.
- Wrangler `--env dev` dry-run build: passed and resolved the intended D1, R2,
  rate-limit, and development-variable bindings.
- Local endpoint checks: approved CORS passed; unapproved preflight returned
  403; unauthenticated admin and R2 mutation requests returned 401; missing
  Turnstile credentials failed closed with 422; the sixth request after five
  attempts returned 429.
- CMS routes were confirmed read-only by review. Runtime CMS checks were not
  performed against the isolated local database because it had no schema; no
  migrations were run.

No remote preview or deployment was performed during the audit.

## Deployment readiness

The Worker can be targeted to the development environment, subject to separate
authorization. Overall Phase 2 enquiry readiness is not a pass until the legacy
`/api/send-enquiry` path is protected or removed. Do not route production
frontend traffic to the Worker as part of this review.
