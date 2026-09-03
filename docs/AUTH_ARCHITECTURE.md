# INTERVUE AI — Authentication Architecture

> **Document Status:** Implemented — Stage 2 (Database + Auth Foundation)
> **Date:** 2026-09-02

---

## Decision: Custom JWT in httpOnly Cookie (No NextAuth)

### What was chosen

A **custom stateless JWT session** stored in an `httpOnly` cookie, implemented using the `jose` library.

### Why NOT NextAuth / next-auth v5

| Reason | Detail |
|---|---|
| Unnecessary complexity | NextAuth requires adapters, providers, and callbacks not needed for simple email/password auth |
| Dependency weight | NextAuth v5 + Prisma adapter adds significant bundle size |
| Transparency | Custom JWT is fully auditable — no "magic" under the hood |
| Future flexibility | Custom session layer is easier to extend for our specific needs |

NextAuth would be appropriate if OAuth providers (Google, GitHub) are added in a future stage.

---

## Session Implementation

### Library

**`jose`** — Web Crypto API-based JWT library.
- Works in Node.js AND Next.js Edge Runtime
- No native binary dependencies (unlike `jsonwebtoken`)
- Actively maintained, standards-compliant

### Algorithm

**HS256** (HMAC-SHA256) — symmetric signing using `AUTH_SECRET`.

### Token Contents

```typescript
interface SessionPayload {
  userId: string    // Prisma User.id (cuid)
  email: string     // User email (for quick reference)
  name: string      // User name (for quick reference)
  iat: number       // Issued at (set by jose)
  exp: number       // Expiration (7 days from issue)
}
```

### Cookie Configuration

| Property | Value | Reason |
|---|---|---|
| `httpOnly` | `true` | JavaScript cannot read it — XSS-safe |
| `secure` | `true` (prod) / `false` (dev) | HTTPS-only in production |
| `sameSite` | `'lax'` | CSRF protection for navigation links |
| `maxAge` | 7 days | Balances security with user convenience |
| `path` | `/` | Cookie sent with all requests |

### Cookie Name

`intervue_session`

---

## Password Hashing

**`bcryptjs`** — pure JavaScript bcrypt implementation.

- Cost factor: **12** (recommended production minimum)
- At cost 12: ~300ms per hash on modern hardware (intentionally slow)
- No native binary compilation needed (works on Vercel serverless)
- `bcrypt.compare()` is constant-time — safe against timing attacks

---

## API Routes

### `POST /api/auth/register`

```
1. Parse JSON body
2. Validate with Zod (name, email, password rules)
3. Check for existing email → 409 if duplicate
4. Hash password: bcrypt(password, 12)
5. Create User + UserPreference in DB transaction
6. Create JWT session → set cookie
7. Return: { user: { id, name, email } }
```

**Never returns:** passwordHash

### `POST /api/auth/login`

```
1. Parse JSON body
2. Validate with Zod
3. Find user by email
4. If not found: run dummy bcrypt to normalize timing → 401
5. Compare password hash: bcrypt.compare()
6. If mismatch → 401 (same message as "not found")
7. Create JWT session → set cookie
8. Return: { user: { id, name, email } }
```

**Anti-enumeration:** identical error message for "user not found" and "wrong password".

### `POST /api/auth/logout`

```
1. Clear session cookie (set maxAge: 0)
2. Return: { success: true }
```

Idempotent — safe to call without an active session.

### `GET /api/auth/me`

```
1. Read session cookie
2. Verify JWT signature → 401 if invalid/expired
3. Query DB by userId → 404 if user deleted
4. Return: safe user profile (passwordHash excluded)
```

---

## Route Protection

### Next.js Middleware (`middleware.ts`)

Runs at **Edge** before any page renders. Checks cookie **presence** only (no DB call — fast).

```
Public paths always allowed:  /, /login, /register
API auth paths always allowed: /api/auth/*
Static assets always allowed:  /_next/*, /favicon*, *.ico, *.png, ...
All other paths:
  → No cookie → redirect to /login?from=<original_path>
  → Cookie present → allow through
```

**Important:** Middleware checks cookie presence only. Full JWT cryptographic verification happens inside API route handlers. For page routes, the client calls `/api/auth/me` on mount to confirm the session is still valid.

### Login → Authenticated Redirect

If a user with a valid session visits `/login` or `/register`, middleware redirects them to `/dashboard` automatically.

---

## Validation

**`zod`** is used for server-side input validation on all auth routes.

| Rule | Register | Login |
|---|---|---|
| Name | Required, 1–100 chars | — |
| Email | Required, valid format, lowercased | Required, valid format, lowercased |
| Password | Required, 8–128 chars | Required, 1–128 chars |
| Confirm password | Client-side match check | — |

Server-side validation is mandatory. Client-side validation (HTML `required`, `type="email"`) is a convenience only.

---

## Security Properties

| Property | Status |
|---|---|
| Passwords hashed | ✅ bcrypt, cost 12 |
| Plaintext passwords stored | ❌ Never |
| passwordHash returned to client | ❌ Never |
| Cookie is httpOnly | ✅ |
| Cookie is Secure in production | ✅ |
| SameSite CSRF protection | ✅ lax |
| JWT signature verified on each request | ✅ |
| User enumeration prevented | ✅ Same error for "not found" / "wrong password" |
| Timing attack prevented on login | ✅ Dummy bcrypt run when user not found |
| Input validated server-side | ✅ Zod |
| Auth state trusted from client-only | ❌ Never |

---

## Known Limitations (Future Stages)

| Limitation | Mitigation |
|---|---|
| No rate limiting on auth endpoints | API is structured to add it easily (e.g., Upstash Redis) |
| No refresh token / token rotation | Acceptable for MVP; add if token theft becomes a concern |
| No email verification | Add in a future stage with Resend/SMTP |
| No password reset flow | Add in a future stage |
| No account lockout after failed attempts | Add with rate limiting in Stage 2b |
| JWT not revocable until expiry | Acceptable; revocation store (Redis) can be added later |

---

## Environment Variables Required

```bash
# Required for authentication to work
AUTH_SECRET=<generate with: openssl rand -base64 32>
DATABASE_URL=postgresql://user:pass@host:5432/intervue_ai
```
